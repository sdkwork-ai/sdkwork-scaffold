# __APP_PACKAGE_NAME__

Native HarmonyOS surface root for `sdkwork-__APP_CODE__`.

- Architecture: `__SURFACE_ARCHITECTURE_SPEC__`
- UI standard: `__SURFACE_UI_SPEC__`
- Bundle name: `__HARMONY_BUNDLE_NAME__`
- Module: `entry`

## Structure

```text
__APP_ROOT_REL__/
  AppScope/app.json5
  entry/src/main/
    module.json5
    ets/entryability/EntryAbility.ets
    ets/pages/Index.ets
    ets/composition/ComponentRegistry.ets
    resources/
  config/components/
  specs/component.spec.json
  build-profile.json5
  oh-package.json5
```

`entry/` stays thin: ability, root page, and composition only. The root uses ArkUI `Tabs` with `BarPosition.End` and `Overview / Surfaces / Components / Me`. Business pages belong in ArkTS packages under `packages/sdkwork-__APP_CODE__-harmony-mobile-<capability>/`.

## Commands

```bash
hvigorw assembleHap
hvigorw test
```

Use DevEco Studio for signing, emulator/device deployment, and AppGallery packaging.

## Boundaries

- Do not import React, Flutter, Swift, Kotlin, or mini-program UI.
- Construct generated ArkTS/TypeScript app SDK clients in `ets/bootstrap/`, never in pages.
- Keep distributed capabilities, permissions, push, and secure storage behind host adapters.
- `specs/components.selected.json` is the component dependency map.
