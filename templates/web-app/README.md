# __APP_PACKAGE_NAME__

__SURFACE_TITLE__ surface root for `sdkwork-__APP_CODE__`.

- Architecture: `__SURFACE_ARCHITECTURE_SPEC__`
- UI standard: `__SURFACE_UI_SPEC__`
- Dev port: `__SURFACE_PORT__`
- Package: `__APP_PACKAGE_NAME__`

## Structure

```text
__APP_ROOT_REL__/
  index.html
  package.json
  specs/
    component.spec.json
  src/
    App.tsx
    main.tsx
    index.css
    vite-env.d.ts
  tsconfig.json
  vite.config.ts
```

`src/` is the shell composition boundary. Add business pages, services, state, and workflow components under `packages/` when the first workflow is implemented. Do not grow business behavior in `App.tsx`.

`src/composition/components.ts` is the generated component registry. `src/composition/sdkClients.ts` constructs the selected TypeScript app SDK clients with one shared base URL and token manager. Per-component settings live in `config/components/<id>.json`.

PC uses the persistent left rail. H5 uses a fixed bottom tab bar with `Overview / Surfaces / Components`; the tab panels are switched in place and respect the safe-area inset.

## Commands

```bash
pnpm --dir __APP_ROOT_REL__ typecheck
pnpm --dir __APP_ROOT_REL__ build
pnpm dev        # from the repository root; starts every selected surface
```

## Build Output

`vite build` writes `dist/<deployment-profile>/<environment>/index.html` plus hashed assets. The default is `dist/standalone/prod`.

## Boundaries

- Do not import another architecture's UI or host implementation.
- Do not build raw HTTP calls or manual auth headers; consume generated SDKs through `src/composition/sdkClients.ts` and service ports.
- Do not add a second SDK inventory outside the generated composition registry.
- Generated SDK output stays under `sdks/`; never hand-edit it.
- Keep `specs/component.spec.json` aligned with public exports, ports, and runtime entrypoints.

See `__SPECS_REL_FROM_APP__/__SURFACE_ARCHITECTURE_SPEC__` and `__SPECS_REL_FROM_APP__/__SURFACE_UI_SPEC__`.
