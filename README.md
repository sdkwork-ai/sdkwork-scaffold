# sdkwork-scaffold

repository-kind: standards

Composable repository and application scaffold for SDKWork projects.

`sdkwork-scaffold` turns one command into a standards-aligned repository baseline, one or more architecture-specific application roots, and a resolved common-component composition. Architecture and component selection are data-driven registries, not CLI forks.

## Quick Start

Full browser application with IAM and appbase:

```bash
cd D:\sdkwork-space
node sdkwork-scaffold/bin/sdkwork-scaffold.mjs \
  --code recruitment \
  --name "SDKWork Recruitment" \
  --domain recruitment \
  --architectures pc,h5 \
  --components iam,appbase \
  --target sdkwork-recruitment
```

A native-only project:

```bash
node sdkwork-scaffold/bin/sdkwork-scaffold.mjs \
  --code field-app \
  --architectures ios \
  --components iam,im \
  --target sdkwork-field-app
```

A multi-surface project with the common component set:

```bash
node sdkwork-scaffold/bin/sdkwork-scaffold.mjs \
  --code recruitment \
  --architectures pc,h5,pad,ios,android,harmony,flutter,mini-program \
  --components iam,appbase,rtc,im,agents,order,drive \
  --target sdkwork-recruitment
```

## Architecture Registry

| Id | Root | Template | Runtime |
| --- | --- | --- | --- |
| `pc` | `apps/sdkwork-<code>-pc` | React/Vite | web / react |
| `h5` | `apps/sdkwork-<code>-h5` | React/Vite | web / react |
| `pad` | `apps/sdkwork-<code>-pad` | React/Vite | web / react |
| `ios` | `apps/sdkwork-<code>-ios-mobile` | SwiftUI + SPM | mobile / ios-native |
| `android` | `apps/sdkwork-<code>-android-mobile` | Kotlin + Compose | mobile / android-native |
| `harmony` | `apps/sdkwork-<code>-harmony-mobile` | ArkTS + ArkUI | mobile / harmony-native |
| `flutter` | `apps/sdkwork-<code>-flutter-mobile` | Flutter | mobile / flutter |
| `mini-program` | `apps/sdkwork-<code>-mini-program` | TypeScript + WXML | mini-program / weixin |

Select one or many:

```bash
--architectures pc
--architectures pc,h5,pad
--architectures ios
--architectures pc,h5,flutter,mini-program
```

`--surfaces` remains a backward-compatible alias.

## Component Registry

The catalog contains foundations, communication, commerce, content, AI, and platform capabilities. Run `--list-components` for live availability from the sibling repositories.

Foundation and runtime:

- `iam` — login, session, current user, tenant/organization, token lifecycle.
- `appbase` — application foundation, runtime bootstrap, error recovery, feature registry.

Communication:

- `rtc` — realtime audio/video rooms and calls.
- `im` — conversations, messages, contacts, presence.
- `mail` — mailboxes and message threads.
- `messaging` — notification templates, channels, dispatch.

Commerce:

- `order` — orders, checkout, payments, recharges, after-sales, fulfillment.
- `payment` — payment intents, channels, refunds.
- `commerce` — products, SKUs, cart, pricing, inventory.
- `catalog` — categories, taxonomy, dictionaries.
- `membership` — plans, entitlements, subscriptions.
- `promotion` — coupons, campaigns, discounts.

Content and productivity:

- `drive` — storage, upload sessions, media resources.
- `community`, `comments`, `feeds`, `news` — social and editorial capabilities.
- `documents`, `notes`, `assets`, `course`, `music`, `audio` — content capabilities.
- `search` — cross-domain search.

AI:

- `agents`, `image`, `knowledgebase`, `memory`, `voice`, `generations`, `prompts`, `models`, `skills`.

Platform:

- `notary`, `aiot`.

Selection:

```bash
--components iam,appbase,rtc,im,agents,order
--preset foundation,communication
--all-components
--components none
```

Presets:

| Preset | Components |
| --- | --- |
| `foundation` | `iam`, `appbase` |
| `communication` | `rtc`, `im`, `mail`, `messaging` |
| `commerce` | `order`, `payment`, `commerce`, `catalog`, `membership`, `promotion` |
| `content` | `drive`, `community`, `comments`, `feeds`, `news`, `documents`, `notes`, `assets`, `course`, `music`, `audio`, `search` |
| `ai` | `agents`, `image`, `knowledgebase`, `memory`, `voice`, `generations`, `prompts`, `models`, `skills` |
| `platform` | `notary`, `aiot` |

Run `--list-presets` for the live list.

Every component is resolved from its sibling repository `sdks/<family>/sdk-manifest.json`. The generator does not hardcode package paths:

- TypeScript web/pad/mini roots get real SDK package dependencies.
- Flutter roots get Dart/Flutter path dependencies when the package is usable.
- iOS/Android/HarmonyOS roots get a generated component registry plus the resolved SDK integration plan.
- Unsupported or incomplete dependencies are recorded as `Plan` instead of generating broken imports.
- `specs/components.selected.json` is the machine selection and resolution authority.
- `config/components/<id>.json` is the per-component runtime configuration.

### Configure Components

```bash
--component-config ./components.json
```

```json
{
  "components": {
    "iam": {
      "enabled": true,
      "permissions": ["iam.session.read"],
      "config": {
        "loginMode": "embedded",
        "sessionPersistence": "secure-storage"
      }
    },
    "rtc": {
      "enabled": true,
      "config": { "region": "cn", "media": "audio-video" }
    },
    "order": {
      "enabled": false
    }
  }
}
```

`enabled: false` removes a component. Component config never stores credentials; secrets stay in runtime secret storage or the global token manager.

## Generated Layout

```text
sdkwork-<code>/
  .sdkwork/                  workspace metadata and scaffold provenance
  apis/                      API contract authoring inputs
  apps/
    README.md
    sdkwork-<code>-<arch>/    one root per selected architecture
  assets/                    governed app media scaffold
  config/components/         root component configuration view
  crates/                    Rust backend placement
  deployments/               deployment descriptors
  docs/
    components/              per-component integration records
  etc/                       source-controlled deployment/runtime profiles
  specs/
    components.selected.json machine component/SDK resolution
    component.spec.json
  scripts/                   thin command entrypoints
  sdks/                      SDK family workspace
  tests/                     contract verification
  AGENTS.md
  CLAUDE.md / CODEX.md / GEMINI.md
  agent.app.config.json
  package.json
  pnpm-workspace.yaml
  tsconfig.base.json
```

Browser/tablet roots are buildable with Vite. Flutter, iOS, Android, HarmonyOS, and mini-program roots carry their native manifests and toolchain instructions. Native SDK packages are recorded in each root's `specs/integration.plan.json` and component registry.

## Visual Baseline

All generated clients use the tech-blue, flat, borderless visual system of
`sdkwork-doctor`:

| Token | Value | Role |
| --- | --- | --- |
| Canvas | `#f2f5fa` | Page background |
| Surface | `#ffffff` | Cards and panels |
| Surface alt | `#e6edf8` | Nested rows and stat tiles |
| Chrome navy | `#061a3a` | PC rail / H5 app bar |
| Accent | `#0a5cff` | Single action and selection accent |
| Accent strong | `#0747c9` | Hover and emphasis |
| Accent soft | `#e7efff` | Soft action background |
| Ink | `#0a1324` | Primary text |
| Muted | `#5a6b85` | Secondary text |
| Radius | `14px` / `10px` | Panels / controls |

Rules: no card borders, no shadows, no gradients. Separation comes from
canvas/surface/tonal layers. PC uses an 88px navy icon rail. H5, Flutter,
iOS, Android, HarmonyOS, and the mini program use a fixed bottom tab bar with
`Overview / Surfaces / Components / Me`; mobile content switches in place and
respects the safe-area inset. Flutter carries the same tokens in
`lib/theme/app_theme.dart`; iOS, Android, HarmonyOS, and the mini program keep
the same palette in their generated shells.

## Standard Capabilities

Every generated application receives `specs/capabilities/catalog.json`,
`docs/capabilities/ME.md`, and `docs/capabilities/RUNTIME.md`.

The standard `Me` capability is IAM-backed:

- `src/account/iam-account.ts` on web surfaces
- `src/account/account-store.ts` for cross-tab account snapshots
- `src/account/use-iam-account.ts` for the runtime hook and sign-in form
- `@sdkwork/iam-app-sdk` only, never raw HTTP or manual auth headers
- password login: `auth.sessions.create({ grantType: "password" })`
- refresh: `auth.sessions.refresh({ refreshToken })`
- session: `auth.sessions.current.retrieve()` / `.delete()`
- profile: `iam.users.current.retrieve()`
- organization and login-context selection are first-class outcomes
- open-platform sign-in (Apple, Google, Meta, GitHub, X, WeChat) through
  `docs/capabilities/SOCIAL_LOGIN.md`; IAM owns provider secrets and callbacks

The runtime capability installs `src/appbase/runtime.ts` and
`src/appbase/AppErrorBoundary.tsx` through `src/main.tsx`. Missing API
configuration is a valid `api-unconfigured` state, not a crash. The scaffold
renders the `Unavailable` state until a runtime endpoint and token manager are
configured; it does not fake a signed-in user.

## Standard Commands

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

Behavior:

- `dev` starts selected `web` roots only.
- `build` builds `web` roots and typechecks mini-program; Flutter/native roots report that their platform toolchain owns the build.
- `check` typechecks web/mini roots, runs `flutter analyze` when Flutter exists, and runs the SDKWork standards gates.
- `verify` runs check + contract tests + build.
- `clean` removes only enumerated web build output.

## Template Framework

`scaffold.config.mjs` owns architecture and template-group registration. `components.config.mjs` owns the common-component catalog.

Add an architecture:

1. Add an `ARCHITECTURES` descriptor (`suffix`, `template`, `kind`, runtime metadata, specs).
2. Add a `TEMPLATE_GROUPS` entry for its template directory.
3. Add a template under `templates/<name>/`.
4. Add the root file expectations to `lib/verify.mjs`.
5. Cover it in `tests/scaffold.test.mjs`; every architecture is generated independently in the test matrix.

Add a component:

1. Add a `COMPONENTS` entry with `repo` and `sdkFamily` (or `kind: "runtime"` plus `runtimePackages`).
2. Do not hardcode SDK package paths; `sdk-manifest.json` resolves them.
3. Add its category, default config, and permission module id.
4. Re-run `--list-components` and the test matrix.

Template variables include:

| Variable | Meaning |
| --- | --- |
| `__APP_CODE__`, `__APP_NAME__`, `__APP_DOMAIN__` | Application identity |
| `__ARCHITECTURES__`, `__ARCHITECTURE_TABLE__` | Selected architecture set |
| `__PRIMARY_ARCHITECTURE__`, `__RUNTIME_*__` | App manifest runtime projection |
| `__COMPONENT_IDS__`, `__COMPONENT_COUNT__` | Selected components |
| `__ARCHITECTURE_ROOTS_JSON__` | Machine architecture root map |
| `__SPECS_REL__`, `__SPECS_TOOLS_REL__` | Canonical standards paths |
| `__SURFACE__`, `__ARCH_KIND__`, `__SURFACE_PORT__` | Current architecture |
| `__APP_ROOT_REL__`, `__APP_PACKAGE_NAME__` | Current app root/package |
| `__DART_PACKAGE_NAME__`, `__ANDROID_NAMESPACE__`, `__IOS_MODULE_NAME__`, `__HARMONY_BUNDLE_NAME__` | Native identifiers |

## Regression Matrix

Generate every architecture in isolation, install dependencies, and run whatever
toolchain is available on the machine:

```bash
pnpm regression
# or a focused run
node scripts/regression-matrix.mjs --architectures pc,flutter,mini-program --components iam,im,agents
```

The matrix:

- generates one project per architecture under `_scratch/scaffold-matrix-*`;
- runs PC/H5/Pad TypeScript + Vite build;
- runs Flutter `pub get`, `analyze`, and `test`;
- runs mini-program TypeScript checks;
- verifies iOS/Android/HarmonyOS source roots and integration plans statically;
- removes successful projects and keeps failed ones for inspection;
- writes `.sdkwork/tmp/scaffold-regression-matrix.json`.

Current regression result: **8/8 architectures passed** with the core
`iam,appbase,rtc,im,agents,order` selection. PC, H5, Pad, Flutter, and
mini-program ran real toolchain checks; iOS, Android, and HarmonyOS were
static-only because their compilers are not installed in this environment.

## Verification

```bash
pnpm check
```

The scaffold tests cover:

- argument parsing, presets, and configuration
- template self-check for all 7 template groups and 8 architectures
- PC/H5 linked component generation
- every architecture generated independently
- web subsets and component overrides
- all registered components on one web root
- native unsupported-language degradation
- target and `--force` safety
- unresolved template tokens

Generated projects additionally run their own `pnpm check`, contract tests, and web builds. Native toolchain builds remain the responsibility of Xcode, Android Gradle, hvigor, Flutter, and WeChat DevTools.

## Design Rules

- Standard project-root dictionary only; no repository-root `packages/`, `src/`, or `config/`.
- Each architecture is an independent app root with its own component spec and `.sdkwork/`.
- Component SDK paths come from sibling `sdk-manifest.json`; never copy generated transport.
- Component dependencies are linked only when the package is actually usable; otherwise the plan is recorded.
- No fabricated screenshots, credentials, runtime state, or environment values.
- Template paths are relative and may not escape the target directory.
- The scaffold never copies global standard bodies into generated repositories; it links them by relative path.

## Current Boundaries

- Browser/tablet roots have runnable builds.
- Flutter roots have runnable `flutter analyze`/`flutter test` when the Flutter SDK is installed.
- Mini-program roots have TypeScript source and `tsc --noEmit`; projection/build is platform tooling.
- iOS/Android/HarmonyOS roots are source-complete shells with manifests and component integration plans; Xcode/Gradle/hvigor builds require their toolchains.
- Native SDK package-manager wiring and signed release packaging remain platform follow-ups.

## Canonical Standards

- [SDKWork standards](../sdkwork-specs/README.md)
- [Workspace standard](../sdkwork-specs/SDKWORK_WORKSPACE_SPEC.md)
- [Repository baseline](../sdkwork-specs/REPOSITORY_BASELINE_SPEC.md)
- [pnpm script standard](../sdkwork-specs/PNPM_SCRIPT_SPEC.md)
- [Application standard](../sdkwork-specs/APPLICATION_SPEC.md)
- [App composition](../sdkwork-specs/APP_COMPOSITION_SPEC.md)
- [App SDK integration](../sdkwork-specs/APP_SDK_INTEGRATION_SPEC.md)
- [Component specs](../sdkwork-specs/COMPONENT_SPEC.md)
