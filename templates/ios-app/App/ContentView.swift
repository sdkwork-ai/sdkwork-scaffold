import SwiftUI

struct ContentView: View {
    private let components = __IOS_MODULE_NAME__ComponentRegistry.components

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    Text("SDKWORK APPLICATION FOUNDATION")
                        .font(.caption.weight(.bold))
                        .tracking(1.5)
                        .foregroundStyle(Color(red: 0.72, green: 0.95, blue: 0.42))

                    Text("__APP_NAME__")
                        .font(.largeTitle.weight(.bold))
                        .foregroundStyle(Color(red: 0.84, green: 1.0, blue: 0.62))

                    Text("Native iOS surface initialized with SDKWork component composition.")
                        .foregroundStyle(.secondary)

                    Text("Integrated components")
                        .font(.headline)
                        .padding(.top, 8)

                    if components.isEmpty {
                        Text("No common component is enabled for this application.")
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(components) { component in
                            HStack(alignment: .top, spacing: 12) {
                                Text(String(component.id.prefix(2)).uppercased())
                                    .font(.caption.monospaced().weight(.bold))
                                    .frame(width: 36, height: 36)
                                    .background(Color(red: 0.72, green: 0.95, blue: 0.42).opacity(0.16))
                                    .clipShape(RoundedRectangle(cornerRadius: 10))

                                VStack(alignment: .leading, spacing: 4) {
                                    Text(component.title).font(.headline)
                                    Text(component.supported ? (component.sdkPackage.isEmpty ? component.mode : component.sdkPackage) : component.reason)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                                Spacer()
                            }
                            .padding(14)
                            .background(Color.white.opacity(0.04))
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                        }
                    }

                    Text("sdkwork-__APP_CODE__")
                        .font(.footnote.monospaced())
                        .foregroundStyle(.tertiary)
                        .padding(.top, 12)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(24)
            }
            .background(Color(red: 0.03, green: 0.07, blue: 0.06))
            .toolbar(.hidden, for: .navigationBar)
        }
        .preferredColorScheme(.dark)
    }
}
