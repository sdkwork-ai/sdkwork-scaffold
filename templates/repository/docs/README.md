# Documentation

Canon documentation for `sdkwork-__APP_CODE__`.

## Canon

- [Product PRD](product/prd/PRD.md)
- [Technical architecture](architecture/tech/TECH_ARCHITECTURE.md)
- [Component integration](components/README.md)
- [Documentation index](INDEX.yaml)

## Layout

- `product/prd/` — product requirements and problem framing.
- `product/requirements/` — requirement records (`REQ-*`).
- `architecture/tech/` — technical architecture Canon and architecture shards.
- `architecture/decisions/` — architecture decision records (`ADR-*`).
- `engineering/plans/` — implementation plans and evidence.
- `engineering/reviews/` — review evidence.
- `guides/developer/` — developer onboarding and workflows.
- `guides/operator/` — operations and deployment guides.
- `runbooks/` — incident and recovery runbooks.
- `changelogs/` — release notes and change history.
- `migrations/` — migration plans and compatibility windows.
- `releases/` — release evidence.

## Rules

- Root `README.md` and `AGENTS.md` link to this index and both Canon documents.
- Keep each document focused and linked from its directory index.
- Do not duplicate global `sdkwork-specs` rule bodies here; link the authority instead.
- Record requirements, architecture decisions, and plans with stable ids when they become durable.

Follow `__SPECS_REL__/DOCUMENTATION_SPEC.md`.
