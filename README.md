# support-ceaser

[![ci](https://github.com/Falcon305/support-ceaser/actions/workflows/ci.yml/badge.svg)](https://github.com/Falcon305/support-ceaser/actions/workflows/ci.yml)

A support agent that answers from a product's docs, scores its own confidence, cites
its sources, and escalates to a human instead of guessing when it can't ground an
answer. The interesting part isn't the answering — it's measuring *when the agent
should refuse*, and gating that quality in CI.

PostHog's public docs are the worked example.

## Why

A retrieval chatbot over docs is easy and everywhere. The hard, useful part is the
decision *not* to answer — and proving it works. This repo treats refusal as a
measured property: every answer carries a confidence and a citation, low-confidence
questions get escalated, and an eval harness scores both answer accuracy and
escalation correctness on a labeled set.

## How it's evaluated

The eval set is built from closed PostHog issues, split into two buckets:

- **answerable-from-docs** — tests answer accuracy and citation correctness.
- **needs-human** — tests escalation. Labeled *blind to the agent's retrieval score*,
  so the gold label and the agent's own trigger don't share a signal and the metric
  stays honest.

Kept honest in a few more ways:

- A held-out test slice the threshold is never tuned on, so the reported number is
  measured, not fit.
- The LLM judge that grades answers is itself validated against hand labels.
- The set is small, so results carry their margin — no false precision.

CI runs in two parts: a fast deterministic job (scorer unit tests over cached
fixtures — the badge above) and a separate live job that runs the agent on the
held-out set.

## How it works

```
docs ──ingest──▶ corpus (chunks)

question ─▶ retrieve (top-k + score) ─▶ draft answer + self-grade (LLM)
                     │                            │
                     └──────────── blend ─────────┘
                                     │
                       confidence < cutoff ?  ──yes──▶ escalate
                                     │ no
                                     ▼
                              answer + citation

eval: judge vs gold ─▶ confusion matrix + rates ─▶ regression gate
```

- `src/retriever.ts` — lexical retrieval (a real embedding retriever drops in behind the
  same interface)
- `src/agent.ts` — the trust loop; `src/blend.ts` — escalate on the weaker of retrieval
  relevance and the model's self-grade
- `src/draft.ts`, `evals/judge.ts` — the provider-agnostic LLM calls
- `evals/scorer.ts` — the metrics; `evals/baseline.ts` — the regression gate

## Status

The pipeline is built end-to-end and tested: ingest → retrieve → answer (gated) → judge
→ score → regression gate. It runs offline with a local Ollama model, or against any
provider key. Next: grow the curated dataset to the full answerable / needs-human split
and lock a baseline number.

## Models

Provider-agnostic via the Vercel AI SDK — pick a model with a `provider:model` spec:

- `anthropic:claude-sonnet-4`, `openai:gpt-4o`, `deepseek:deepseek-chat`
- `compatible:<model>` for any OpenAI-compatible endpoint (Qwen, Moonshot, Zhipu,
  Groq, OpenRouter) via `OPENAI_COMPATIBLE_BASE_URL`
- `ollama:<model>` to run locally for free, no key

Set the matching key in `.env.local` (see `.env.example`).

## Prior art

Builds on existing work in selective prediction and RAG evaluation (Ragas, TruLens,
DeepEval, the RAG triad). The point here isn't a new metric — it's a small, honest,
end-to-end harness over one real product's docs.

## Develop

```
pnpm install
pnpm test          # unit tests — the deterministic CI gate
pnpm ingest        # docs.json -> chunked corpus.json
pnpm demo          # run the whole chain over the sample data, no model needed
pnpm eval          # replay a fixtures file -> report
pnpm eval:live     # run the agent over the dataset with a real model
```

`pnpm demo` runs retrieve → gate → judge → score on the bundled sample data with
deterministic stand-ins for the LLM, so you can see the pipeline end-to-end with zero
setup:

```
support-ceaser eval — 8 items

  answered ✓   4
  answered ✗   0
  escalated    4

  coverage             50.0%
  wrong-answer rate    0.0%
  escalation           precision 0.75  recall 1.00
```

For `eval:live` with no API key, run a model locally for free:

```
ollama pull llama3.2:1b
MODEL=ollama:llama3.2:1b pnpm eval:live
```

`pnpm eval` over the bundled example prints:

```
support-ceaser eval — 6 items

  answered ✓   2
  answered ✗   2
  escalated    2

  coverage             66.7%
  wrong-answer rate    50.0%
  escalation           precision 1.00  recall 0.67
```
