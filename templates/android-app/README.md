# __APP_PACKAGE_NAME__

Native Android surface root for `sdkwork-__APP_CODE__`.

- Architecture: `__SURFACE_ARCHITECTURE_SPEC__`
- UI standard: `__SURFACE_UI_SPEC__`
- Namespace: `__ANDROID_NAMESPACE__`
- Min SDK: 26

## Structure

```text
__APP_ROOT_REL__/
  app/
    build.gradle.kts
    src/main/AndroidManifest.xml
    src/main/kotlin/__ANDROID_NAMESPACE_PATH__/
      MainApplication.kt
      MainActivity.kt
      bootstrap/ComponentRegistry.kt
  config/components/
  specs/component.spec.json
  build.gradle.kts
  settings.gradle.kts
```

`app/` stays thin: application, activity, composition, and bootstrap only. Business screens belong in Android library modules under `packages/sdkwork-__APP_CODE__-android-mobile-<capability>/`.

## Commands

```bash
gradle :app:assembleDebug
gradle :app:testDebugUnitTest
```

A Gradle wrapper can be added from the developer machine; generated source contains no credentials or signing material.

## Boundaries

- Do not import React, Flutter, Swift, ArkTS, or mini-program UI.
- Construct generated Kotlin/Java app SDK clients in `bootstrap/`, never in composables.
- Keep Play Services, camera, secure storage, push, and deep links behind host adapters.
- Use `specs/components.selected.json` as the component dependency map.
