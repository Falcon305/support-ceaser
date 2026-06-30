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

## Status

Early. The scorer and the eval runner (`pnpm eval`) are built and tested — feed it
scored items and it prints the confusion matrix and rates. The retrieval and answer
loop (multi-provider, via the Vercel AI SDK), the dataset, and the judge come next.

## Prior art

Builds on existing work in selective prediction and RAG evaluation (Ragas, TruLens,
DeepEval, the RAG triad). The point here isn't a new metric — it's a small, honest,
end-to-end harness over one real product's docs.

## Develop

```
pnpm install
pnpm test          # unit tests
pnpm eval          # score a fixtures file and print the report
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
