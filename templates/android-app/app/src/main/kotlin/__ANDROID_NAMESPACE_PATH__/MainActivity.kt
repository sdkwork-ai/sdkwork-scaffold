package __ANDROID_NAMESPACE__

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Dashboard
import androidx.compose.material.icons.outlined.Layers
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Widgets
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import __ANDROID_NAMESPACE__.bootstrap.ArchitectureRegistry
import __ANDROID_NAMESPACE__.bootstrap.ArchitectureRoot
import __ANDROID_NAMESPACE__.bootstrap.ComponentRegistry
import __ANDROID_NAMESPACE__.bootstrap.IntegratedComponent

private val TechBlue = Color(0xFF0A5CFF)
private val TechBlueStrong = Color(0xFF0747C9)
private val TechBlueSoft = Color(0xFFE7EFFF)
private val Canvas = Color(0xFFF2F5FA)
private val SurfaceWhite = Color(0xFFFFFFFF)
private val SurfaceAlt = Color(0xFFE6EDF8)
private val Ink = Color(0xFF0A1324)
private val Muted = Color(0xFF5A6B85)
private val Success = Color(0xFF0E9F6E)
private val SuccessSoft = Color(0xFFE3F7EF)
private val Warning = Color(0xFFB26A00)
private val WarningSoft = Color(0xFFFFF4E0)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                colorScheme = lightColorScheme(
                    primary = TechBlue,
                    onPrimary = Color.White,
                    primaryContainer = TechBlueSoft,
                    onPrimaryContainer = TechBlueStrong,
                    secondary = Color(0xFF00D2FF),
                    background = Canvas,
                    onBackground = Ink,
                    surface = SurfaceWhite,
                    onSurface = Ink,
                    surfaceVariant = SurfaceAlt,
                    onSurfaceVariant = Muted,
                    error = Color(0xFFE5484D),
                    onError = Color.White,
                ),
            ) {
                Surface(modifier = Modifier.fillMaxSize(), color = Canvas) {
                    SdkworkAppShell()
                }
            }
        }
    }
}

@Composable
private fun SdkworkAppShell() {
    var selectedTab by rememberSaveable { mutableIntStateOf(0) }
    val tabs = listOf(
        Triple("Overview", Icons.Outlined.Dashboard, 0),
        Triple("Surfaces", Icons.Outlined.Layers, 1),
        Triple("Components", Icons.Outlined.Widgets, 2),
        Triple("Me", Icons.Outlined.Person, 3),
    )

    Scaffold(
        containerColor = Canvas,
        bottomBar = {
            NavigationBar(containerColor = SurfaceWhite, tonalElevation = 0.dp) {
                tabs.forEach { (label, icon, index) ->
                    NavigationBarItem(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        icon = { Icon(icon, contentDescription = label) },
                        label = { Text(label) },
                    )
                }
            }
        },
    ) { padding ->
        when (selectedTab) {
            0 -> OverviewScreen(ComponentRegistry.components, ArchitectureRegistry.roots, Modifier.padding(padding))
            1 -> SurfacesScreen(ArchitectureRegistry.roots, Modifier.padding(padding))
            2 -> ComponentsScreen(ComponentRegistry.components, Modifier.padding(padding))
            else -> MeScreen(ComponentRegistry.components, Modifier.padding(padding))
        }
    }
}

@Composable
private fun OverviewScreen(
    components: List<IntegratedComponent>,
    roots: List<ArchitectureRoot>,
    modifier: Modifier = Modifier,
) {
    val linked = components.count { it.supported }
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            PageHeader("Overview", "__APP_NAME__", "__APP_DESCRIPTION__")
            Spacer(Modifier.height(16.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                StatTile("Architectures", roots.size.toString(), Modifier.weight(1f))
                StatTile("Linked", linked.toString(), Modifier.weight(1f))
                StatTile("Plan", (components.size - linked).toString(), Modifier.weight(1f))
            }
        }
        item {
            Panel("Foundation status", "The initial delivery boundary is visible and explicit.") {
                StatusRow("Repository baseline", "Canon, identity, workspace metadata, and root layout", "Ready", true)
                StatusRow("Architecture surface", "Kotlin/Compose root with bottom navigation", "Ready", true)
                StatusRow("First vertical workflow", "Requirements, API contracts, and package modules", "Next", false)
            }
        }
    }
}

@Composable
private fun SurfacesScreen(roots: List<ArchitectureRoot>, modifier: Modifier = Modifier) {
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        item {
            PageHeader("Surfaces", "Application surfaces", "Each architecture keeps its own root, manifest, and toolchain.")
            Spacer(Modifier.height(8.dp))
        }
        items(roots.size) { index ->
            val root = roots[index]
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(SurfaceAlt, RoundedCornerShape(10.dp))
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(
                    modifier = Modifier
                        .size(30.dp)
                        .background(TechBlue, RoundedCornerShape(9.dp)),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = root.id.take(2).uppercase(),
                        color = Color.White,
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                    )
                }
                Spacer(Modifier.width(10.dp))
                Column(Modifier.weight(1f)) {
                    Text(root.title, color = Ink, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                    Text(root.root, color = Muted, style = MaterialTheme.typography.bodySmall)
                }
                Spacer(Modifier.width(8.dp))
                Text(root.kind, color = Muted, style = MaterialTheme.typography.labelSmall)
            }
        }
    }
}

@Composable
private fun ComponentsScreen(components: List<IntegratedComponent>, modifier: Modifier = Modifier) {
    val linked = components.count { it.supported }
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        item {
            PageHeader(
                "Components",
                "Component composition",
                "$linked linked · ${components.size - linked} planned · resolved from sibling SDK manifests.",
            )
            Spacer(Modifier.height(8.dp))
        }
        if (components.isEmpty()) {
            item {
                Text("No common component is enabled for this application.", color = Muted, style = MaterialTheme.typography.bodySmall)
            }
        } else {
            items(components.size) { index ->
                ComponentRow(components[index])
            }
        }
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(TechBlueSoft, RoundedCornerShape(14.dp))
                    .padding(18.dp),
            ) {
                Text("RECOMMENDED NEXT MOVE", color = TechBlue, style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(6.dp))
                Text("Write the requirement before the screen.", color = Ink, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height(6.dp))
                Text(
                    "Capture the first workflow in docs/product/prd/PRD.md, record the boundary decision, then add API, SDK, and package work.",
                    color = Muted,
                    style = MaterialTheme.typography.bodySmall,
                )
            }
        }
    }
}

@Composable
private fun MeScreen(components: List<IntegratedComponent>, modifier: Modifier = Modifier) {
    val iam = components.firstOrNull { it.id == "iam" }
    val iamLinked = iam?.supported == true

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            PageHeader("Me", "My account", "Identity, session, and account security through sdkwork-iam.")
        }
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
                shape = RoundedCornerShape(14.dp),
            ) {
                Column(Modifier.padding(18.dp)) {
                    Row(verticalAlignment = Alignment.Top) {
                        Box(
                            modifier = Modifier
                                .size(52.dp)
                                .background(TechBlue, RoundedCornerShape(16.dp)),
                            contentAlignment = Alignment.Center,
                        ) {
                            Text(
                                text = "__APP_INITIALS__",
                                color = Color.White,
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                            )
                        }
                        Spacer(Modifier.width(14.dp))
                        Column(Modifier.weight(1f)) {
                            Text(
                                text = if (iamLinked) "IAM session ready" else "IAM is not selected",
                                color = Ink,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.SemiBold,
                            )
                            Spacer(Modifier.height(4.dp))
                            Text(
                                text = if (iamLinked) {
                                    "Connect the IAM runtime with a base URL and the global token manager to load the signed-in profile."
                                } else {
                                    "Select the iam component to enable account, session, and security capabilities."
                                },
                                color = Muted,
                                style = MaterialTheme.typography.bodySmall,
                            )
                        }
                        Spacer(Modifier.width(8.dp))
                        StatusPill(if (iamLinked) "Linked" else "Plan", iamLinked)
                    }

                    Spacer(Modifier.height(16.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        AccountFact("Application", "sdkwork-__APP_CODE__", Modifier.weight(1f))
                        AccountFact(
                            "IAM package",
                            iam?.sdkPackage?.takeIf { it.isNotEmpty() } ?: "—",
                            Modifier.weight(1f),
                        )
                    }
                    Spacer(Modifier.height(10.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        AccountFact("Tenant", "Loaded at runtime", Modifier.weight(1f))
                        AccountFact("Session", "Global token manager", Modifier.weight(1f))
                    }
                }
            }
        }
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
                shape = RoundedCornerShape(14.dp),
            ) {
                Column(Modifier.padding(18.dp)) {
                    CapabilityRow("Profile", "Display name, email, phone", "iam.users.current")
                    Spacer(Modifier.height(8.dp))
                    CapabilityRow("Session", "Retrieve and revoke the current session", "auth.sessions.current")
                    Spacer(Modifier.height(8.dp))
                    CapabilityRow("Security", "Password and binding changes", "iam.users.current")
                    Spacer(Modifier.height(8.dp))
                    CapabilityRow("Preferences", "Locale, theme, and notification defaults", "config/components")
                }
            }
        }
    }
}

@Composable
private fun StatusPill(label: String, ready: Boolean) {
    Box(
        modifier = Modifier
            .background(if (ready) SuccessSoft else WarningSoft, RoundedCornerShape(999.dp))
            .padding(horizontal = 9.dp, vertical = 3.dp),
    ) {
        Text(
            text = label,
            color = if (ready) Success else Warning,
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.SemiBold,
        )
    }
}

@Composable
private fun AccountFact(label: String, value: String, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .background(SurfaceAlt, RoundedCornerShape(10.dp))
            .padding(12.dp),
    ) {
        Text(label.uppercase(), color = Muted, style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.SemiBold)
        Spacer(Modifier.height(4.dp))
        Text(value, color = Ink, style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.SemiBold, maxLines = 1)
    }
}

@Composable
private fun CapabilityRow(title: String, detail: String, source: String) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(SurfaceAlt, RoundedCornerShape(10.dp))
            .padding(12.dp),
    ) {
        Text(title, color = Ink, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
        Spacer(Modifier.height(2.dp))
        Text(detail, color = Muted, style = MaterialTheme.typography.bodySmall)
        Spacer(Modifier.height(4.dp))
        Text(source, color = TechBlueStrong, style = MaterialTheme.typography.labelSmall)
    }
}

@Composable
private fun PageHeader(eyebrow: String, title: String, subtitle: String) {
    Text(
        text = eyebrow.uppercase(),
        color = TechBlue,
        style = MaterialTheme.typography.labelSmall,
        fontWeight = FontWeight.Bold,
    )
    Spacer(Modifier.height(6.dp))
    Text(title, color = Ink, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
    Spacer(Modifier.height(4.dp))
    Text(subtitle, color = Muted, style = MaterialTheme.typography.bodySmall)
}

@Composable
private fun StatTile(label: String, value: String, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .background(SurfaceAlt, RoundedCornerShape(10.dp))
            .padding(12.dp),
    ) {
        Text(label.uppercase(), color = Muted, style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.SemiBold)
        Spacer(Modifier.height(4.dp))
        Text(value, color = Ink, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun Panel(title: String, subtitle: String, content: @Composable () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
        shape = RoundedCornerShape(14.dp),
    ) {
        Column(Modifier.padding(18.dp)) {
            Text(title, color = Ink, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(4.dp))
            Text(subtitle, color = Muted, style = MaterialTheme.typography.bodySmall)
            Spacer(Modifier.height(12.dp))
            content()
        }
    }
}

@Composable
private fun StatusRow(title: String, subtitle: String, status: String, ready: Boolean) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 8.dp)
            .background(SurfaceAlt, RoundedCornerShape(10.dp))
            .padding(12.dp),
        verticalAlignment = Alignment.Top,
    ) {
        Column(Modifier.weight(1f)) {
            Text(title, color = Ink, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
            Text(subtitle, color = Muted, style = MaterialTheme.typography.bodySmall)
        }
        Spacer(Modifier.width(8.dp))
        Box(
            modifier = Modifier
                .background(if (ready) SuccessSoft else WarningSoft, RoundedCornerShape(999.dp))
                .padding(horizontal = 9.dp, vertical = 3.dp),
        ) {
            Text(
                status,
                color = if (ready) Success else Warning,
                style = MaterialTheme.typography.labelSmall,
                fontWeight = FontWeight.SemiBold,
            )
        }
    }
}

@Composable
private fun ComponentRow(component: IntegratedComponent) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(SurfaceAlt, RoundedCornerShape(10.dp))
            .padding(12.dp),
        verticalAlignment = Alignment.Top,
    ) {
        Box(
            modifier = Modifier
                .size(32.dp)
                .background(TechBlue, RoundedCornerShape(9.dp)),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = component.id.take(2).uppercase(),
                color = Color.White,
                style = MaterialTheme.typography.labelSmall,
                fontWeight = FontWeight.Bold,
            )
        }
        Spacer(Modifier.width(10.dp))
        Column(Modifier.weight(1f)) {
            Text(component.title, color = Ink, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
            Text(
                text = if (component.supported) component.sdkPackage.ifEmpty { component.mode } else component.reason,
                color = if (component.supported) TechBlueStrong else Warning,
                style = MaterialTheme.typography.bodySmall,
                maxLines = 2,
            )
        }
        Spacer(Modifier.width(8.dp))
        Box(
            modifier = Modifier
                .background(if (component.supported) SuccessSoft else WarningSoft, RoundedCornerShape(999.dp))
                .padding(horizontal = 8.dp, vertical = 3.dp),
        ) {
            Text(
                text = if (component.supported) "Linked" else "Plan",
                color = if (component.supported) Success else Warning,
                style = MaterialTheme.typography.labelSmall,
                fontWeight = FontWeight.SemiBold,
            )
        }
    }
}
