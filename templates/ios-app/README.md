# __APP_PACKAGE_NAME__

Native iOS surface root for `sdkwork-__APP_CODE__`.

- Architecture: `__SURFACE_ARCHITECTURE_SPEC__`
- UI standard: `__SURFACE_UI_SPEC__`
- Swift module: `__IOS_MODULE_NAME__`
- Bundle id: `__APP_IDENTIFIER__`

## Structure

```text
__APP_ROOT_REL__/
  App/
    App.swift
    ContentView.swift
    Bootstrap/ComponentRegistry.swift
    Resources/Info.plist
  Tests/
  config/components/
  specs/component.spec.json
  Package.swift
  project.yml
```

`App/` is the thin installable target. Feature views, services, and state belong in Swift packages under `packages/sdkwork-__APP_CODE__-ios-mobile-<capability>/`.

## Commands

```bash
swift build
swift test
xcodegen generate   # when XcodeGen is available
```

Open the generated project in Xcode for simulator/device builds. Signing references belong in `config/host/` and must not contain private keys.

## Boundaries

- Do not import React, Flutter, Kotlin, ArkTS, or mini-program UI.
- Construct generated Swift app SDK clients in `App/Bootstrap/`, never in feature views.
- Keep Keychain, push, camera, deep links, and other Apple capabilities behind host adapters.
- Native SDK packages from `specs/components.selected.json` are the only dependency inputs.
