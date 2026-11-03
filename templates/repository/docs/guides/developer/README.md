# Developer Guide

## Prerequisites

- Node.js 22 or newer.
- pnpm.
- The canonical `sdkwork-specs` sibling checkout.

## Setup

```bash
pnpm install
pnpm dev
```

`pnpm dev` starts the selected browser surfaces. `pnpm build` produces a static artifact per surface under `dist/standalone/prod`.

## Standard Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start local browser surfaces. |
| `pnpm stop` | Stop only processes started by this repository. |
| `pnpm check` | Typecheck and contract checks. |
| `pnpm test` | Contract tests. |
| `pnpm build` | Production browser build. |
| `pnpm verify` | Check, test, and build. |
| `pnpm clean` | Remove enumerated build output. |

## Before Changing Code

Read `AGENTS.md` and load only the task-specific standards. Any new page, service, or API needs the owning architecture standard and a local `component.spec.json`.
