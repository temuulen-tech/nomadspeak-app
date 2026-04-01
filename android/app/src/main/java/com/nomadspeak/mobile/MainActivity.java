package com.nomadspeak.mobile;

import android.os.Bundle;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (bridge == null || bridge.getWebView() == null) return;
        WebSettings settings = bridge.getWebView().getSettings();
        if (settings == null) return;

        // Prevent Android WebView from running page-overview autoscaling, which can
        // force the full app into a centered narrow column even when CSS width is 100%.
        settings.setLoadWithOverviewMode(false);
        settings.setUseWideViewPort(false);
    }
}
