package com.bucketland.showapp.ui

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColors = lightColorScheme(
    primary = Color(0xFF667EEA),
    onPrimary = Color.White,
    primaryContainer = Color(0xFFDDE3FF),
    onPrimaryContainer = Color(0xFF001158),
    secondary = Color(0xFF764BA2),
    onSecondary = Color.White,
    tertiary = Color(0xFFF093FB),
    background = Color(0xFFFDFBFF),
    surface = Color(0xFFFDFBFF),
)

private val DarkColors = darkColorScheme(
    primary = Color(0xFFAEB9FF),
    onPrimary = Color(0xFF14247A),
    primaryContainer = Color(0xFF2E3F94),
    onPrimaryContainer = Color(0xFFDDE3FF),
    secondary = Color(0xFFD3B4FF),
    onSecondary = Color(0xFF3C1D63),
    tertiary = Color(0xFFF6B0FA),
)

@Composable
fun ShowAppTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (isSystemInDarkTheme()) DarkColors else LightColors,
        content = content,
    )
}
