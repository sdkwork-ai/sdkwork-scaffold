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

## Commands

```bash
pnpm --dir __APP_ROOT_REL__ typecheck
pnpm --dir __APP_ROOT_REL__ build
pnpm dev        # from the repository root; starts every selected surface
```

## Build Output

`vite build` writes `dist/<deployment-profile>/<environment>/index.html` plus hashed assets. The default is `dist/standalone/prod`.

## Boundaries

- Do not import the other browser surface's UI.
- Do not build raw HTTP calls or manual auth headers; consume generated SDKs through service ports once APIs exist.
- Generated SDK output stays under `sdks/`; never hand-edit it.
- Keep `specs/component.spec.json` aligned with public exports, ports, and runtime entrypoints.

See `__SPECS_REL_FROM_APP__/__SURFACE_ARCHITECTURE_SPEC__` and `__SPECS_REL_FROM_APP__/__SURFACE_UI_SPEC__`.
