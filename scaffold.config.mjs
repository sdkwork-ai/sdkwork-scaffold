/**
 * SDKWork scaffold registry.
 *
 * Architecture entries own the generated app root name, template group, runtime
 * metadata, and platform-specific standards. Component entries live in
 * components.config.mjs; their real SDK package paths are resolved from each
 * sibling repository's sdk-manifest.json at generation time.
 */
export const SCAFFOLD_VERSION = '1.5.0';

export const APP_TYPES = [
  'APP_REACT',
  'APP_VUE',
  'APP_HTML',
  'APP_FLUTTER',
  'APP_UNIAPP',
  'APP_UNITY',
  'APP_HARMONY',
  'SDK',
  'PPT',
  'VIDEO',
  'POSTER',
  'NONE',
];

export const ARCHITECTURES = {
  pc: {
    id: 'pc',
    title: 'PC',
    kind: 'web',
    suffix: 'pc',
    template: 'web-app',
    devPort: 4173,
    componentType: 'pc-app',
    architectureSpec: 'APP_PC_ARCHITECTURE_SPEC.md',
    uiSpec: 'APP_PC_REACT_UI_SPEC.md',
    language: 'typescript',
    runtime: {
      family: 'web',
      framework: 'react',
      defaultPlatform: 'WEB',
      defaultArchitecture: 'x64',
    },
    publishPlatforms: ['WEB'],
    description: 'Large-screen browser and desktop renderer.',
  },
  h5: {
    id: 'h5',
    title: 'H5',
    kind: 'web',
    suffix: 'h5',
    template: 'web-app',
    devPort: 4174,
    componentType: 'h5-app',
    architectureSpec: 'APP_H5_ARCHITECTURE_SPEC.md',
    uiSpec: 'APP_MOBILE_REACT_UI_SPEC.md',
    language: 'typescript',
    runtime: {
      family: 'web',
      framework: 'react',
      defaultPlatform: 'H5',
      defaultArchitecture: 'x64',
    },
    publishPlatforms: ['H5'],
    description: 'Phone-first mobile browser renderer.',
  },
  pad: {
    id: 'pad',
    title: 'Pad',
    kind: 'web',
    suffix: 'pad',
    template: 'web-app',
    devPort: 4175,
    componentType: 'pad-app',
    architectureSpec: 'APP_PAD_ARCHITECTURE_SPEC.md',
    uiSpec: 'APP_PC_REACT_UI_SPEC.md',
    language: 'typescript',
    runtime: {
      family: 'web',
      framework: 'react',
      defaultPlatform: 'WEB',
      defaultArchitecture: 'x64',
    },
    publishPlatforms: ['WEB'],
    description: 'Tablet-first React renderer with large-screen tablet behavior.',
  },
  ios: {
    id: 'ios',
    title: 'iOS',
    kind: 'ios',
    suffix: 'ios-mobile',
    template: 'ios-app',
    componentType: 'ios-native-app',
    architectureSpec: 'IOS_APP_MOBILE_ARCHITECTURE_SPEC.md',
    uiSpec: 'APP_IOS_NATIVE_UI_SPEC.md',
    language: 'swift',
    runtime: {
      family: 'mobile',
      framework: 'ios-native',
      defaultPlatform: 'APP_IOS',
      defaultArchitecture: 'arm64',
    },
    publishPlatforms: ['APP_IOS'],
    description: 'Native SwiftUI iOS application shell.',
  },
  android: {
    id: 'android',
    title: 'Android',
    kind: 'android',
    suffix: 'android-mobile',
    template: 'android-app',
    componentType: 'android-native-app',
    architectureSpec: 'ANDROID_APP_MOBILE_ARCHITECTURE_SPEC.md',
    uiSpec: 'APP_ANDROID_NATIVE_UI_SPEC.md',
    language: 'kotlin',
    runtime: {
      family: 'mobile',
      framework: 'android-native',
      defaultPlatform: 'APP_ANDROID',
      defaultArchitecture: 'arm64',
    },
    publishPlatforms: ['APP_ANDROID'],
    description: 'Native Kotlin/Compose Android application shell.',
  },
  harmony: {
    id: 'harmony',
    title: 'HarmonyOS',
    kind: 'harmony',
    suffix: 'harmony-mobile',
    template: 'harmony-app',
    componentType: 'harmony-native-app',
    architectureSpec: 'HARMONY_APP_MOBILE_ARCHITECTURE_SPEC.md',
    uiSpec: 'APP_HARMONY_NATIVE_UI_SPEC.md',
    language: 'arkts',
    runtime: {
      family: 'mobile',
      framework: 'harmony-native',
      defaultPlatform: 'APP_HARMONY',
      defaultArchitecture: 'harmony-mobile',
    },
    publishPlatforms: ['APP_HARMONY'],
    description: 'Native HarmonyOS ArkTS/ArkUI application shell.',
  },
  flutter: {
    id: 'flutter',
    title: 'Flutter',
    kind: 'flutter',
    suffix: 'flutter-mobile',
    template: 'flutter-app',
    componentType: 'flutter-app',
    architectureSpec: 'FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC.md',
    uiSpec: 'APP_FLUTTER_UI_SPEC.md',
    language: 'dart',
    runtime: {
      family: 'mobile',
      framework: 'flutter',
      defaultPlatform: 'APP',
      defaultArchitecture: 'flutter-mobile',
    },
    publishPlatforms: ['APP_IOS', 'APP_ANDROID'],
    description: 'Flutter mobile application shell.',
  },
  'mini-program': {
    id: 'mini-program',
    title: 'Mini Program',
    kind: 'mini-program',
    suffix: 'mini-program',
    template: 'mini-program',
    componentType: 'mini-program-app',
    architectureSpec: 'MINI_PROGRAM_APP_ARCHITECTURE_SPEC.md',
    uiSpec: 'APP_MINI_PROGRAM_UI_SPEC.md',
    language: 'typescript',
    runtime: {
      family: 'mini-program',
      framework: 'weixin-mini-program',
      defaultPlatform: 'MP_WEIXIN',
      defaultArchitecture: 'universal',
    },
    publishPlatforms: ['MP_WEIXIN'],
    description: 'WeChat mini-program TypeScript source shell.',
  },
};

export const DEFAULT_ARCHITECTURES = ['pc', 'h5'];

export const TEMPLATE_GROUPS = [
  {
    id: 'repository',
    template: 'repository',
    target: '.',
    description: 'Repository baseline, root layout, documentation, config, scripts, and tests.',
  },
  {
    id: 'web-app',
    template: 'web-app',
    architectures: ['pc', 'h5', 'pad'],
    target: 'apps/sdkwork-__APP_CODE__-__ARCH_SUFFIX__',
    description: 'React/Vite browser or tablet application surface.',
  },
  {
    id: 'flutter-app',
    template: 'flutter-app',
    architectures: ['flutter'],
    target: 'apps/sdkwork-__APP_CODE__-flutter-mobile',
    description: 'Flutter mobile application shell with Dart package composition.',
  },
  {
    id: 'ios-app',
    template: 'ios-app',
    architectures: ['ios'],
    target: 'apps/sdkwork-__APP_CODE__-ios-mobile',
    description: 'SwiftUI iOS application shell with Swift package composition.',
  },
  {
    id: 'android-app',
    template: 'android-app',
    architectures: ['android'],
    target: 'apps/sdkwork-__APP_CODE__-android-mobile',
    description: 'Kotlin/Compose Android application shell.',
  },
  {
    id: 'harmony-app',
    template: 'harmony-app',
    architectures: ['harmony'],
    target: 'apps/sdkwork-__APP_CODE__-harmony-mobile',
    description: 'ArkTS/ArkUI HarmonyOS application shell.',
  },
  {
    id: 'mini-program',
    template: 'mini-program',
    architectures: ['mini-program'],
    target: 'apps/sdkwork-__APP_CODE__-mini-program',
    description: 'WeChat mini-program TypeScript source shell.',
  },
];

export function resolveArchitecture(id) {
  const architecture = ARCHITECTURES[id];
  if (!architecture) {
    throw new Error(
      `Unknown architecture "${id}". Supported architectures: ${Object.keys(ARCHITECTURES).join(', ')}`,
    );
  }
  return architecture;
}

export function templateGroupForArchitecture(id) {
  const group = TEMPLATE_GROUPS.find((entry) => entry.architectures?.includes(id));
  if (!group) {
    throw new Error(`No template group is registered for architecture "${id}".`);
  }
  return group;
}

// Backward-compatible names used by earlier scaffold releases.
export const WEB_SURFACES = {
  pc: ARCHITECTURES.pc,
  h5: ARCHITECTURES.h5,
  pad: ARCHITECTURES.pad,
};
export const DEFAULT_SURFACES = DEFAULT_ARCHITECTURES;
