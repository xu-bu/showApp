package com.bucketland.showapp.data

import java.io.IOException
import java.security.MessageDigest
import java.security.SecureRandom
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonObject
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

/**
 * Client for showstart's mobile API. Request signing mirrors app/injectRequestConfig.tsx
 * from the web app so the same endpoints accept native requests.
 */
class ShowStartClient(gatewayUrl: String) {

    private val gatewayUrl = gatewayUrl.trim().trimEnd('/')

    suspend fun fetchAccessToken(): String {
        val data = buildJsonObject {
            put("sign", "")
            put("st_flpv", ST_FLPV)
        }
        val response = execute(
            url = "$BASE_URL/v3/waf/gettoken",
            sourcePath = "/waf/gettoken",
            accessToken = "",
            data = data,
        )
        val token = (response["result"] as? JsonObject)
            ?.get("accessToken") as? JsonObject
        return token?.get("access_token")?.jsonPrimitive?.contentOrNull
            ?: throw IOException("Missing access token in response")
    }

    suspend fun fetchActivities(keyword: String, accessToken: String): List<ActivityData> {
        val data = buildJsonObject {
            put("activityIds", "")
            put("cityCode", "99999")
            put("couponCode", "")
            put("hosterId", "")
            put("keyword", keyword)
            put("pageNo", 1)
            put("performerId", "")
            put("sign", "")
            put("siteId", "")
            put("st_flpv", ST_FLPV)
            put("style", "")
            put("tag", "")
            put("themeId", "")
            put("tourId", "")
            put("trackPath", "")
        }
        val response = execute(
            url = "$BASE_URL/v3/wap/activity/list",
            sourcePath = "/wap/activity/list",
            accessToken = accessToken,
            data = data,
        )
        val activityInfo = (response["result"] as? JsonObject)
            ?.get("activityInfo") as? JsonArray
            ?: return emptyList()

        return activityInfo.mapNotNull { element ->
            (element as? JsonObject)?.let { item ->
                ActivityData(
                    artist = keyword,
                    title = item.string("title"),
                    city = item.string("city"),
                    avatar = item.string("avatar"),
                    showTime = item.string("showTime"),
                    siteName = item.string("siteName"),
                )
            }
        }
    }

    private suspend fun execute(
        url: String,
        sourcePath: String,
        accessToken: String,
        data: JsonObject,
    ): JsonObject {
        val bodyJson = data.toString()
        val headers = buildHeaders(accessToken, bodyJson, sourcePath)

        // The web app proxies through a gateway to avoid browser CORS. Native code can
        // call showstart directly, but a gateway URL is still honored when configured.
        val responseText = if (gatewayUrl.isNotBlank()) {
            val payload = buildJsonObject {
                put("method", "post")
                put("url", url)
                put("data", data)
                putJsonObject("headers") {
                    headers.forEach { (name, value) -> put(name, value) }
                }
            }.toString()
            postJson(
                url = "$gatewayUrl/api/requestHelper",
                headers = mapOf("Content-Type" to "application/json"),
                bodyJson = payload,
            )
        } else {
            postJson(url, headers, bodyJson)
        }

        val root = json.parseToJsonElement(responseText) as? JsonObject
            ?: throw IOException("Unexpected response from $url")
        // Gateway responses wrap the upstream body in { data: ... }.
        return if (root.containsKey("result")) root else (root["data"] as? JsonObject ?: root)
    }

    private fun buildHeaders(
        accessToken: String,
        bodyJson: String,
        sourcePath: String,
    ): Map<String, String> {
        val traceId = randomString(32) + (NOW_SECONDS * 1000L)
        val headers = linkedMapOf(
            "Cookie" to
                "Hm_lvt_da038bae565bb601b53cc9cb25cdca74=1689569273; " +
                "Hm_lpvt_da038bae565bb601b53cc9cb25cdca74=$NOW_SECONDS",
            "Content-Type" to "application/json",
            "st_flpv" to ST_FLPV,
            "User-Agent" to USER_AGENT,
            "Origin" to BASE_URL,
            "Referer" to BASE_URL,
            "cusat" to accessToken,
            "cusut" to "nil",
            "cusid" to "0",
            "cusit" to "nil",
            "cusname" to "nil",
            "cdeviceno" to LOCAL_TOKEN,
            "cuuserref" to LOCAL_TOKEN,
            "cversion" to "997",
            "cterminal" to "wap",
            "csappid" to "wap",
            "cdeviceinfo" to DEVICE_INFO,
            "crtraceid" to traceId,
            "ctrackpath" to "",
            "csourcepath" to "",
        )
        val signSource = accessToken + "0wap" + LOCAL_TOKEN + bodyJson +
            sourcePath + "997" + "wap" + traceId
        headers["crpsign"] = md5Hex(signSource)
        return headers
    }

    private suspend fun postJson(
        url: String,
        headers: Map<String, String>,
        bodyJson: String,
    ): String = withContext(Dispatchers.IO) {
        val request = Request.Builder()
            .url(url)
            .post(bodyJson.toRequestBody(JSON_MEDIA_TYPE))
            .apply { headers.forEach { (name, value) -> addHeader(name, value) } }
            .build()

        Http.client.newCall(request).execute().use { response ->
            val text = response.body?.string().orEmpty()
            if (!response.isSuccessful) {
                throw IOException("HTTP ${response.code} from $url: ${text.take(300)}")
            }
            text
        }
    }

    private fun JsonObject.string(key: String): String =
        (this[key] as? JsonPrimitive)?.contentOrNull.orEmpty()

    private companion object {
        const val BASE_URL = "https://wap.showstart.com"
        const val ST_FLPV = "540fLHaRp55EDb6ihpbg"
        const val USER_AGENT =
            "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) " +
                "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 " +
                "Mobile/15E148 Safari/604.1"
        const val DEVICE_INFO =
            "%7B%22vendorName%22:%22%22,%22deviceMode%22:%22iPhone%22," +
                "%22deviceName%22:%22%22,%22systemName%22:%22ios%22," +
                "%22systemVersion%22:%2213.2.3%22,%22cpuMode%22:%22%20%22," +
                "%22cpuCores%22:%22%22,%22cpuArch%22:%22%22,%22memerySize%22:%22%22," +
                "%22diskSize%22:%22%22,%22network%22:%22UNKNOWN%22," +
                "%22resolution%22:%22390*844%22,%22pixelResolution%22:%22%22%7D"

        val JSON_MEDIA_TYPE = "application/json".toMediaType()
        val json = Json { ignoreUnknownKeys = true }
        val random = SecureRandom()
        const val RANDOM_CHARS =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

        val NOW_SECONDS: Long = System.currentTimeMillis() / 1000
        val LOCAL_TOKEN: String = randomString(32)

        fun randomString(length: Int): String = buildString(length) {
            repeat(length) { append(RANDOM_CHARS[random.nextInt(RANDOM_CHARS.length)]) }
        }

        fun md5Hex(text: String): String =
            MessageDigest.getInstance("MD5")
                .digest(text.toByteArray(Charsets.UTF_8))
                .joinToString("") { "%02x".format(it.toInt() and 0xff) }
    }
}
