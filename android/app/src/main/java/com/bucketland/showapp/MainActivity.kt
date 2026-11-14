package com.bucketland.showapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.lifecycle.viewmodel.compose.viewModel
import com.bucketland.showapp.ui.MainScreen
import com.bucketland.showapp.ui.ManageKeywordsScreen
import com.bucketland.showapp.ui.ShowAppTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ShowAppTheme {
                val viewModel: ShowAppViewModel = viewModel()
                var managingKeywords by rememberSaveable { mutableStateOf(false) }

                if (managingKeywords) {
                    BackHandler { managingKeywords = false }
                    ManageKeywordsScreen(
                        viewModel = viewModel,
                        onBack = { managingKeywords = false },
                    )
                } else {
                    MainScreen(
                        viewModel = viewModel,
                        onManageKeywords = { managingKeywords = true },
                    )
                }
            }
        }
    }
}
