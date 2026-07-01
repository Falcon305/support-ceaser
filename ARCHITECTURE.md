# Architecture

This explains how support-ceaser works, module by module, and why the design choices
are what they are. The short version: the agent is small, the measurement is the point.

## The pipeline

```
docs.json ──[pnpm ingest]──▶ corpus.json (chunks)

                    question
                       │
                       ▼
             ┌──────────────────┐
             │  retrieve(q, k)  │  top-k chunks, each with a relevance score
             └──────────────────┘
                       │
                       ▼
             ┌──────────────────┐
             │  draft(q, chunks)│  LLM → { answer, citations, selfGrade }
             └──────────────────┘
                       │
          retrievalScore│selfGrade
                       ▼
             ┌──────────────────┐
             │      blend       │  confidence = min(retrieval, selfGrade)
             └──────────────────┘
                       │
              confidence < cutoff?
                 ┌─────┴─────┐
               yes           no
                 │            │
                 ▼            ▼
            escalate     answer + citations

Evaluation:
  dataset ──[runEval]──▶ per item: run the agent, judge answered ones ──▶ ScoredItem[]
  ScoredItem[] ──[score]──▶ confusion matrix + rates ──[compareToBaseline]──▶ pass/fail
```

## Modules

### The agent (`src/`)

| File | Responsibility | Key surface |
|------|----------------|-------------|
| `provider.ts` | Map a `provider:model` spec to a model, provider-agnostic | `getModel(spec)` |
| `corpus.ts` | Doc/Chunk types, chunk documents, load/save a corpus | `chunkDoc`, `buildCorpus` |
| `retriever.ts` | Rank chunks against a query | `lexicalRetriever(corpus)` → `Retriever` |
| `draft.ts` | The LLM call that drafts an answer + self-grade | `modelDrafter(spec)` → `Drafter` |
| `blend.ts` | The escalation decision from the two signals | `blend(retrievalScore, selfGrade)` |
| `agent.ts` | The trust loop: retrieve → draft → blend → answer/escalate | `answer(q, retriever, draft, opts)` |

The agent depends on **injected** functions (`Retriever`, `Drafter`), not concrete
implementations. That is what makes it testable without a network and swappable without a
rewrite — `answer()` never imports a model or a provider.

### The eval harness (`evals/`)

| File | Responsibility | Key surface |
|------|----------------|-------------|
| `scorer.ts` | The metrics math | `confusionMatrix`, `rates`, `escalationMetrics`, `citationCorrect`, `score` |
| `report.ts` | Render a report to text | `formatReport(report)` |
| `dataset.ts` | Parse + validate scored items | `parseScoredItems(raw)` |
| `runner.ts` | Run the agent over a dataset and judge the answers | `runEval(items, run, judge)` |
| `judge.ts` | LLM-as-judge + validate it against hand labels | `modelJudge(spec)`, `judgeAgreement` |
| `baseline.ts` | The regression gate | `compareToBaseline(report, baseline, tol)` |

### Entry points

| Command | File | Needs a model? |
|---------|------|----------------|
| `pnpm fetch-docs` | `scripts/fetch-docs.ts` | no (fetches PostHog Markdown) |
| `pnpm fetch-issues` | `scripts/fetch-issues.ts` | no (fetches a repo's closed issues) |
| `pnpm ingest` | `scripts/ingest.ts` | no |
| `pnpm demo` | `evals/demo.ts` | no (deterministic stand-ins) |
| `pnpm eval` | `evals/run.ts` | no (replays a fixtures file) |
| `pnpm eval:live` | `evals/run-live.ts` | yes |
| `pnpm test` | vitest | no |

`src/posthog.ts` (`docUrlsFromIndex`, `docFromMarkdown`) and `src/issues.ts`
(`looksLikeQuestion`, `issueToSeed`) are the pure parsers behind the two fetchers.

## The trust gate

Two signals guard each other:

- **retrieval score** — did we find relevant docs? (from the retriever)
- **self-grade** — can the model actually answer from them? (from the draft)

`confidence = min(retrievalScore, selfGrade)`, and we escalate when `confidence` is below
the cutoff. The `min` is deliberate: a weak score on *either* signal forces an escalation.
Strong retrieval with a low self-grade means the docs looked relevant but did not actually
answer the question; a high self-grade with weak retrieval means the model is confident
about nothing. Both should escalate, and `min` does that in one line.

## Eval methodology (why the numbers are honest)

The metrics are only worth as much as the labels behind them. The decisions that keep them
honest:

- **needs-human labels are human-blind.** Whether an issue "can be answered from the docs"
  is judged by a human reading the issue and the docs, *without* looking at the agent's
  retrieval score. If the gold label used the retrieval score, it would share a signal with
  the agent's own escalation trigger and the escalation metric would be circular.
- **held-out test slice.** The escalation cutoff is tuned on a dev slice; the reported
  number comes from a test slice the tuning never touched. Otherwise the number is *fit*,
  not *measured*.
- **the judge is validated.** `judgeAgreement` measures how often the LLM judge matches
  hand labels before the judge is trusted to grade the set.
- **small-N honesty.** The set is small, so a wrong-answer rate carries a real margin; the
  report shows the number, not a false-precision claim.
- **two CI jobs.** A fast deterministic job (unit tests + fixture replay) can't catch an
  agent-quality regression from a prompt or retrieval change, because it never calls the
  model. So there are two: the deterministic job is the green badge (scorer-code
  correctness), and `eval:live` runs the agent on the held-out set (real quality). Each
  claims only what it proves.

## Extending

**Add a provider.** Add a case to `getModel` in `src/provider.ts`. Anything with an
OpenAI-compatible endpoint needs no new case — use `compatible:<model>` and set
`OPENAI_COMPATIBLE_BASE_URL`.

**Swap lexical retrieval for embeddings.** Implement the `Retriever` interface
(`retrieve(query, k) => Retrieved[]`) with an embedding model + vector store, and pass it
to `answer()`. Nothing else changes — the agent only knows the interface. When you do this,
re-validate the needs-human labels only if you had labeled them against retrieval (we did
not; they are human-blind, so they hold).

**Grow the dataset.** `evals/data/dataset.json` is the eval set (a doc-grounded sample).
Add labeled `EvalItem`s; split into dev/test; lock a `evals/baseline.json` from a real
`eval:live` run. Where the questions come from matters: PostHog's support Q&A is not in
GitHub issues (they are PRs and eng tasks — verified: no question-shaped issues, no
Discussions), so its dataset is authored from the docs. `pnpm fetch-issues` still helps
for products whose issues *are* user questions; it writes an unlabeled seed you then
label human-blind.

## Testing strategy

- **Unit tests** (`*.test.ts`, next to each module) cover the pure logic: the scorer math,
  the blend, the retriever ranking, the parser, the runner orchestration (with fake agent +
  judge), the baseline gate. This is the deterministic CI gate.
- **`pnpm demo`** exercises the whole chain over real sample data with deterministic
  stand-ins for the LLM — an end-to-end smoke test with zero setup.
- **`pnpm eval`** replays a fixtures file through the real scorer/report path.
- **`pnpm eval:live`** is the real thing: the agent, a real model, the dataset, the judge,
  the gate.
