# sdkwork-scaffold Technical Architecture

Status: active
Owner: sdkwork-platform
Specs: SDKWORK_WORKSPACE_SPEC.md, AGENTS_SPEC.md, CODE_STYLE_SPEC.md, APP_COMPOSITION_SPEC.md

## 1. Purpose

Generate a standards-aligned SDKWork repository plus one or more architecture-specific application roots and a resolved common-component composition from one command.

## 2. Layers

```text
bin/sdkwork-scaffold.mjs   CLI and user-facing result
lib/arguments.mjs          validation and normalization
lib/generator.mjs          plan, variables, filesystem writes, post-generation automation
lib/components.mjs         sdk-manifest resolution and per-architecture compatibility
lib/composition.mjs        component registry, SDK clients, configs, docs, app specs
lib/template.mjs           safe template traversal and token rendering
lib/icon.mjs               deterministic PNG icon generation
lib/verify.mjs             local generated-repository contract checks
scaffold.config.mjs        architecture and template-group registry
components.config.mjs      common-component catalog
templates/                 authored template groups per architecture
```

## 3. Architecture Registry

Eight architectures are registered: `pc`, `h5`, `pad`, `ios`, `android`, `harmony`, `flutter`, `mini-program`. Each descriptor owns:

- canonical root suffix and template group
- runtime family/framework/default platform
- component type and architecture/UI specs
- platform publication lanes
- optional dev port for web roots

A new architecture is a descriptor, a template directory, a group entry, a verifier file list, and a test-matrix row.

## 4. Component Resolution

Components declare a repository and SDK family. The resolver reads `<repo>/sdks/<family>/sdk-manifest.json` and maps the architecture language:

| Architecture | Preferred SDK languages |
| --- | --- |
| pc, h5, pad, mini-program | typescript |
| flutter | flutter, dart |
| ios | swift |
| android | kotlin, java |
| harmony | arkts, typescript |

Resolution records availability, package name, path, API surface, credential mode, and a reason when unsupported. Linked TypeScript components add real package dependencies; Flutter components add path dependencies; native roots receive a component registry and an integration plan. Missing or incomplete transport packages degrade to `Plan` rather than broken imports.

## 5. Standard Capabilities

Every generated application receives `specs/capabilities/catalog.json` with the
standard `foundation`, `surfaces`, `components`, `runtime`, and `me` capabilities.
`docs/capabilities/ME.md` defines the account/IAM contract; web surfaces receive:

- `src/account/iam-account.ts` — password login, refresh, current session/profile,
  organization/login-context selection, sign-out, token persistence.
- `src/account/account-store.ts` — cross-tab account snapshot propagation.
- `src/account/use-iam-account.ts` — runtime hook and sign-in state.
- `src/composition/sdkRuntime.ts` — one shared token manager for every SDK client.
- `src/appbase/runtime.ts` and `src/appbase/AppErrorBoundary.tsx` — environment
  resolution and failure containment through `src/main.tsx`.

`social-login` is a second identity capability. IAM owns provider discovery,
secrets, and callbacks; each client owns only its allowlist and presentation.
Flutter projects generate a provider-agnostic port/adapter module under
`lib/auth/social/`, backed by `specs/capabilities/social-login.contract.json`.

## 6. Visual Baseline

Generated clients use the `sdkwork-doctor` tech-blue system: `#f2f5fa` canvas, `#ffffff` surfaces, `#e6edf8` tonal rows, `#061a3a` chrome, `#0a5cff` accent, 14/10px radii, zero borders/shadows/gradients.

- PC: 88px navy icon rail, white panels, tonal stats and component cards.
- Pad: rail or compact chrome depending on width; responsive panel columns.
- H5: fixed bottom tab bar with `Overview / Surfaces / Components / Me`, safe-area inset, no rail.
- Flutter: `NavigationBar` with four destinations; `lib/theme/app_theme.dart` carries the tokens into Material 3.
- iOS: `TabView` with four tabs and the SwiftUI light palette.
- Android: Material 3 `NavigationBar` with four items, zero elevation.
- HarmonyOS: ArkUI `Tabs` with `BarPosition.End`, light canvas, white cards.
- Mini program: custom fixed bottom tab bar with four items, white cards, tonal rows, blue accent.

The generated app icon uses the same tech-blue mark.

## 7. Presets And Matrix

Common component sets are declared as presets (`foundation`, `communication`, `commerce`, `content`, `ai`, `platform`) and merged with explicit `--components` selections. Presets are convenience only; the resolved component list remains explicit in `specs/components.selected.json`.

`scripts/regression-matrix.mjs` generates every architecture in isolation and runs the available toolchain checks. It is the repeatable regression entrypoint for architecture templates and component resolution.

## 8. Composition Artifacts

- `specs/components.selected.json` —machine selection and resolution.
- `config/components/<id>.json` —per-component configuration.
- `docs/components/` —human integration records.
- `apps/<root>/src/composition/` —web/tablet registry and SDK client factory.
- `apps/<root>/lib/composition/` —Flutter registry.
- native `ComponentRegistry.*` —Swift, Kotlin, ArkTS registries.
- `apps/<root>/specs/integration.plan.json` —per-architecture SDK plan.

## 9. Template Contract

- Every template is a directory under `templates/`.
- Text templates use `__UPPER_SNAKE__` tokens and must resolve from `createVariables` / `createArchitectureVariables`.
- Paths are relative, may not contain `..`, and resolve inside the target root.
- Architecture groups render once per selected architecture; the repository group renders once.
- `--self-check` renders every template for every architecture and fails on unknown tokens.
- Binary media is generated by code, not embedded in text templates.

## 10. Safety

- A non-empty target is refused unless it carries `.sdkwork/scaffold.json`.
- `--force` is refused for an unrecognized target.
- Template traversal rejects symlinks and path escapes.
- No credentials, environment values, runtime state, or fabricated screenshots are generated.
- The scaffold icon is a deterministic authored PNG, explicitly marked for replacement.

## 11. Post-Generation

When `sdkwork-specs` is available:

1. `bootstrap-repository-docs.mjs` scaffolds missing Canon directories.
2. `bootstrap-app-assets.mjs` scaffolds the app-assets tree and capture config.
3. AGENTS managed-block sync tools add naming, destructive-operation, rollback, main-branch, and SDK-generation blocks for the repository and every app root.

Failures are reported and do not corrupt the generated source tree.

## 12. Verification

```bash
pnpm check
```

Covers argument validation, self-check, generation, overwrite safety, all architecture templates, component resolution, component config, unsupported-language degradation, token resolution, and generated repository contracts.
