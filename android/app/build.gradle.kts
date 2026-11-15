import java.io.File
import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("org.jetbrains.kotlin.plugin.serialization")
}

fun env(name: String): String = System.getenv(name)?.trim().orEmpty()

fun buildConfigString(name: String): String =
    "\"" + env(name).replace("\\", "\\\\").replace("\"", "\\\"") + "\""

val appVersionName = env("VERSION_NAME").ifBlank { "1.0.0" }
val appVersionCode = env("VERSION_CODE").toIntOrNull() ?: 1
val keystorePath = env("KEYSTORE_FILE")
val hasKeystore = keystorePath.isNotBlank() && File(keystorePath).exists()

android {
    namespace = "com.bucketland.showapp"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.bucketland.showapp"
        minSdk = 26
        targetSdk = 36
        versionCode = appVersionCode
        versionName = appVersionName

        buildConfigField("String", "API_GATEWAY_URL", buildConfigString("API_GATEWAY_URL"))
    }

    signingConfigs {
        if (hasKeystore) {
            create("release") {
                storeFile = File(keystorePath)
                storePassword = env("KEYSTORE_PASSWORD")
                keyAlias = env("KEY_ALIAS")
                keyPassword = env("KEY_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            // Falls back to the debug key so CI still produces an installable APK
            // when signing secrets are not configured.
            signingConfig =
                if (hasKeystore) signingConfigs.getByName("release")
                else signingConfigs.getByName("debug")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    packaging {
        resources.excludes += "/META-INF/{AL2.0,LGPL2.1}"
    }
}

kotlin {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_17)
    }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2025.05.00"))
    implementation("androidx.core:core-ktx:1.16.0")
    implementation("androidx.activity:activity-compose:1.10.1")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.9.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.9.0")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")

    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.10.2")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.8.1")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("io.coil-kt:coil-compose:2.7.0")

    debugImplementation("androidx.compose.ui:ui-tooling")
}
