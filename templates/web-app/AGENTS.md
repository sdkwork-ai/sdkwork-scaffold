# __APP_PACKAGE_NAME__ Guidelines

## SDKWORK Soul

Read `__SPECS_REL__/SOUL.md` before executing surface tasks. The repository root `AGENTS.md` remains the first authority; this file narrows it for the __SURFACE_TITLE__ surface.

## SDKWORK Standards

This surface follows the repository root `AGENTS.md` and `__SPECS_REL__/README.md`. Do not copy global standards locally.

## Application Identity

Application: `sdkwork-__APP_CODE__`
Surface: `__SURFACE__` (`__SURFACE_TITLE__`)
Architecture standard: `__SURFACE_ARCHITECTURE_SPEC__`
UI standard: `__SURFACE_UI_SPEC__`

The repository root `agent.app.config.json` owns identity. This surface owns only its application root.

## Local Dictionary Structure

- `src/` — thin shell: bootstrap, layout, and entry.
- `packages/` — business packages, added when the first workflow lands.
- `specs/` — local component contract.
- `public/` — browser-served static assets only.
- `config/` — surface-local configuration profiles when needed.
- `tests/` — surface-level tests.

## Spec Resolution Order

1. Repository root `AGENTS.md`.
2. This file and `specs/component.spec.json`.
3. `__SPECS_REL__/README.md`.
4. `__SPECS_REL__/__SURFACE_ARCHITECTURE_SPEC__`.
5. `__SPECS_REL__/__SURFACE_UI_SPEC__`.
6. Implementation files.

## Required Specs By Task Type

| Task | Required specs |
| --- | --- |
| Any code change | `CODE_STYLE_SPEC.md`, `NAMING_SPEC.md`, `TYPESCRIPT_CODE_SPEC.md` |
| UI or page work | `FRONTEND_CODE_SPEC.md`, `FRONTEND_SPEC.md`, `UI_ARCHITECTURE_SPEC.md`, `__SURFACE_UI_SPEC__` |
| Architecture or package boundary | `__SURFACE_ARCHITECTURE_SPEC__`, `APPLICATION_SPEC.md`, `APP_COMPOSITION_SPEC.md` |
| SDK integration | `APP_SDK_INTEGRATION_SPEC.md`, `SDK_SPEC.md`, `CONFIG_SPEC.md` |
| Runtime config | `CONFIG_SPEC.md`, `ENVIRONMENT_SPEC.md`, `SOURCE_CONFIG_SPEC.md` |
| Build runner | `CODE_STYLE_SPEC.md` §7, `TYPESCRIPT_CODE_SPEC.md` §5, `PNPM_SCRIPT_SPEC.md` §11 |

## Code Style Rules

- Keep `src/` thin. Business behavior does not belong in `App.tsx`.
- Use strict TypeScript. No `any`, unchecked casts, or silent error swallowing.
- UI never constructs raw HTTP clients, auth headers, or SDK clients.
- Add feature packages with their own `specs/component.spec.json`.
- Keep accessibility: semantic landmarks, visible focus, reduced-motion support.
- Do not hand-edit generated SDK or build output.

## Build, Test, and Verification

```bash
pnpm --dir __APP_ROOT_REL__ typecheck
pnpm --dir __APP_ROOT_REL__ build
pnpm check
```

## Agent Execution Rules

- Read the repository root `AGENTS.md` before this surface.
- Keep changes scoped to this surface unless the task explicitly spans surfaces.
- Do not edit the other browser surface's UI or copy its shell.
- Stop and report when an architecture or SDK boundary is ambiguous.
- Development happens on `main`.

## App SDK Consumer Imports

No generated SDK client is wired at scaffold time. When one is added, consume only `@sdkwork/*-app-sdk` package entrypoints per `__SPECS_REL__/APP_SDK_INTEGRATION_SPEC.md` §9.

## HTTP API Response Envelope

This surface owns no HTTP API. If a local runtime surface is added, follow `__SPECS_REL__/API_SPEC.md` §4.5 and §14-§16 without weakening the envelope.

## Human Review Rules

Review is required for first-workflow architecture, SDK wiring, auth/session behavior, runtime config, deployment changes, and any new package boundary.
