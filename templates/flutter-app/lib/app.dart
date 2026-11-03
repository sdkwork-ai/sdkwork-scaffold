import 'package:flutter/material.dart';

import 'composition/component_registry.dart';

const String appName = '__APP_NAME__';
const String appCode = 'sdkwork-__APP_CODE__';

class SdkworkApp extends StatelessWidget {
  const SdkworkApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: appName,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFB8F26B),
          brightness: Brightness.dark,
        ),
        scaffoldBackgroundColor: const Color(0xFF08110F),
        useMaterial3: true,
      ),
      home: const FoundationHomePage(),
    );
  }
}

class FoundationHomePage extends StatelessWidget {
  const FoundationHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(24, 28, 24, 40),
          children: <Widget>[
            Text(
              'SDKWORK APPLICATION FOUNDATION',
              style: theme.textTheme.labelSmall?.copyWith(
                color: const Color(0xFFB8F26B),
                fontWeight: FontWeight.w800,
                letterSpacing: 1.8,
              ),
            ),
            const SizedBox(height: 18),
            Text(
              appName,
              style: theme.textTheme.displaySmall?.copyWith(
                color: const Color(0xFFD7FF9E),
                fontWeight: FontWeight.w700,
                letterSpacing: -1.4,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Flutter mobile surface initialized with SDKWork component composition.',
              style: theme.textTheme.bodyLarge?.copyWith(color: const Color(0xFFA7B4AC)),
            ),
            const SizedBox(height: 30),
            Text(
              'Integrated components',
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 12),
            if (integratedComponents.isEmpty)
              const Text('No common component is enabled for this application.')
            else
              ...integratedComponents.map(
                (IntegratedComponent component) => Card(
                  color: const Color(0xFF102019),
                  margin: const EdgeInsets.only(bottom: 10),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: component.supported
                          ? const Color(0xFFB8F26B)
                          : const Color(0xFF3A3A34),
                      foregroundColor: const Color(0xFF12210D),
                      child: Text(component.id.substring(0, 2).toUpperCase()),
                    ),
                    title: Text(component.title),
                    subtitle: Text(
                      component.supported
                          ? (component.sdkPackage.isEmpty ? component.mode : component.sdkPackage)
                          : component.reason,
                    ),
                    trailing: Icon(
                      component.supported ? Icons.link : Icons.schedule,
                      color: component.supported
                          ? const Color(0xFFB8F26B)
                          : const Color(0xFFE6C67D),
                    ),
                  ),
                ),
              ),
            const SizedBox(height: 24),
            Text(
              appCode,
              style: theme.textTheme.bodySmall?.copyWith(color: const Color(0xFF718078)),
            ),
          ],
        ),
      ),
    );
  }
}
