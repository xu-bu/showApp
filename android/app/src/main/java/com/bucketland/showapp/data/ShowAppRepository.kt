package com.bucketland.showapp.data

import com.bucketland.showapp.BuildConfig
import kotlinx.coroutines.CancellationException

class ShowAppRepository(private val store: KeywordStore) {

    private val showStart = ShowStartClient(BuildConfig.API_GATEWAY_URL)
    private val supabase = SupabaseClient(BuildConfig.SUPABASE_URL, BuildConfig.SUPABASE_KEY)

    fun cachedKeywords(): List<String>? = store.get()

    suspend fun loadKeywords(): List<String> {
        cachedKeywords()?.let { return it }
        val remote = supabase.fetchKeywords()
        store.set(remote)
        return remote
    }

    suspend fun fetchAccessToken(): String = showStart.fetchAccessToken()

    suspend fun fetchActivities(keyword: String, accessToken: String): List<ActivityData> =
        showStart.fetchActivities(keyword, accessToken)

    fun cacheKeywords(keywords: List<String>) = store.set(keywords)

    /** Returns false when Supabase is unreachable; keywords stay saved locally. */
    suspend fun syncKeywords(keywords: List<String>): Boolean =
        try {
            supabase.updateKeywords(keywords)
            true
        } catch (e: CancellationException) {
            throw e
        } catch (_: Exception) {
            false
        }
}
