# .sdkwork Workspace

This directory is source-controlled repository/application development metadata. It is not runtime state, generated SDK output, or user-private data.

## Layout

- `skills/` — repository-local agent skills.
- `plugins/` — repository-local agent plugins.
- `local/` — ignored local-only state.
- `tmp/` — ignored disposable scratch state.
- `cache/` — ignored local caches.
- `secrets/` — ignored local secret references or local-only secret material. Never commit secrets.
- `manual-backups/` — ignored manual backups.
- `scaffold.json` — generated scaffold provenance.

## Rules

- Do not place runtime databases, logs, generated SDK control-plane files, or secrets in tracked paths.
- Generated SDK output has its own `.sdkwork/` directories owned by `sdkgen`; never add repository skills or plugins there.
- Do not commit anything below the ignored local directories.

Follow `__SPECS_REL__/SDKWORK_WORKSPACE_SPEC.md`.
