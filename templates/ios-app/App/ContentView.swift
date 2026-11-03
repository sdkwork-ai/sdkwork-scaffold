import SwiftUI

private enum Palette {
    static let canvas = Color(red: 0.949, green: 0.961, blue: 0.980)
    static let surface = Color.white
    static let surfaceAlt = Color(red: 0.902, green: 0.929, blue: 0.973)
    static let accent = Color(red: 0.039, green: 0.361, blue: 1.0)
    static let accentStrong = Color(red: 0.027, green: 0.278, blue: 0.788)
    static let accentSoft = Color(red: 0.906, green: 0.937, blue: 1.0)
    static let ink = Color(red: 0.039, green: 0.075, blue: 0.141)
    static let muted = Color(red: 0.353, green: 0.420, blue: 0.522)
    static let success = Color(red: 0.055, green: 0.624, blue: 0.431)
    static let successSoft = Color(red: 0.890, green: 0.969, blue: 0.937)
    static let warning = Color(red: 0.698, green: 0.416, blue: 0.0)
    static let warningSoft = Color(red: 1.0, green: 0.957, blue: 0.878)
}

struct ContentView: View {
    @State private var selection = 0

    var body: some View {
        TabView(selection: $selection) {
            NavigationStack {
                OverviewTab()
                    .navigationTitle("Overview")
                    .navigationBarTitleDisplayMode(.inline)
            }
            .tabItem {
                Label("Overview", systemImage: "square.grid.2x2")
            }
            .tag(0)

            NavigationStack {
                SurfacesTab()
                    .navigationTitle("Surfaces")
                    .navigationBarTitleDisplayMode(.inline)
            }
            .tabItem {
                Label("Surfaces", systemImage: "rectangle.3.group")
            }
            .tag(1)

            NavigationStack {
                ComponentsTab()
                    .navigationTitle("Components")
                    .navigationBarTitleDisplayMode(.inline)
            }
            .tabItem {
                Label("Components", systemImage: "square.stack.3d.up")
            }
            .tag(2)
        }
        .tint(Palette.accent)
        .preferredColorScheme(.light)
    }
}

private struct OverviewTab: View {
    private let components = __IOS_MODULE_NAME__ComponentRegistry.components
    private let roots = __IOS_MODULE_NAME__ArchitectureRegistry.roots

    private var linkedCount: Int {
        components.filter(\.supported).count
    }

    private var plannedCount: Int {
        components.count - linkedCount
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                PageHeader()

                HStack(spacing: 10) {
                    StatTile(label: "Architectures", value: "\(roots.count)")
                    StatTile(label: "Linked", value: "\(linkedCount)")
                    StatTile(label: "Plan", value: "\(plannedCount)")
                }

                Panel {
                    Text("Foundation status")
                        .font(.headline)
                        .foregroundStyle(Palette.ink)
                    Text("The initial delivery boundary is visible and explicit.")
                        .font(.caption)
                        .foregroundStyle(Palette.muted)

                    StatusRow(title: "Repository baseline", subtitle: "Canon, identity, workspace metadata, and root layout", status: "Ready", ready: true)
                    StatusRow(title: "Architecture surface", subtitle: "SwiftUI root with bottom tab navigation", status: "Ready", ready: true)
                    StatusRow(title: "First vertical workflow", subtitle: "Requirements, API contracts, and package modules", status: "Next", ready: false)
                }
            }
            .padding(16)
        }
        .background(Palette.canvas)
    }
}

private struct SurfacesTab: View {
    private let roots = __IOS_MODULE_NAME__ArchitectureRegistry.roots

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                PageHeader(
                    eyebrow: "ARCHITECTURE ROOTS",
                    title: "Application surfaces",
                    subtitle: "Each architecture keeps its own root, manifest, and toolchain."
                )

                ForEach(roots) { root in
                    HStack(spacing: 10) {
                        Text(String(root.id.prefix(2)).uppercased())
                            .font(.caption2.monospaced().weight(.bold))
                            .foregroundStyle(.white)
                            .frame(width: 30, height: 30)
                            .background(Palette.accent)
                            .clipShape(RoundedRectangle(cornerRadius: 9))

                        VStack(alignment: .leading, spacing: 2) {
                            Text(root.title)
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(Palette.ink)
                            Text(root.root)
                                .font(.caption2)
                                .foregroundStyle(Palette.muted)
                        }
                        Spacer()
                        Text(root.kind)
                            .font(.caption2)
                            .foregroundStyle(Palette.muted)
                    }
                    .padding(12)
                    .background(Palette.surfaceAlt)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                }
            }
            .padding(16)
        }
        .background(Palette.canvas)
    }
}

private struct ComponentsTab: View {
    private let components = __IOS_MODULE_NAME__ComponentRegistry.components

    private var linkedCount: Int {
        components.filter(\.supported).count
    }

    private var plannedCount: Int {
        components.count - linkedCount
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                PageHeader(
                    eyebrow: "COMPOSITION",
                    title: "Component composition",
                    subtitle: "\(linkedCount) linked · \(plannedCount) planned · resolved from sibling SDK manifests."
                )

                if components.isEmpty {
                    Text("No common component is enabled for this application.")
                        .font(.caption)
                        .foregroundStyle(Palette.muted)
                } else {
                    ForEach(components) { component in
                        ComponentRow(component: component)
                    }
                }

                VStack(alignment: .leading, spacing: 6) {
                    Text("RECOMMENDED NEXT MOVE")
                        .font(.caption2.weight(.bold))
                        .tracking(1.2)
                        .foregroundStyle(Palette.accent)
                    Text("Write the requirement before the screen.")
                        .font(.headline)
                        .foregroundStyle(Palette.ink)
                    Text("Capture the first workflow in docs/product/prd/PRD.md, record the boundary decision, then add API, SDK, and package work.")
                        .font(.caption)
                        .foregroundStyle(Palette.muted)
                }
                .padding(18)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Palette.accentSoft)
                .clipShape(RoundedRectangle(cornerRadius: 14))
            }
            .padding(16)
        }
        .background(Palette.canvas)
    }
}

private struct PageHeader: View {
    var eyebrow = "SDKWORK APPLICATION FOUNDATION"
    var title = "__APP_NAME__"
    var subtitle = "__APP_DESCRIPTION__"

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(eyebrow)
                .font(.caption2.weight(.bold))
                .tracking(1.4)
                .foregroundStyle(Palette.accent)
            Text(title)
                .font(.system(size: 28, weight: .bold))
                .foregroundStyle(Palette.ink)
            Text(subtitle)
                .font(.subheadline)
                .foregroundStyle(Palette.muted)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

private struct Panel<Content: View>: View {
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            content
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Palette.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}

private struct StatTile: View {
    let label: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label.uppercased())
                .font(.system(size: 10, weight: .semibold))
                .tracking(0.6)
                .foregroundStyle(Palette.muted)
            Text(value)
                .font(.title3.weight(.bold))
                .foregroundStyle(Palette.ink)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(Palette.surfaceAlt)
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}

private struct StatusRow: View {
    let title: String
    let subtitle: String
    let status: String
    let ready: Bool

    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Palette.ink)
                Text(subtitle)
                    .font(.caption2)
                    .foregroundStyle(Palette.muted)
            }
            Spacer(minLength: 6)
            Text(status)
                .font(.caption2.weight(.semibold))
                .foregroundStyle(ready ? Palette.success : Palette.warning)
                .padding(.horizontal, 8)
                .padding(.vertical, 3)
                .background(ready ? Palette.successSoft : Palette.warningSoft)
                .clipShape(Capsule())
        }
        .padding(12)
        .background(Palette.surfaceAlt)
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}

private struct ComponentRow: View {
    let component: IntegratedComponent

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Text(String(component.id.prefix(2)).uppercased())
                .font(.caption2.monospaced().weight(.bold))
                .foregroundStyle(.white)
                .frame(width: 30, height: 30)
                .background(Palette.accent)
                .clipShape(RoundedRectangle(cornerRadius: 9))

            VStack(alignment: .leading, spacing: 2) {
                Text(component.title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Palette.ink)
                Text(component.supported ? (component.sdkPackage.isEmpty ? component.mode : component.sdkPackage) : component.reason)
                    .font(.caption2)
                    .foregroundStyle(component.supported ? Palette.accentStrong : Palette.warning)
                    .lineLimit(2)
            }

            Spacer(minLength: 6)

            Text(component.supported ? "Linked" : "Plan")
                .font(.caption2.weight(.semibold))
                .foregroundStyle(component.supported ? Palette.success : Palette.warning)
                .padding(.horizontal, 8)
                .padding(.vertical, 3)
                .background(component.supported ? Palette.successSoft : Palette.warningSoft)
                .clipShape(Capsule())
        }
        .padding(12)
        .background(Palette.surfaceAlt)
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}
