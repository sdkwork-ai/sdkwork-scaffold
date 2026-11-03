import 'package:flutter/material.dart';

import 'composition/component_registry.dart';
import 'theme/app_theme.dart';

const String appName = '__APP_NAME__';
const String appCode = 'sdkwork-__APP_CODE__';
const String appDescription = '__APP_DESCRIPTION__';

class SdkworkApp extends StatelessWidget {
  const SdkworkApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: appName,
      debugShowCheckedModeBanner: false,
      theme: buildAppTheme(),
      home: const FoundationHomePage(),
    );
  }
}

class FoundationHomePage extends StatelessWidget {
  const FoundationHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final int linked = integratedComponents
        .where((IntegratedComponent component) => component.supported)
        .length;
    final int planned = integratedComponents.length - linked;

    return Scaffold(
      appBar: AppBar(
        title: const Text(appName),
        actions: <Widget>[
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Center(
              child: Text(
                'Flutter',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: kTechBlueStrong,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 20, 16, 36),
        children: <Widget>[
          Text(
            'SDKWORK APPLICATION FOUNDATION',
            style: theme.textTheme.labelSmall?.copyWith(
              color: kTechBlue,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            appName,
            style: theme.textTheme.headlineSmall?.copyWith(
              color: kInk,
              fontWeight: FontWeight.w700,
              letterSpacing: -0.6,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            appDescription,
            style: theme.textTheme.bodyMedium?.copyWith(color: kMuted),
          ),
          const SizedBox(height: 20),
          Row(
            children: <Widget>[
              _StatTile(label: 'Components', value: '${integratedComponents.length}'),
              const SizedBox(width: 10),
              _StatTile(label: 'Linked', value: '$linked'),
              const SizedBox(width: 10),
              _StatTile(label: 'Plan', value: '$planned'),
            ],
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    'Foundation status',
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: kInk,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'The initial delivery boundary is visible and explicit.',
                    style: theme.textTheme.bodySmall?.copyWith(color: kMuted),
                  ),
                  const SizedBox(height: 14),
                  const _StatusRow(
                    title: 'Repository baseline',
                    subtitle: 'Canon, identity, workspace metadata, and root layout',
                    status: 'Ready',
                  ),
                  const _StatusRow(
                    title: 'Architecture surface',
                    subtitle: 'Flutter root with composition and component registry',
                    status: 'Ready',
                  ),
                  const _StatusRow(
                    title: 'First vertical workflow',
                    subtitle: 'Requirements, API contracts, and package modules',
                    status: 'Next',
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    'Integrated components',
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: kInk,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '$linked linked · $planned planned',
                    style: theme.textTheme.bodySmall?.copyWith(color: kMuted),
                  ),
                  const SizedBox(height: 12),
                  if (integratedComponents.isEmpty)
                    Text(
                      'No common component is enabled for this application.',
                      style: theme.textTheme.bodySmall?.copyWith(color: kMuted),
                    )
                  else
                    ...integratedComponents.map(
                      (IntegratedComponent component) => _ComponentRow(component: component),
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: kTechBlueSoft,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  'Recommended next move',
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: kTechBlue,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Write the requirement before the screen.',
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: kInk,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Capture the first workflow in docs/product/prd/PRD.md, record the boundary decision, then add API, SDK, and package work.',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: kMuted,
                    height: 1.55,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Text(
            appCode,
            style: theme.textTheme.labelSmall?.copyWith(color: kMuted),
          ),
        ],
      ),
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: kSurfaceAlt,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(
              label.toUpperCase(),
              style: theme.textTheme.labelSmall?.copyWith(
                color: kMuted,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.8,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: theme.textTheme.titleLarge?.copyWith(
                color: kInk,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusRow extends StatelessWidget {
  const _StatusRow({required this.title, required this.subtitle, required this.status});

  final String title;
  final String subtitle;
  final String status;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    final bool ready = status == 'Ready';
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kSurfaceAlt,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: <Widget>[
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  title,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: kInk,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: theme.textTheme.bodySmall?.copyWith(color: kMuted),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
            decoration: BoxDecoration(
              color: ready ? kSuccessSoft : kWarningSoft,
              borderRadius: BorderRadius.circular(999),
            ),
            child: Text(
              status,
              style: theme.textTheme.labelSmall?.copyWith(
                color: ready ? kSuccess : kWarning,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ComponentRow extends StatelessWidget {
  const _ComponentRow({required this.component});

  final IntegratedComponent component;

  @override
  Widget build(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kSurfaceAlt,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Container(
            width: 32,
            height: 32,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: kTechBlue,
              borderRadius: BorderRadius.circular(9),
            ),
            child: Text(
              component.id.substring(0, 2).toUpperCase(),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 11,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  component.title,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: kInk,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  component.supported
                      ? (component.sdkPackage.isEmpty ? component.mode : component.sdkPackage)
                      : component.reason,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: component.supported ? kTechBlueStrong : kWarning,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: component.supported ? kSuccessSoft : kWarningSoft,
              borderRadius: BorderRadius.circular(999),
            ),
            child: Text(
              component.supported ? 'Linked' : 'Plan',
              style: theme.textTheme.labelSmall?.copyWith(
                color: component.supported ? kSuccess : kWarning,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
