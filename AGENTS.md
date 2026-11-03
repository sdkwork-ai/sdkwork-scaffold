# Repository Guidelines

## SDKWORK Soul

Read `../sdkwork-specs/SOUL.md` before executing repository tasks. Evidence before completion; stop on ambiguity.

## SDKWORK Standards

This repository follows `../sdkwork-specs/README.md`. It is a tooling/standards repository, not an application. Do not copy global standard bodies locally.

## Application Identity

`repository-kind: standards`. There is no `agent.app.config.json`; this repository owns the project generator, templates, and generator tests.

## Local Dictionary Structure

- `bin/` — CLI entrypoint.
- `lib/` — argument parsing, variable creation, template rendering, generation, and verification.
- `templates/` — repository and app-surface template groups.
- `tests/` — generator unit and integration tests.
- `scaffold.config.mjs` — template and surface registry.

## Spec Resolution Order

1. This `AGENTS.md`.
2. `scaffold.config.mjs` and the nearest template.
3. `../sdkwork-specs/README.md`.
4. Task-specific global specs.
5. Implementation files.

## Required Specs By Task Type

| Task | Required specs |
| --- | --- |
| Generator code | `CODE_STYLE_SPEC.md`, `NAMING_SPEC.md`, `TYPESCRIPT_CODE_SPEC.md` |
| Template change | the generated artifact's owning global spec (workspace, app manifest, PC/H5 architecture, component specs) |
| Generated repository baseline | `SDKWORK_WORKSPACE_SPEC.md`, `REPOSITORY_BASELINE_SPEC.md`, `DOCUMENTATION_SPEC.md` |
| Generated app surface | `APPLICATION_SPEC.md`, `APP_PC_ARCHITECTURE_SPEC.md` / `APP_H5_ARCHITECTURE_SPEC.md`, the matching UI spec |
| Delete or overwrite | `DESTRUCTIVE_OPERATION_SPEC.md`, `CODE_STYLE_SPEC.md` §8 |
| Repair or restore | `ROLLBACK_RESTRICTION_SPEC.md`, `SOUL.md` §5.1 |

## Code Style Rules

- Keep the CLI thin; generation logic belongs in `lib/`.
- Validate all user input before touching the filesystem.
- Refuse non-empty targets unless a scaffold marker and `--force` are present.
- Never render a path outside the target root.
- Reject unknown and unresolved template tokens.
- Tests must not depend on a live `sdkwork-specs` checkout or network.

## Build, Test, and Verification

```bash
pnpm test
pnpm check
node bin/sdkwork-scaffold.mjs --list
```

## Agent Execution Rules

- Run `pnpm check` after template changes.
- When changing a generated file, change the template and generator test, not a generated project.
- Do not add fixture projects or generated output to this repository.
- Development happens on `main`.

## App SDK Consumer Imports

Not applicable. This repository generates no SDK client and consumes no generated SDK.

## HTTP API Response Envelope

Not applicable. This repository owns no HTTP API.

## Human Review Rules

Review is required for changes to the generated root layout, app manifest template, agent entrypoints, lifecycle command surface, overwrite behavior, or template-variable contract.
