package com.bucketland.showapp.data

import com.bucketland.showapp.BuildConfig
import java.io.IOException
import kotlinx.coroutines.CancellationException

class ShowAppRepository(private val store: KeywordStore) {

    private val showStart = ShowStartClient(BuildConfig.API_GATEWAY_URL)
    private val keywordsApi = KeywordApiClient(BuildConfig.API_GATEWAY_URL)

    fun cachedKeywords(): List<String>? = store.get()

    suspend fun loadKeywords(): List<String> {
        val local = cachedKeywords().orEmpty()
        val remote = try {
            keywordsApi.fetchKeywords()
        } catch (e: CancellationException) {
            throw e
        } catch (_: IOException) {
            return local
        }
        // Keep cached keywords until the server has some, so switching away from
        // Supabase never wipes a device that already has them.
        val keywords = if (remote.isEmpty() && local.isNotEmpty()) local else remote
        store.set(keywords)
        return keywords
    }

    suspend fun fetchAccessToken(): String = showStart.fetchAccessToken()

    suspend fun fetchActivities(keyword: String, accessToken: String): List<ActivityData> =
        showStart.fetchActivities(keyword, accessToken)

    fun cacheKeywords(keywords: List<String>) = store.set(keywords)

    /** Returns false when the gateway is unreachable; keywords stay saved locally. */
    suspend fun syncKeywords(keywords: List<String>): Boolean =
        try {
            keywordsApi.updateKeywords(keywords)
            true
        } catch (e: CancellationException) {
            throw e
        } catch (_: Exception) {
            false
        }
}
