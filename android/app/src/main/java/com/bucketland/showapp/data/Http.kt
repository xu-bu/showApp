package com.bucketland.showapp.data

import java.util.concurrent.TimeUnit
import okhttp3.OkHttpClient

internal object Http {
    val client: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .callTimeout(90, TimeUnit.SECONDS)
        .build()
}
