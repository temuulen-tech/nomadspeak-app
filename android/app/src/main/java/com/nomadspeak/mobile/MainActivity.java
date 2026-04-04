package com.nomadspeak.mobile;

import android.os.Bundle;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    // Temporary host-isolation switch: set true to launch the minimal WebView test page.
    // Set back to false to return to normal app startup.
    private static final boolean ENABLE_HOST_ISOLATION_TEST_PAGE = true;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (bridge == null || bridge.getWebView() == null) return;
        WebSettings settings = bridge.getWebView().getSettings();
        if (settings == null) return;

        // Disable Android WebView zoom/page scaling behavior so CSS px maps 1:1 and
        // the app renders full width instead of a zoomed-out "desktop overview".
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(false);

        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        if (ENABLE_HOST_ISOLATION_TEST_PAGE) {
            bridge.getWebView().post(() -> bridge.getWebView().loadUrl(bridge.getLocalUrl() + "/host-isolation-test.html"));
        }
    }
}
