package com.bucketland.showapp.data

data class ActivityData(
    val title: String,
    val city: String,
    val avatar: String,
    val showTime: String,
    val siteName: String,
    val artist: String,
)

@kotlinx.serialization.Serializable
data class KeywordDoc(
    val id: Long = 0,
    @kotlinx.serialization.SerialName("created_at")
    val createdAt: String = "",
    val keyWords: List<String> = emptyList(),
)
