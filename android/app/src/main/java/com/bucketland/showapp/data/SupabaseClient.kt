package com.bucketland.showapp.data

import java.io.IOException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import okhttp3.Headers
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

/** Minimal PostgREST client for the single `showApp` keywords row. */
class SupabaseClient(baseUrl: String, private val apiKey: String) {

    private val baseUrl = baseUrl.trim().trimEnd('/')
    private val json = Json { ignoreUnknownKeys = true }

    suspend fun fetchKeywords(): List<String> {
        checkConfigured()
        val request = Request.Builder()
            .url("$baseUrl/rest/v1/showApp?select=*")
            .headers(commonHeaders())
            .get()
            .build()
        val docs = json.decodeFromString<List<KeywordDoc>>(execute(request))
        return docs.firstOrNull()?.keyWords.orEmpty()
    }

    suspend fun updateKeywords(keywords: List<String>) {
        checkConfigured()
        val body = buildJsonObject {
            put("keyWords", buildJsonArray { keywords.forEach { add(JsonPrimitive(it)) } })
        }
        val request = Request.Builder()
            .url("$baseUrl/rest/v1/showApp?id=eq.1")
            .headers(commonHeaders())
            .patch(body.toString().toRequestBody(JSON_MEDIA_TYPE))
            .build()
        execute(request)
    }

    private fun commonHeaders(): Headers = Headers.Builder()
        .add("apikey", apiKey)
        .add("Authorization", "Bearer $apiKey")
        .add("Content-Type", "application/json")
        .build()

    private fun checkConfigured() {
        check(baseUrl.isNotBlank() && apiKey.isNotBlank()) {
            "Supabase is not configured. Set SUPABASE_URL and SUPABASE_KEY."
        }
    }

    private suspend fun execute(request: Request): String = withContext(Dispatchers.IO) {
        Http.client.newCall(request).execute().use { response ->
            val text = response.body?.string().orEmpty()
            if (!response.isSuccessful) {
                throw IOException("HTTP ${response.code}: ${text.take(300)}")
            }
            text
        }
    }

    private companion object {
        val JSON_MEDIA_TYPE = "application/json".toMediaType()
    }
}
