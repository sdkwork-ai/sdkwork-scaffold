# sdkwork-scaffold

repository-kind: standards

Composable repository and application scaffold for SDKWork projects.

`sdkwork-scaffold` turns a single command into a standards-aligned repository baseline plus one or more application surface shells. The generator is intentionally data-driven: template groups and web surfaces are registered in `scaffold.config.mjs`, so a new architecture is a template directory and a registry entry rather than a fork of the CLI.

## Quick Start

From `sdkwork-space`:

```bash
node sdkwork-scaffold/bin/sdkwork-scaffold.mjs \
  --code recruitment \
  --name "SDKWork Recruitment" \
  --domain recruitment \
  --owner sdkwork-platform \
  --target sdkwork-recruitment
```

The command:

1. validates the application code and target;
2. renders the repository template group;
3. renders one web application template group per selected surface (`pc,h5` by default);
4. writes `.sdkwork/scaffold.json` provenance;
5. runs the optional `sdkwork-specs` bootstraps and AGENTS managed-block syncs when `sdkwork-specs` is available;
6. initializes git on `main` and runs `pnpm install` unless disabled;
7. verifies the generated repository contract.

Use `--no-install` for a fast generation-only run, `--no-git` to skip repository initialization, or `--dry-run` to inspect the plan.

## Command Surface

```text
node bin/sdkwork-scaffold.mjs --code <code> --target <directory> [options]
node bin/sdkwork-scaffold.mjs --list
node bin/sdkwork-scaffold.mjs --self-check
```

Options:

| Option | Default | Purpose |
| --- | --- | --- |
| `--code` | required | Lower kebab-case application code. |
| `--target` | required | Empty directory to initialize. |
| `--name` | title-cased code | Human display name. |
| `--owner` | `sdkwork-platform` | Owning team. |
| `--domain` | application code | Canonical domain. |
| `--description` | generated sentence | One-sentence product description. |
| `--app-type` | `APP_REACT` | SDKWork app type. |
| `--surfaces` | `pc,h5` | Web surfaces to generate. |
| `--specs` | sibling `sdkwork-specs` | Canonical standards checkout. |
| `--site-url` | `https://sdkwork.com/apps/sdkwork-<code>` | Public app website. |
| `--no-git` | git enabled | Skip `git init -b main`. |
| `--no-install` | install enabled | Skip `pnpm install`. |
| `--dry-run` | off | Print the plan without writing. |
| `--force` | off | Regenerate a directory carrying `.sdkwork/scaffold.json`. |

`--force` refuses a directory without the scaffold marker. It never treats an arbitrary non-empty directory as a template target.

## Generated Layout

```text
sdkwork-<code>/
  .sdkwork/                  workspace metadata and scaffold provenance
  apis/                      API contract authoring inputs
  apps/
    README.md
    sdkwork-<code>-pc/       PC React/Vite surface
    sdkwork-<code>-h5/       H5 React/Vite surface
  assets/                    governed app media scaffold
  crates/                    Rust backend placement
  deployments/               deployment descriptors
  docs/                      Canon PRD and technical architecture
  etc/                       source-controlled deployment/runtime profiles
  examples/                  runnable examples
  jobs/                      schedules and batch descriptors
  plugins/                   shipped product plugins
  scripts/                   thin command entrypoints
  sdks/                      SDK family workspace
  specs/                     repository/application contracts
  tests/                     contract verification
  tools/                     reusable tooling
  AGENTS.md
  CLAUDE.md / CODEX.md / GEMINI.md
  agent.app.config.json
  package.json
  pnpm-workspace.yaml
  tsconfig.base.json
```

The generated root exposes the standard pnpm lifecycle:

```bash
pnpm dev
pnpm dev:standalone
pnpm dev:cloud
pnpm stop
pnpm build
pnpm test
pnpm check
pnpm verify
pnpm clean
```

`pnpm build` produces `apps/*/dist/<deployment-profile>/<environment>/`.

## Extending The Scaffold

### Add a web surface

1. Add a descriptor to `WEB_SURFACES` in `scaffold.config.mjs` (`id`, `title`, `devPort`, `componentType`, architecture and UI specs).
2. Reuse `templates/web-app/` when the surface is React/Vite, or add a new template group.
3. Add the surface to `DEFAULT_SURFACES` only if every new project should receive it.
4. Cover it in `tests/scaffold.test.mjs`.

### Add a new template group

Add an entry to `TEMPLATE_GROUPS`:

```js
{
  id: 'rust-service',
  template: 'rust-service',
  target: 'crates/sdkwork-__APP_CODE__-service',
  description: 'Rust service foundation.',
}
```

For a per-surface group, set `perSurface: true` and use `__SURFACE__` in the target path. The renderer copies every file under `templates/<template>/`, substitutes `__TOKEN__` variables in both paths and contents, and rejects unresolved tokens.

### Template variables

| Variable | Meaning |
| --- | --- |
| `__APP_CODE__` | Application code. |
| `__APP_NAME__` | Display name. |
| `__APP_OWNER__` | Owning team. |
| `__APP_DOMAIN__` | Domain. |
| `__APP_DESCRIPTION__` | Description. |
| `__APP_TYPE__` | SDKWork app type. |
| `__APP_IDENTIFIER__` | Dotted package/bundle identifier. |
| `__APP_SITE_URL__` | Public app website. |
| `__APP_INITIALS__` | Brand initials. |
| `__GENERATED_AT__`, `__GENERATED_DATE__` | Generation timestamp/date. |
| `__GENERATOR_VERSION__` | Scaffold version. |
| `__SPECS_REL__` | Relative path from the repository root to `sdkwork-specs`. |
| `__SPECS_TOOLS_REL__` | Relative path to `sdkwork-specs/tools`. |
| `__SURFACE__`, `__SURFACE_TITLE__`, `__SURFACE_PORT__` | Current web surface. |
| `__APP_ROOT_REL__`, `__APP_PACKAGE_NAME__` | Current surface root and package name. |
| `__SPECS_REL_FROM_APP__` | Relative path from the surface root to `sdkwork-specs`. |
| `__SURFACE_ARCHITECTURE_SPEC__`, `__SURFACE_UI_SPEC__` | Surface standards. |
| `__SURFACE_COMPONENT_TYPE__` | Component type for the surface. |
| `__SURFACE_LIST_JSON__` | Selected surfaces as a JSON array. |
| `__APP_SURFACE_TABLE__` | Markdown table rows for selected surfaces. |

Variables are defined in `lib/generator.mjs`; self-check renders every template for every registered surface, so an unknown or unresolved token fails CI.

## Verification

```bash
pnpm test
pnpm check
```

The local checks cover argument validation, template self-check, generation to a temporary directory, refusal to overwrite arbitrary directories, subset surface generation, and generated repository contract checks.

When a `sdkwork-specs` sibling exists, the generated project also carries the tool-owned AGENTS managed blocks and the canonical app-assets scaffold.

## Design Rules

- Standard project-root dictionary only; no repository-root `packages/`, `src/`, or `config/`.
- PC and H5 are separate architecture roots with one package each.
- Generated output is scaffold-owned until regeneration; `--force` is guarded by a marker.
- No fabricated media, credentials, runtime state, or environment values.
- Template paths are relative and may not escape the target directory.
- The scaffold never copies global standard bodies into generated repositories; it links them by relative path.

## Current Scope

The scaffold currently generates:

- repository/application baseline;
- Canon documentation;
- PC and H5 React/Vite shells;
- standard pnpm lifecycle;
- local contract verification.

It does not generate a product workflow, backend runtime, database module, generated SDK family, or release workflow. Those are added after a validated requirement and architecture decision so the scaffold does not pre-commit a product to an unnecessary runtime shape.

## Canonical Standards

- [SDKWork standards](../sdkwork-specs/README.md)
- [Workspace standard](../sdkwork-specs/SDKWORK_WORKSPACE_SPEC.md)
- [Repository baseline](../sdkwork-specs/REPOSITORY_BASELINE_SPEC.md)
- [pnpm script standard](../sdkwork-specs/PNPM_SCRIPT_SPEC.md)
- [Application standard](../sdkwork-specs/APPLICATION_SPEC.md)
- [Component specs](../sdkwork-specs/COMPONENT_SPEC.md)
