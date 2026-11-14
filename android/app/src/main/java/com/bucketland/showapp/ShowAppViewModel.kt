package com.bucketland.showapp

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.bucketland.showapp.data.ActivityData
import com.bucketland.showapp.data.KeywordStore
import com.bucketland.showapp.data.ShowAppRepository
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

private const val CONCURRENT_REQUESTS = 10

data class ShowAppUiState(
    val activities: List<ActivityData> = emptyList(),
    val loading: Boolean = false,
    val hasFetched: Boolean = false,
    val error: String? = null,
    val selectedCity: String = "",
    val selectedArtist: String = "",
    val keywords: List<String> = emptyList(),
    val keywordsLoading: Boolean = false,
    val keywordsProcessing: Boolean = false,
    val snackbarMessage: String? = null,
)

class ShowAppViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = ShowAppRepository(KeywordStore(application))
    private val _state = MutableStateFlow(ShowAppUiState())
    val state: StateFlow<ShowAppUiState> = _state.asStateFlow()

    init {
        loadKeywords()
    }

    fun loadKeywords() {
        if (_state.value.keywordsLoading) return
        viewModelScope.launch {
            _state.update { it.copy(keywordsLoading = true) }
            try {
                val keywords = repository.loadKeywords()
                _state.update { it.copy(keywords = keywords) }
            } catch (e: CancellationException) {
                throw e
            } catch (_: Exception) {
                // Cached keywords are optional; fetch errors surface when the user acts.
            } finally {
                _state.update { it.copy(keywordsLoading = false) }
            }
        }
    }

    fun fetchData() {
        if (_state.value.loading) return
        viewModelScope.launch {
            _state.update {
                it.copy(loading = true, hasFetched = true, error = null, activities = emptyList())
            }
            try {
                val accessToken = repository.fetchAccessToken()
                val keywords = repository.cachedKeywords() ?: repository.loadKeywords()
                _state.update { it.copy(keywords = keywords) }

                val collected = mutableListOf<ActivityData>()
                for (chunk in keywords.chunked(CONCURRENT_REQUESTS)) {
                    val chunkResults = coroutineScope {
                        chunk.map { keyword ->
                            async { repository.fetchActivities(keyword, accessToken) }
                        }.awaitAll()
                    }
                    collected += chunkResults.flatten()
                    _state.update { it.copy(activities = collected.toList()) }
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                _state.update { it.copy(error = e.messageOrFallback("Failed to fetch data")) }
            } finally {
                _state.update { it.copy(loading = false) }
            }
        }
    }

    suspend fun addKeyword(raw: String): Boolean {
        val keyword = raw.trim()
        if (keyword.isEmpty() || _state.value.keywordsProcessing) return false

        _state.update { it.copy(keywordsProcessing = true) }
        return try {
            val updated = _state.value.keywords + keyword
            repository.updateKeywords(updated)
            _state.update { it.copy(keywords = updated) }
            showSnackbar("Item added! \u2728")
            true
        } catch (e: CancellationException) {
            throw e
        } catch (_: Exception) {
            showSnackbar("Failed to add item")
            false
        } finally {
            _state.update { it.copy(keywordsProcessing = false) }
        }
    }

    fun removeKeyword(index: Int) {
        if (_state.value.keywordsProcessing) return
        val current = _state.value.keywords
        if (index !in current.indices) return
        val removed = current[index]

        viewModelScope.launch {
            _state.update { it.copy(keywordsProcessing = true) }
            try {
                val updated = current.filterIndexed { i, _ -> i != index }
                repository.updateKeywords(updated)
                _state.update { it.copy(keywords = updated) }
                showSnackbar("\"$removed\" removed")
            } catch (e: CancellationException) {
                throw e
            } catch (_: Exception) {
                showSnackbar("Failed to remove item")
            } finally {
                _state.update { it.copy(keywordsProcessing = false) }
            }
        }
    }

    fun selectCity(city: String) {
        _state.update { it.copy(selectedCity = city) }
    }

    fun selectArtist(artist: String) {
        _state.update { it.copy(selectedArtist = artist) }
    }

    fun consumeSnackbar() {
        _state.update { it.copy(snackbarMessage = null) }
    }

    private fun showSnackbar(message: String) {
        _state.update { it.copy(snackbarMessage = message) }
    }

    private fun Exception.messageOrFallback(fallback: String): String =
        message?.takeIf { it.isNotBlank() } ?: fallback
}
