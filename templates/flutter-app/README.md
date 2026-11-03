# __APP_PACKAGE_NAME__

Flutter mobile surface root for `sdkwork-__APP_CODE__`.

- Architecture: `__SURFACE_ARCHITECTURE_SPEC__`
- UI standard: `__SURFACE_UI_SPEC__`
- Dart package: `__DART_PACKAGE_NAME__`
- Platform output: iOS and Android Flutter targets

## Structure

```text
__APP_ROOT_REL__/
  lib/
    main.dart
    app.dart
    theme/
      app_theme.dart
    composition/
      architecture_registry.dart
      component_registry.dart
  test/
  config/components/
  specs/component.spec.json
  pubspec.yaml
```

`lib/` stays thin: app entry, root shell, component registry, and bootstrap wiring. The shell uses a Material 3 bottom `NavigationBar` with `Overview / Surfaces / Components / Me`. Feature screens belong in `packages/__DART_PACKAGE_NAME__-<capability>/`.

## Commands

```bash
flutter pub get
flutter analyze
flutter test
```

Generated Dart/Flutter SDK dependencies are appended to `pubspec.yaml` from the selected component registry.

## Boundaries

- Do not import React or native platform UI packages.
- Do not construct SDK clients inside feature widgets; inject them from `lib/composition/` or the core package.
- Keep platform plugins behind typed host adapters.
- Generated SDK output is not edited by hand.
