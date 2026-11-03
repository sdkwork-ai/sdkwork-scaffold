import XCTest
@testable import __IOS_MODULE_NAME__

final class AppTests: XCTestCase {
    func testComponentRegistryIsAvailable() {
        XCTAssertFalse(__IOS_MODULE_NAME__ComponentRegistry.components.isEmpty)
    }
}
