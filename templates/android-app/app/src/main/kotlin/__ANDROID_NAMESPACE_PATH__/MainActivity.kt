package __ANDROID_NAMESPACE__

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import __ANDROID_NAMESPACE__.bootstrap.ComponentRegistry
import __ANDROID_NAMESPACE__.bootstrap.IntegratedComponent

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF08110F),
                ) {
                    FoundationScreen(ComponentRegistry.components)
                }
            }
        }
    }
}

@Composable
private fun FoundationScreen(components: List<IntegratedComponent>) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Text(
                text = "SDKWORK APPLICATION FOUNDATION",
                color = Color(0xFFB8F26B),
                style = MaterialTheme.typography.labelSmall,
                fontWeight = FontWeight.Bold,
            )
            Spacer(Modifier.height(18.dp))
            Text(
                text = "__APP_NAME__",
                color = Color(0xFFD7FF9E),
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.Bold,
            )
            Spacer(Modifier.height(10.dp))
            Text(
                text = "Native Android surface initialized with SDKWork component composition.",
                color = Color(0xFFA7B4AC),
                style = MaterialTheme.typography.bodyLarge,
            )
            Spacer(Modifier.height(28.dp))
            Text(
                text = "Integrated components",
                color = Color(0xFFF4F7F2),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
            )
            Spacer(Modifier.height(8.dp))
            if (components.isEmpty()) {
                Text(
                    text = "No common component is enabled for this application.",
                    color = Color(0xFFA7B4AC),
                )
            }
        }
        items(components) { component ->
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF102019)),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Column(Modifier.padding(16.dp)) {
                    Text(
                        text = component.title,
                        color = Color(0xFFF4F7F2),
                        style = MaterialTheme.typography.titleSmall,
                    )
                    Spacer(Modifier.height(4.dp))
                    Text(
                        text = if (component.supported) {
                            component.sdkPackage.ifEmpty { component.mode }
                        } else {
                            component.reason
                        },
                        color = if (component.supported) Color(0xFFB8F26B) else Color(0xFFE6C67D),
                        style = MaterialTheme.typography.bodySmall,
                    )
                }
            }
        }
        item {
            Spacer(Modifier.height(16.dp))
            Text(
                text = "sdkwork-__APP_CODE__",
                color = Color(0xFF718078),
                style = MaterialTheme.typography.bodySmall,
            )
        }
    }
}
