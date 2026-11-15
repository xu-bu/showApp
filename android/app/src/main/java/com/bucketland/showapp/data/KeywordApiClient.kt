package com.bucketland.showapp.data

import java.io.IOException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.put
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

/** Keywords API of the cloudflare-api-gateway worker, backed by Workers KV. */
class KeywordApiClient(gatewayUrl: String) {

    private val gatewayUrl = gatewayUrl.trim().trimEnd('/')
    private val json = Json { ignoreUnknownKeys = true }

    suspend fun fetchKeywords(): List<String> {
        checkConfigured()
        val request = Request.Builder()
            .url("$gatewayUrl/api/keywords")
            .get()
            .build()
        val root = json.parseToJsonElement(execute(request)).jsonObject
        val data = root["data"] as? JsonObject ?: root
        return (data["keywords"] as? JsonArray)
            ?.mapNotNull { (it as? JsonPrimitive)?.contentOrNull }
            .orEmpty()
    }

    suspend fun updateKeywords(keywords: List<String>) {
        checkConfigured()
        val body = buildJsonObject {
            put("keywords", buildJsonArray { keywords.forEach { add(JsonPrimitive(it)) } })
        }
        val request = Request.Builder()
            .url("$gatewayUrl/api/keywords")
            .put(body.toString().toRequestBody(JSON_MEDIA_TYPE))
            .build()
        execute(request)
    }

    private fun checkConfigured() {
        check(gatewayUrl.isNotBlank()) {
            "API gateway is not configured. Set API_GATEWAY_URL."
        }
    }

    private suspend fun execute(request: Request): String = withContext(Dispatchers.IO) {
        Http.client.newCall(request).execute().use { response ->
            val text = response.body?.string().orEmpty()
            if (!response.isSuccessful) {
                throw IOException("HTTP ${response.code} from ${request.url}: ${text.take(300)}")
            }
            text
        }
    }

    private companion object {
        val JSON_MEDIA_TYPE = "application/json".toMediaType()
    }
}