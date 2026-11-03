/**
 * SDKWork common component registry.
 *
 * `sdkFamily` names a real family under `<repo>/sdks/`. The generator resolves
 * the family's sdk-manifest.json and every language package at generation time.
 * `kind: "runtime"` components have no app SDK family and are integrated through
 * their native runtime packages and typed configuration.
 *
 * Add a component by declaring its repository and SDK family. Do not hardcode
 * package paths here: SDK workspaces and generated language package names are
 * owned by the dependency repository.
 */
export const COMPONENTS = {
  iam: {
    id: 'iam',
    title: 'IAM & Session',
    category: 'foundation',
    repo: 'sdkwork-iam',
    sdkFamily: 'sdkwork-iam-app-sdk',
    permissionModuleId: 'iam-kernel',
    defaultEnabled: true,
    description: 'Login, session, current user, tenant/organization context, token lifecycle, and account security.',
    defaultConfig: {
      loginMode: 'embedded',
      sessionPersistence: 'secure-storage',
      refreshSession: true,
    },
  },
  appbase: {
    id: 'appbase',
    title: 'Appbase Foundation',
    category: 'foundation',
    repo: 'sdkwork-appbase',
    kind: 'runtime',
    permissionModuleId: 'appbase',
    defaultEnabled: true,
    description: 'Application foundation, runtime bootstrap, error recovery, feature registry, shell, and shared base-data primitives.',
    runtimePackages: {
      pc: ['@sdkwork/appbase-pc-react', '@sdkwork/runtime-bootstrap'],
      h5: ['@sdkwork/appbase-mobile-react'],
      pad: ['@sdkwork/appbase-pc-react', '@sdkwork/runtime-bootstrap'],
      flutter: ['sdkwork_appbase_flutter_foundation'],
    },
    defaultConfig: {
      errorRecovery: true,
      theme: 'system',
      featureRegistry: true,
    },
  },
  rtc: {
    id: 'rtc',
    title: 'RTC',
    category: 'communication',
    repo: 'sdkwork-rtc',
    sdkFamily: 'sdkwork-rtc-app-sdk',
    permissionModuleId: 'rtc',
    description: 'Real-time audio/video rooms, calls, participants, media devices, and quality telemetry.',
    defaultConfig: {
      media: 'audio-video',
      region: 'auto',
    },
  },
  im: {
    id: 'im',
    title: 'IM & Messaging',
    category: 'communication',
    repo: 'sdkwork-im',
    sdkFamily: 'sdkwork-im-app-sdk',
    permissionModuleId: 'im',
    description: 'Conversations, messages, contacts, channels, presence, and realtime delivery.',
    defaultConfig: {
      historyPageSize: 50,
      readReceipts: true,
      presence: true,
    },
  },
  agents: {
    id: 'agents',
    title: 'Agents',
    category: 'ai',
    repo: 'sdkwork-agents',
    sdkFamily: 'sdkwork-agents-app-sdk',
    permissionModuleId: 'agents',
    description: 'Agent definitions, runs, tools, conversations, and AI workflow orchestration.',
    defaultConfig: {
      streaming: true,
      toolApproval: 'explicit',
    },
  },
  order: {
    id: 'order',
    title: 'Order & Checkout',
    category: 'commerce',
    repo: 'sdkwork-order',
    sdkFamily: 'sdkwork-order-app-sdk',
    permissionModuleId: 'commerce',
    description: 'Orders, checkout, payments, recharges, after-sales, fulfillment, and withdrawals.',
    defaultConfig: {
      currency: 'CNY',
      idempotency: true,
    },
  },
  drive: {
    id: 'drive',
    title: 'Drive & Upload',
    category: 'content',
    repo: 'sdkwork-drive',
    sdkFamily: 'sdkwork-drive-app-sdk',
    permissionModuleId: 'drive',
    description: 'File storage, upload sessions, media resources, avatars, attachments, and download delivery.',
    defaultConfig: {
      uploadProfile: 'default',
      maxInlineUploadBytes: 10485760,
    },
  },
  payment: {
    id: 'payment',
    title: 'Payment',
    category: 'commerce',
    repo: 'sdkwork-payment',
    sdkFamily: 'sdkwork-payment-app-sdk',
    permissionModuleId: 'payment',
    description: 'Payment intents, channels, refunds, reconciliation, and payment callbacks.',
    defaultConfig: {
      channels: ['wechat', 'alipay'],
    },
  },
  commerce: {
    id: 'commerce',
    title: 'Commerce',
    category: 'commerce',
    repo: 'sdkwork-mall',
    sdkFamily: 'sdkwork-commerce-app-sdk',
    permissionModuleId: 'commerce',
    description: 'Products, SKUs, cart composition, pricing, inventory, and storefront commerce workflows.',
    defaultConfig: {
      currency: 'CNY',
      inventoryCheck: true,
    },
  },
  catalog: {
    id: 'catalog',
    title: 'Catalog',
    category: 'commerce',
    repo: 'sdkwork-catalog',
    sdkFamily: 'sdkwork-catalog-app-sdk',
    permissionModuleId: 'catalog',
    description: 'Catalog dictionaries, categories, taxonomy, and searchable reference data.',
    defaultConfig: {
      cacheTtlSeconds: 300,
    },
  },
  membership: {
    id: 'membership',
    title: 'Membership',
    category: 'commerce',
    repo: 'sdkwork-membership',
    sdkFamily: 'sdkwork-membership-app-sdk',
    permissionModuleId: 'membership',
    description: 'Membership plans, entitlements, subscriptions, renewals, and benefits.',
    defaultConfig: {
      entitlementCache: true,
    },
  },
  promotion: {
    id: 'promotion',
    title: 'Promotion',
    category: 'commerce',
    repo: 'sdkwork-promotion',
    sdkFamily: 'sdkwork-promotion-app-sdk',
    permissionModuleId: 'promotion',
    description: 'Coupons, campaigns, promotions, discount rules, and redemption.',
    defaultConfig: {
      stackable: false,
    },
  },
  community: {
    id: 'community',
    title: 'Community',
    category: 'content',
    repo: 'sdkwork-community',
    sdkFamily: 'sdkwork-community-app-sdk',
    permissionModuleId: 'community',
    description: 'Community spaces, posts, topics, reactions, and social interactions.',
    defaultConfig: {
      moderation: 'server',
    },
  },
  comments: {
    id: 'comments',
    title: 'Comments',
    category: 'content',
    repo: 'sdkwork-comments',
    sdkFamily: 'sdkwork-comments-app-sdk',
    permissionModuleId: 'comments',
    description: 'Threaded comments, mentions, reactions, and moderation hooks.',
    defaultConfig: {
      threading: true,
      pageSize: 20,
    },
  },
  search: {
    id: 'search',
    title: 'Search',
    category: 'platform',
    repo: 'sdkwork-search',
    sdkFamily: 'sdkwork-search-app-sdk',
    permissionModuleId: 'search',
    description: 'Cross-domain search, suggestions, filters, and federated result composition.',
    defaultConfig: {
      debounceMs: 250,
    },
  },
  feeds: {
    id: 'feeds',
    title: 'Feeds',
    category: 'content',
    repo: 'sdkwork-feeds',
    sdkFamily: 'sdkwork-feeds-app-sdk',
    permissionModuleId: 'feeds',
    description: 'Activity feeds, timelines, ranking inputs, and content distribution.',
    defaultConfig: {
      pageSize: 20,
    },
  },
  news: {
    id: 'news',
    title: 'News',
    category: 'content',
    repo: 'sdkwork-news',
    sdkFamily: 'sdkwork-news-app-sdk',
    permissionModuleId: 'news',
    description: 'News articles, channels, summaries, and publishing workflows.',
    defaultConfig: {
      locale: 'zh-CN',
    },
  },
  course: {
    id: 'course',
    title: 'Course & Learning',
    category: 'content',
    repo: 'sdkwork-course',
    sdkFamily: 'sdkwork-course-app-sdk',
    permissionModuleId: 'course',
    description: 'Courses, lessons, enrollment, progress, and learning content.',
    defaultConfig: {
      progressTracking: true,
    },
  },
  music: {
    id: 'music',
    title: 'Music',
    category: 'content',
    repo: 'sdkwork-music',
    sdkFamily: 'sdkwork-music-app-sdk',
    permissionModuleId: 'music',
    description: 'Music generation, playback metadata, playlists, and audio assets.',
    defaultConfig: {
      autoplay: false,
    },
  },
  image: {
    id: 'image',
    title: 'Image Generation',
    category: 'ai',
    repo: 'sdkwork-image',
    sdkFamily: 'sdkwork-image-app-sdk',
    permissionModuleId: 'image',
    description: 'Image generation, editing, style presets, and media jobs.',
    defaultConfig: {
      defaultAspectRatio: '1:1',
    },
  },
  documents: {
    id: 'documents',
    title: 'Documents',
    category: 'content',
    repo: 'sdkwork-documents',
    sdkFamily: 'sdkwork-documents-app-sdk',
    permissionModuleId: 'documents',
    description: 'Document authoring, import/export, templates, and document workflows.',
    defaultConfig: {
      autosaveSeconds: 30,
    },
  },
  notes: {
    id: 'notes',
    title: 'Notes',
    category: 'content',
    repo: 'sdkwork-notes',
    sdkFamily: 'sdkwork-notes-app-sdk',
    permissionModuleId: 'notes',
    description: 'Pages, notes, folders, collections, and linked knowledge capture.',
    defaultConfig: {
      autosaveSeconds: 5,
    },
  },
  knowledgebase: {
    id: 'knowledgebase',
    title: 'Knowledgebase',
    category: 'ai',
    repo: 'sdkwork-knowledgebase',
    sdkFamily: 'sdkwork-knowledgebase-app-sdk',
    permissionModuleId: 'knowledgebase',
    description: 'Knowledge bases, document ingestion, retrieval, citations, and RAG surfaces.',
    defaultConfig: {
      retrievalTopK: 8,
    },
  },
  memory: {
    id: 'memory',
    title: 'Memory',
    category: 'ai',
    repo: 'sdkwork-memory',
    sdkFamily: 'sdkwork-memory-app-sdk',
    permissionModuleId: 'memory',
    description: 'Long-term memory, recall, user preferences, and memory lifecycle.',
    defaultConfig: {
      retentionDays: 365,
    },
  },
  voice: {
    id: 'voice',
    title: 'Voice',
    category: 'ai',
    repo: 'sdkwork-voice',
    sdkFamily: 'sdkwork-voice-app-sdk',
    permissionModuleId: 'voice',
    description: 'Voice cloning, speech generation, voice presets, and speech assets.',
    defaultConfig: {
      defaultLocale: 'zh-CN',
    },
  },
  audio: {
    id: 'audio',
    title: 'Audio',
    category: 'content',
    repo: 'sdkwork-audio',
    sdkFamily: 'sdkwork-audio-app-sdk',
    permissionModuleId: 'audio',
    description: 'Audio assets, processing, playback metadata, and sound libraries.',
    defaultConfig: {
      normalizeLoudness: true,
    },
  },
  generations: {
    id: 'generations',
    title: 'Generations',
    category: 'ai',
    repo: 'sdkwork-generations',
    sdkFamily: 'sdkwork-generations-app-sdk',
    permissionModuleId: 'generations',
    description: 'Generic generation jobs, model task lifecycle, progress, and output retrieval.',
    defaultConfig: {
      pollIntervalMs: 1500,
    },
  },
  prompts: {
    id: 'prompts',
    title: 'Prompts',
    category: 'ai',
    repo: 'sdkwork-prompts',
    sdkFamily: 'sdkwork-prompts-app-sdk',
    permissionModuleId: 'prompts',
    description: 'Prompt templates, versioning, variables, and prompt library management.',
    defaultConfig: {
      versioning: true,
    },
  },
  models: {
    id: 'models',
    title: 'Models',
    category: 'ai',
    repo: 'sdkwork-models',
    sdkFamily: 'sdkwork-models-app-sdk',
    permissionModuleId: 'models',
    description: 'Model catalog, capabilities, routing metadata, and model selection.',
    defaultConfig: {
      providerFallback: true,
    },
  },
  notary: {
    id: 'notary',
    title: 'Notary',
    category: 'platform',
    repo: 'sdkwork-notary',
    sdkFamily: 'sdkwork-notary-app-sdk',
    permissionModuleId: 'notary',
    description: 'Evidence, attestations, signing records, and verifiable timestamp workflows.',
    defaultConfig: {
      hashAlgorithm: 'SHA-256',
    },
  },
  aiot: {
    id: 'aiot',
    title: 'AIoT',
    category: 'platform',
    repo: 'sdkwork-aiot',
    sdkFamily: 'sdkwork-aiot-app-sdk',
    permissionModuleId: 'aiot',
    description: 'Devices, telemetry, commands, and edge runtime integration.',
    defaultConfig: {
      telemetryBatch: true,
    },
  },
  mail: {
    id: 'mail',
    title: 'Mail',
    category: 'communication',
    repo: 'sdkwork-mail',
    sdkFamily: 'sdkwork-mail-app-sdk',
    permissionModuleId: 'mail',
    description: 'Mailboxes, messages, threads, attachments, and delivery status.',
    defaultConfig: {
      pageSize: 30,
    },
  },
  messaging: {
    id: 'messaging',
    title: 'Messaging',
    category: 'communication',
    repo: 'sdkwork-messaging',
    sdkFamily: 'sdkwork-messaging-app-sdk',
    permissionModuleId: 'messaging',
    description: 'Notification delivery, templates, channels, and message dispatch.',
    defaultConfig: {
      channels: ['in-app', 'push'],
    },
  },
  skills: {
    id: 'skills',
    title: 'Skills',
    category: 'ai',
    repo: 'sdkwork-skills',
    sdkFamily: 'sdkwork-skills-app-sdk',
    permissionModuleId: 'skills',
    description: 'Reusable agent skills, capability packages, and execution contracts.',
    defaultConfig: {
      sandboxed: true,
    },
  },
  assets: {
    id: 'assets',
    title: 'Assets',
    category: 'content',
    repo: 'sdkwork-assets',
    sdkFamily: 'sdkwork-assets-app-sdk',
    permissionModuleId: 'assets',
    description: 'Asset libraries, metadata, renditions, and delivery references.',
    defaultConfig: {
      defaultRendition: 'original',
    },
  },
};

export const DEFAULT_COMPONENTS = Object.values(COMPONENTS)
  .filter((component) => component.defaultEnabled)
  .map((component) => component.id);

export const COMPONENT_PRESETS = {
  foundation: ['iam', 'appbase'],
  communication: ['rtc', 'im', 'mail', 'messaging'],
  commerce: ['order', 'payment', 'commerce', 'catalog', 'membership', 'promotion'],
  content: ['drive', 'community', 'comments', 'feeds', 'news', 'documents', 'notes', 'assets', 'course', 'music', 'audio', 'search'],
  ai: ['agents', 'image', 'knowledgebase', 'memory', 'voice', 'generations', 'prompts', 'models', 'skills'],
  platform: ['notary', 'aiot'],
};

export function resolveComponentPreset(name) {
  const preset = COMPONENT_PRESETS[String(name).trim().toLowerCase()];
  if (!preset) {
    throw new Error(
      `Unknown component preset "${name}". Supported presets: ${Object.keys(COMPONENT_PRESETS).join(', ')}`,
    );
  }
  return preset;
}

export function resolveComponent(id) {
  const component = COMPONENTS[id];
  if (!component) {
    throw new Error(
      `Unknown component "${id}". Supported components: ${Object.keys(COMPONENTS).join(', ')}`,
    );
  }
  return component;
}
