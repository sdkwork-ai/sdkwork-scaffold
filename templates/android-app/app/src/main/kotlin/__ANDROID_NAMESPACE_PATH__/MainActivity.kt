package __ANDROID_NAMESPACE__

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
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
                    FoundationScreen(ComponentRegistry.components)
                }
            }
        }
    }
}

@Composable
private fun FoundationScreen(components: List<IntegratedComponent>) {
    val linked = components.count { it.supported }
    val planned = components.size - linked

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Spacer(Modifier.height(20.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = "__APP_NAME__",
                    color = Ink,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.SemiBold,
                )
                Text(
                    text = "Android",
                    color = TechBlueStrong,
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.SemiBold,
                )
            }
            Spacer(Modifier.height(4.dp))
            Text(
                text = "SDKWORK APPLICATION FOUNDATION",
                color = TechBlue,
                style = MaterialTheme.typography.labelSmall,
                fontWeight = FontWeight.Bold,
            )
            Spacer(Modifier.height(6.dp))
            Text(
                text = "__APP_DESCRIPTION__",
                color = Muted,
                style = MaterialTheme.typography.bodySmall,
            )
            Spacer(Modifier.height(16.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                StatTile("Components", components.size.toString(), Modifier.weight(1f))
                StatTile("Linked", linked.toString(), Modifier.weight(1f))
                StatTile("Plan", planned.toString(), Modifier.weight(1f))
            }
            Spacer(Modifier.height(4.dp))
        }

        item {
            Panel(title = "Foundation status", subtitle = "The initial delivery boundary is visible and explicit.") {
                StatusRow("Repository baseline", "Canon, identity, workspace metadata, and root layout", "Ready", true)
                StatusRow("Architecture surface", "Kotlin/Compose root with component registry", "Ready", true)
                StatusRow("First vertical workflow", "Requirements, API contracts, and package modules", "Next", false)
            }
        }

        item {
            Panel(title = "Integrated components", subtitle = "$linked linked · $planned planned") {
                if (components.isEmpty()) {
                    Text(
                        text = "No common component is enabled for this application.",
                        color = Muted,
                        style = MaterialTheme.typography.bodySmall,
                    )
                } else {
                    components.forEach { component ->
                        ComponentRow(component)
                        Spacer(Modifier.height(8.dp))
                    }
                }
            }
        }

        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(TechBlueSoft, RoundedCornerShape(14.dp))
                    .padding(18.dp),
            ) {
                Text(
                    text = "RECOMMENDED NEXT MOVE",
                    color = TechBlue,
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.Bold,
                )
                Spacer(Modifier.height(6.dp))
                Text(
                    text = "Write the requirement before the screen.",
                    color = Ink,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                )
                Spacer(Modifier.height(6.dp))
                Text(
                    text = "Capture the first workflow in docs/product/prd/PRD.md, record the boundary decision, then add API, SDK, and package work.",
                    color = Muted,
                    style = MaterialTheme.typography.bodySmall,
                )
            }
        }

        item {
            Spacer(Modifier.height(8.dp))
            Text(
                text = "sdkwork-__APP_CODE__ · Android",
                color = Muted,
                style = MaterialTheme.typography.labelSmall,
            )
            Spacer(Modifier.height(28.dp))
        }
    }
}

@Composable
private fun StatTile(label: String, value: String, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .background(SurfaceAlt, RoundedCornerShape(10.dp))
            .padding(12.dp),
    ) {
        Text(
            text = label.uppercase(),
            color = Muted,
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.SemiBold,
        )
        Spacer(Modifier.height(4.dp))
        Text(
            text = value,
            color = Ink,
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
        )
    }
}

@Composable
private fun Panel(
    title: String,
    subtitle: String,
    content: @Composable () -> Unit,
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = SurfaceWhite),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
        shape = RoundedCornerShape(14.dp),
    ) {
        Column(Modifier.padding(18.dp)) {
            Text(
                text = title,
                color = Ink,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
            )
            Spacer(Modifier.height(4.dp))
            Text(text = subtitle, color = Muted, style = MaterialTheme.typography.bodySmall)
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
            Text(
                text = title,
                color = Ink,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.SemiBold,
            )
            Text(text = subtitle, color = Muted, style = MaterialTheme.typography.bodySmall)
        }
        Spacer(Modifier.width(8.dp))
        Box(
            modifier = Modifier
                .background(if (ready) SuccessSoft else WarningSoft, RoundedCornerShape(999.dp))
                .padding(horizontal = 9.dp, vertical = 3.dp),
        ) {
            Text(
                text = status,
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
                .width(32.dp)
                .height(32.dp)
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
            Text(
                text = component.title,
                color = Ink,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.SemiBold,
            )
            Text(
                text = if (component.supported) {
                    component.sdkPackage.ifEmpty { component.mode }
                } else {
                    component.reason
                },
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
