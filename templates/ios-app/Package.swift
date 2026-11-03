// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "__IOS_MODULE_NAME__",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(
            name: "__IOS_MODULE_NAME__",
            targets: ["__IOS_MODULE_NAME__"]
        )
    ],
    targets: [
        .target(
            name: "__IOS_MODULE_NAME__",
            path: "App"
        ),
        .testTarget(
            name: "__IOS_MODULE_NAME__Tests",
            dependencies: ["__IOS_MODULE_NAME__"],
            path: "Tests"
        )
    ]
)
