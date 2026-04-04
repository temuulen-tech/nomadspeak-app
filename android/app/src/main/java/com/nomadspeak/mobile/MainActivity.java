package com.nomadspeak.mobile;

import android.os.Bundle;
import android.view.ViewGroup;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final boolean ENABLE_HOST_ISOLATION_TEST_PAGE = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Do not restore WebView view state: Android can restore a previously persisted zoom level
        // (including ~33%) from instance state, which overrides expected 100% page scale.
        super.onCreate(null);

        if (bridge == null || bridge.getWebView() == null) return;
        WebView webView = bridge.getWebView();
        webView.setSaveEnabled(false);

        WebSettings settings = webView.getSettings();
        if (settings == null) return;

        // Force phone-sized viewport behavior and neutral scaling across OEM WebView variants.
        settings.setUseWideViewPort(false);
        settings.setLoadWithOverviewMode(false);
        settings.setLayoutAlgorithm(WebSettings.LayoutAlgorithm.NORMAL);
        settings.setTextZoom(100);
        // Important: do not force an explicit initial page scale.
        // On some OEM WebView builds this can lock visualViewport.scale near ~0.33.
        webView.setInitialScale(0);

        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        if (ENABLE_HOST_ISOLATION_TEST_PAGE) {
            webView.post(() -> webView.loadUrl(bridge.getLocalUrl() + "/host-isolation-test.html"));
        }
    }
}
