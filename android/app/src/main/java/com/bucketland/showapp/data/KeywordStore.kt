package com.bucketland.showapp.data

import android.content.Context
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class KeywordStore(context: Context) {
    private val prefs = context.getSharedPreferences("showapp", Context.MODE_PRIVATE)

    fun get(): List<String>? = prefs.getString(KEY, null)?.let { raw ->
        runCatching { Json.decodeFromString<List<String>>(raw) }.getOrNull()
    }

    fun set(keywords: List<String>) {
        prefs.edit().putString(KEY, Json.encodeToString(keywords)).apply()
    }

    private companion object {
        const val KEY = "keyWords"
    }
}
