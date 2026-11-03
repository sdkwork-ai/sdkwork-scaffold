# __APP_PACKAGE_NAME__

WeChat mini-program surface root for `sdkwork-__APP_CODE__`.

- Architecture: `__SURFACE_ARCHITECTURE_SPEC__`
- UI standard: `__SURFACE_UI_SPEC__`
- Platform: WeChat mini program
- Source root: `src/`

## Structure

```text
__APP_ROOT_REL__/
  src/
    app.ts
    app.json
    app.wxss
    pages/index/
    composition/components.ts
  types/miniprogram.d.ts
  config/components/
  specs/component.spec.json
  project.config.json
  tsconfig.json
```

`src/` is authored TypeScript. The root uses a custom fixed bottom tab bar with `Overview / Surfaces / Components` and respect for the device safe-area inset. Platform JavaScript is a projection if a build step is added. Business pages belong in source packages projected into pages/subpackages, not directly in the shell.

## Commands

```bash
pnpm --dir __APP_ROOT_REL__ typecheck
```

Open the root in WeChat DevTools with `miniprogramRoot = src/`.

## Boundaries

- No login/session implementation outside the appbase/iam wrapper.
- Do not import React, Flutter, Swift, Kotlin, or ArkTS UI.
- Generated SDK packages are resolved through the selected component contract; do not copy dependency routes or DTOs.
- Keep platform APIs behind typed host adapters.
