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

        // Ensure WebView honors <meta name="viewport" content="width=device-width,...">.
        // Turning wide viewport OFF can make Android ignore the meta viewport and compute
        // a much narrower CSS layout width (observed ~171px), which then constrains the
        // entire app (including fixed overlays) into a centered narrow column.
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(false);

        // Keep scale fixed at 1:1 CSS pixels for app UI so runtime width remains stable.
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
    }
}
