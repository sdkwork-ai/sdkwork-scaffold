import 'package:flutter_test/flutter_test.dart';
import 'package:__DART_PACKAGE_NAME__/app.dart';

void main() {
  testWidgets('renders the SDKWork foundation shell', (WidgetTester tester) async {
    await tester.pumpWidget(const SdkworkApp());
    expect(find.text(appName), findsOneWidget);
    expect(find.text('Integrated components'), findsOneWidget);
  });
}
