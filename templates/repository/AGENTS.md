# Repository Guidelines

## SDKWORK Soul

Read `__SPECS_REL__/SOUL.md` before executing repository tasks. Standards before memory, dictionary before context, evidence before completion, stop on ambiguity.

## SDKWORK Standards

This repository follows `__SPECS_REL__/README.md`. Global standards are the single source of truth; do not copy their bodies locally. Use the nearest local `AGENTS.md` and local specs first, then load only the task-specific global specs.

## Application Identity

`agent.app.config.json` owns application identity, registration, app type, runtime family, and release declaration. `etc/` owns concrete deployment/runtime values. The app manifest is not runtime configuration authority.

This repository owns the `__APP_CODE__` application in the `__APP_DOMAIN__` domain.

## Local Dictionary Structure

- `AGENTS.md` — agent execution rules and relative standards entrypoint.
- `agent.app.config.json` — application identity and release declaration.
- `.sdkwork/` — source-controlled local skills, plugins, and workspace metadata. Not runtime state.
- `specs/` — repository/application contracts and, below each module, module-local `component.spec.json`.
- `docs/` — Canon PRD and technical architecture.
- `apps/` — application surfaces. Each child is one architecture root.
- `apis/` — authored API contracts and materialization inputs.
- `sdks/` — SDK families and generated SDK output. Generated output is generator-owned.
- `crates/` — Rust crates when a backend is added.
- `etc/` — source-controlled deployment and runtime profiles.
- `scripts/` — thin command entrypoints.
- `tools/` — reusable developer and operator tooling.
- `tests/` — cross-package and contract verification.
- `external/`, `third_party/`, `vendor/` — optional read-only upstream source. Never modify.

## Spec Resolution Order

1. Current or nearest `AGENTS.md`.
2. `agent.app.config.json` when identity or release is involved.
3. Nearest module `specs/README.md` and `specs/component.spec.json`.
4. Repository/application `specs/` for cross-module contracts.
5. `.sdkwork/README.md`, `.sdkwork/skills/`, and `.sdkwork/plugins/` when relevant.
6. `__SPECS_REL__/README.md` and the task-specific global specs.
7. Implementation files.

Local files may narrow a task but may not contradict global standards.

## Required Specs By Task Type

| Task | Required specs |
| --- | --- |
| Any code change | `CODE_STYLE_SPEC.md`, `NAMING_SPEC.md`, plus the touched language/framework spec |
| TypeScript or Node code | `TYPESCRIPT_CODE_SPEC.md` |
| React UI | `FRONTEND_CODE_SPEC.md`, `FRONTEND_SPEC.md`, `UI_ARCHITECTURE_SPEC.md`, and the matching app architecture and UI spec |
| PC surface | `APP_PC_ARCHITECTURE_SPEC.md`, `APP_PC_REACT_UI_SPEC.md` |
| H5 surface | `APP_H5_ARCHITECTURE_SPEC.md`, `APP_MOBILE_REACT_UI_SPEC.md` |
| App identity or release | `APP_MANIFEST_SPEC.md`, `CONFIG_SPEC.md`, `DEPLOYMENT_SPEC.md` |
| Source config or environment profiles | `SOURCE_CONFIG_SPEC.md`, `CONFIG_SPEC.md`, `ENVIRONMENT_SPEC.md`, `DEPLOYMENT_SPEC.md` |
| API work | `API_SPEC.md`, `WEB_FRAMEWORK_SPEC.md`, `WEB_BACKEND_SPEC.md`, `SDK_SPEC.md`, `TEST_SPEC.md` |
| SDK generation or consumption | `SDK_SPEC.md`, `SDK_WORKSPACE_GENERATION_SPEC.md`, `API_SPEC.md` |
| Build scripts or dev runners | `CODE_STYLE_SPEC.md` §7, `TYPESCRIPT_CODE_SPEC.md` §5, `PNPM_SCRIPT_SPEC.md` §11 |
| Delete, move, overwrite, or reset | `DESTRUCTIVE_OPERATION_SPEC.md`, `CODE_STYLE_SPEC.md` §8 |
| Repair or restore lost content | `ROLLBACK_RESTRICTION_SPEC.md`, `SOUL.md` §5.1 |
| Security or auth | `IAM_SPEC.md`, `IAM_LOGIN_INTEGRATION_SPEC.md`, `SECURITY_SPEC.md`, `PRIVACY_SPEC.md` |

Loading is progressive. Do not eagerly load unrelated language, runtime, UI, deployment, or SDK specs.

## Code Style Rules

- Keep app shells thin: bootstrap, providers, routing, layout, and dependency construction only.
- Business behavior belongs in packages, services, or route crates — not in shell components.
- UI code never builds raw HTTP calls or manual auth headers; consume generated SDKs through injected service ports.
- TypeScript is strict. Avoid `any`, unchecked JSON casts, and type assertions that hide contract drift.
- Use typed errors and safe localized user-facing copy.
- Generated SDK output is never hand-edited. Fix the generation chain and regenerate.
- Public commands use the standard pnpm vocabulary from `PNPM_SCRIPT_SPEC.md`.
- Deletion follows `DESTRUCTIVE_OPERATION_SPEC.md`: enumerate exact paths; never delete by wildcard, glob, recursive walk, `git rm -r`, or `git clean -f*`.
- Defects are fixed forward. Never use git-level rollback as a remedy; restore lost content additively with an explicit enumerated pathspec.

## Build, Test, and Verification

```bash
pnpm install
pnpm check
pnpm test
pnpm build
pnpm verify
```

Record exact commands and outputs. `pnpm build` writes browser artifacts to `apps/sdkwork-__APP_CODE__-<surface>/dist/standalone/prod`.

## Agent Execution Rules

- Read the nearest `AGENTS.md` first, then only the specs required by the task.
- Inspect before editing. Do not claim a command passed without running it.
- Stop and report when a required standard path is unresolved or two authorities conflict.
- Keep changes scoped. Do not rewrite unrelated files, generated output, or another surface.
- Do not commit secrets, credentials, local env files, build output, or user data.
- Development happens on `main`. A detached HEAD or side branch is not an authoring venue.

## App SDK Consumer Imports

This repository currently ships no generated SDK clients. When generated app or backend SDKs are added, follow `__SPECS_REL__/APP_SDK_INTEGRATION_SPEC.md` §9 and import only `@sdkwork/*-app-sdk` or `@sdkwork/*-backend-sdk` package entrypoints. Do not import generated transport internals or construct raw HTTP clients for business flows.

## HTTP API Response Envelope

This repository currently owns no HTTP API operations. When an API surface is added, follow `__SPECS_REL__/API_SPEC.md` §4.5 and §14-§16, including the `SdkWorkApiResponse` envelope, numeric `ProblemDetail` errors, operation patterns, and `check-api-operation-patterns.mjs`. Do not paraphrase or weaken the envelope locally.

## Human Review Rules

Human review is required for API contracts, database migrations, security or auth changes, deployment topology, release configuration, generated-output policy changes, and any destructive operation. Review evidence belongs under `docs/engineering/` when the change is non-trivial.

## Canon Links

- [Documentation index](docs/README.md)
- [Product PRD](docs/product/prd/PRD.md)
- [Technical architecture](docs/architecture/tech/TECH_ARCHITECTURE.md)
- [Local specs](specs/README.md)
- [Workspace metadata](.sdkwork/README.md)
