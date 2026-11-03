# __APP_NAME__ Technical Architecture

Status: draft
Owner: __APP_OWNER__
Updated: __GENERATED_DATE__
Specs: ARCHITECTURE_DECISION_SPEC.md, DOCUMENTATION_SPEC.md

## Document Map

- Add `TECH-<topic>.md` shards in this directory when the architecture grows beyond one reviewable screen.

## 1. Architecture Overview

`sdkwork-__APP_CODE__` is initialized as an SDKWork application with __APP_SURFACE_COUNT__ browser surface(s): __SELECTED_SURFACES__.

The app shells are thin React/Vite composition roots. Business behavior, service ports, generated SDK clients, and route contributions are added later under the owning architecture standard.

## 2. Technology Choices

| Concern | Choice |
| --- | --- |
| Language | TypeScript, strict mode |
| UI | React 19 |
| Build | Vite |
| Package manager | pnpm workspace |
| Browser surfaces | __SELECTED_SURFACES__ |
| Local verification | `pnpm check`, `pnpm test`, `pnpm build` |

## 3. System Boundaries And Modules

- `apps/sdkwork-__APP_CODE__-<surface>/` — application surface roots.
- `apps/sdkwork-__APP_CODE__-<surface>/src/` — shell bootstrap, layout, and entry only.
- `apps/sdkwork-__APP_CODE__-<surface>/packages/` — add business packages here when the first workflow is implemented.
- `apis/` — API contracts when the application owns HTTP/RPC surfaces.
- `crates/` — Rust route, service, repository, and host crates when a backend is added.
- `sdks/` — generated SDK families. Generated output is generator-owned.
- `etc/` — deployment/runtime profiles.

## 4. Directory And Package Layout

__APP_SURFACE_TABLE__

## 5. API, SDK, And Data Ownership

No API authority or generated SDK is owned at scaffold time. Before adding one:

1. Capture the requirement and architecture decision.
2. Define the API contract under `apis/`.
3. Add the route crate or controller and materialize the authority OpenAPI.
4. Generate the SDK family under `sdks/` with the canonical `sdkgen` pipeline.
5. Wire the generated client through app bootstrap and a service port.

Follow `__SPECS_REL__/API_SPEC.md`, `__SPECS_REL__/SDK_SPEC.md`, and `__SPECS_REL__/SDK_WORKSPACE_GENERATION_SPEC.md`.

## 6. Security, Privacy, And Observability

- Do not commit secrets or concrete environment values.
- Authenticated flows must use appbase IAM runtime and a single global TokenManager when login is added.
- Treat all user content as private by default and record data residency constraints before deployment.
- Add structured logs, metrics, and traces with the first runtime service.

Follow `__SPECS_REL__/SECURITY_SPEC.md`, `__SPECS_REL__/PRIVACY_SPEC.md`, and `__SPECS_REL__/OBSERVABILITY_SPEC.md`.

## 7. Deployment And Runtime Topology

The scaffold currently builds static browser artifacts under `apps/*/dist/<deployment-profile>/<environment>/`. No server runtime or container is defined. Add `specs/topology.spec.json`, `etc/topology/`, and deployment descriptors before introducing a deployable API runtime.

Follow `__SPECS_REL__/APP_RUNTIME_TOPOLOGY_SPEC.md` and `__SPECS_REL__/DEPLOYMENT_SPEC.md`.

## 8. Architecture Decision Index

No ADR is recorded at scaffold time. Add `ADR-*` records under `docs/architecture/decisions/` when a durable boundary or technology choice is made.

## 9. Verification

```bash
pnpm check
pnpm test
pnpm build
node __SPECS_REL__/tools/audit-repository-baseline.mjs --root .
node __SPECS_REL__/tools/check-workspace-layout.mjs --root .
```
