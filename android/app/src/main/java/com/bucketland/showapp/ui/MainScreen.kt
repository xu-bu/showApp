package com.bucketland.showapp.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.bucketland.showapp.ShowAppViewModel
import com.bucketland.showapp.data.ActivityData

@Composable
fun MainScreen(viewModel: ShowAppViewModel, onManageKeywords: () -> Unit) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    val cities = remember(state.activities) {
        state.activities.map { it.city }.filter { it.isNotBlank() }.distinct().sorted()
    }
    val artists = remember(state.activities) {
        state.activities.map { it.artist }.filter { it.isNotBlank() }.distinct().sorted()
    }
    val filtered = remember(state.activities, state.selectedCity, state.selectedArtist) {
        state.activities.filter { item ->
            (state.selectedCity.isBlank() || item.city == state.selectedCity) &&
                (state.selectedArtist.isBlank() || item.artist == state.selectedArtist)
        }
    }

    var zoomImageUrl by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .windowInsetsPadding(WindowInsets.safeDrawing)
            .padding(16.dp),
    ) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = viewModel::fetchData, enabled = !state.loading) {
                Text("Fetch Data")
            }
            OutlinedButton(onClick = onManageKeywords) {
                Text("Manage Keywords")
            }
        }

        if (state.loading) {
            Box(
                modifier = Modifier.fillMaxWidth().padding(top = 20.dp),
                contentAlignment = Alignment.Center,
            ) {
                CircularProgressIndicator()
            }
        }

        state.error?.let { error ->
            Text(
                text = error,
                color = MaterialTheme.colorScheme.error,
                fontSize = 14.sp,
                modifier = Modifier.padding(top = 20.dp),
            )
        }

        if (state.activities.isNotEmpty()) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(top = 20.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                FilterDropdown(
                    label = "All Cities",
                    options = cities,
                    selected = state.selectedCity,
                    onSelect = viewModel::selectCity,
                    modifier = Modifier.weight(1f),
                )
                FilterDropdown(
                    label = "All Artists",
                    options = artists,
                    selected = state.selectedArtist,
                    onSelect = viewModel::selectArtist,
                    modifier = Modifier.weight(1f),
                )
            }
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(top = 20.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp),
        ) {
            itemsIndexed(filtered) { _, item ->
                ActivityCard(item = item, onImageClick = { zoomImageUrl = item.avatar })
            }
            if (state.hasFetched && !state.loading && state.error == null && filtered.isEmpty()) {
                item {
                    Text(
                        text = when {
                            state.keywords.isEmpty() -> "No keywords yet. Add some in Manage Keywords."
                            state.activities.isEmpty() -> "No events found."
                            else -> "No events match the selected filters."
                        },
                        modifier = Modifier.fillMaxWidth().padding(vertical = 24.dp),
                    )
                }
            }
        }
    }

    zoomImageUrl?.let { url ->
        ZoomableImageDialog(url = url, onDismiss = { zoomImageUrl = null })
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun FilterDropdown(
    label: String,
    options: List<String>,
    selected: String,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    var expanded by remember { mutableStateOf(false) }

    ExposedDropdownMenuBox(
        expanded = expanded,
        onExpandedChange = { expanded = it },
        modifier = modifier,
    ) {
        OutlinedTextField(
            value = selected,
            onValueChange = {},
            readOnly = true,
            singleLine = true,
            label = { Text(label) },
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
            modifier = Modifier.fillMaxWidth().menuAnchor(MenuAnchorType.PrimaryNotEditable),
        )
        ExposedDropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            DropdownMenuItem(
                text = { Text(label) },
                onClick = {
                    onSelect("")
                    expanded = false
                },
            )
            options.forEach { option ->
                DropdownMenuItem(
                    text = { Text(option) },
                    onClick = {
                        onSelect(option)
                        expanded = false
                    },
                )
            }
        }
    }
}

@Composable
private fun ActivityCard(item: ActivityData, onImageClick: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(item.title, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            Text(item.artist)
            Text(item.city)
            Text(item.showTime)
            Text(item.siteName)
            if (item.avatar.isNotBlank()) {
                AsyncImage(
                    model = item.avatar,
                    contentDescription = item.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .padding(top = 10.dp)
                        .size(100.dp)
                        .clip(CircleShape)
                        .clickable(onClick = onImageClick),
                )
            }
        }
    }
}

@Composable
private fun ZoomableImageDialog(url: String, onDismiss: () -> Unit) {
    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false),
    ) {
        var scale by remember { mutableFloatStateOf(1f) }
        var offset by remember { mutableStateOf(Offset.Zero) }

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black)
                .pointerInput(Unit) {
                    detectTransformGestures { _, pan, zoom, _ ->
                        scale = (scale * zoom).coerceIn(1f, 5f)
                        offset = if (scale > 1f) offset + pan else Offset.Zero
                    }
                },
            contentAlignment = Alignment.Center,
        ) {
            AsyncImage(
                model = url,
                contentDescription = null,
                contentScale = ContentScale.Fit,
                modifier = Modifier
                    .fillMaxWidth()
                    .graphicsLayer {
                        scaleX = scale
                        scaleY = scale
                        translationX = offset.x
                        translationY = offset.y
                    },
            )
            TextButton(
                onClick = onDismiss,
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .windowInsetsPadding(WindowInsets.safeDrawing)
                    .padding(8.dp),
            ) {
                Text("Close", color = Color.White)
            }
        }
    }
}
