package com.nomadspeak.mobile;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "NomadSpeakNativeView";
    // Temporary host-isolation switch: set true to launch the minimal WebView test page.
    // Set back to false to return to normal app startup.
    private static final boolean ENABLE_HOST_ISOLATION_TEST_PAGE = true;

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

        webView.post(() -> logWebViewDiagnostics("postOnCreate", webView));
        webView.addOnLayoutChangeListener((v, left, top, right, bottom, oldLeft, oldTop, oldRight, oldBottom) ->
            logWebViewDiagnostics("onLayoutChange", webView)
        );

        if (ENABLE_HOST_ISOLATION_TEST_PAGE) {
            webView.post(() -> webView.loadUrl(bridge.getLocalUrl() + "/host-isolation-test.html"));
        }
    }

    private void logWebViewDiagnostics(String phase, WebView webView) {
        ViewGroup.LayoutParams lp = webView.getLayoutParams();
        ViewParent parent = webView.getParent();
        Log.d(
            TAG,
            phase
                + " webView width=" + webView.getWidth()
                + " height=" + webView.getHeight()
                + " contentHeight=" + webView.getContentHeight()
                + " scale=" + webView.getScale()
                + " scaleX=" + webView.getScaleX()
                + " scaleY=" + webView.getScaleY()
                + " translationX=" + webView.getTranslationX()
                + " translationY=" + webView.getTranslationY()
                + " padding=(" + webView.getPaddingLeft() + "," + webView.getPaddingTop() + "," + webView.getPaddingRight() + "," + webView.getPaddingBottom() + ")"
                + " lp=(" + layoutParamsToString(lp) + ")"
        );

        int level = 0;
        while (parent instanceof View && level < 5) {
            View parentView = (View) parent;
            ViewGroup.LayoutParams parentLp = parentView.getLayoutParams();
            Log.d(
                TAG,
                phase
                    + " parent[" + level + "] class=" + parentView.getClass().getName()
                    + " width=" + parentView.getWidth()
                    + " height=" + parentView.getHeight()
                    + " scaleX=" + parentView.getScaleX()
                    + " scaleY=" + parentView.getScaleY()
                    + " translationX=" + parentView.getTranslationX()
                    + " translationY=" + parentView.getTranslationY()
                    + " padding=(" + parentView.getPaddingLeft() + "," + parentView.getPaddingTop() + "," + parentView.getPaddingRight() + "," + parentView.getPaddingBottom() + ")"
                    + " lp=(" + layoutParamsToString(parentLp) + ")"
            );
            parent = parentView.getParent();
            level++;
        }
    }

    private String layoutParamsToString(ViewGroup.LayoutParams lp) {
        if (lp == null) return "null";
        return "w=" + lp.width + ",h=" + lp.height + ",class=" + lp.getClass().getName();
    }
}
