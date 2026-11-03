# Application Surfaces

`apps/` is a collection of application roots. Each direct child is one selected language/architecture surface, not a generic source directory.

__ARCHITECTURE_TABLE__

## Rules

- Keep each app shell thin: bootstrap, providers, route assembly, layout, and dependency construction only.
- Business screens, services, state, and workflow components belong in packages under the owning app root.
- Each architecture is an independent root. It may share generated SDK contracts and service ports but must not import another architecture's UI or host implementation.
- Browser/tablet roots are React/Vite; Flutter, iOS, Android, HarmonyOS, and mini-program roots use their platform toolchains.
- Every generated app root carries `specs/component.spec.json`, `.sdkwork/`, `AGENTS.md`, and `config/components/`.

See `__SPECS_REL__/APPLICATION_SPEC.md`, `__SPECS_REL__/APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md`, and `__SPECS_REL__/APP_SDK_INTEGRATION_SPEC.md`.
