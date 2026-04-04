package com.nomadspeak.mobile;

import android.os.Bundle;
import android.util.Log;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.FrameLayout;
import android.widget.TextView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "NomadSpeakNativeView";
    // Temporary host-isolation switch: set true to launch the minimal WebView test page.
    // Set back to false to return to normal app startup.
    private static final boolean ENABLE_HOST_ISOLATION_TEST_PAGE = true;
    private TextView diagnosticsOverlayView;

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
            setupDiagnosticsOverlay();
        }

        webView.post(() -> {
            logWebViewDiagnostics("postOnCreate", webView);
            updateDiagnosticsOverlay("postOnCreate", webView);
        });
        webView.addOnLayoutChangeListener((v, left, top, right, bottom, oldLeft, oldTop, oldRight, oldBottom) ->
        {
            logWebViewDiagnostics("onLayoutChange", webView);
            updateDiagnosticsOverlay("onLayoutChange", webView);
        }
        );

        if (ENABLE_HOST_ISOLATION_TEST_PAGE) {
            webView.post(() -> {
                webView.loadUrl(bridge.getLocalUrl() + "/host-isolation-test.html");
                updateDiagnosticsOverlay("testPageLoad", webView);
            });
        }
    }

    private void setupDiagnosticsOverlay() {
        if (diagnosticsOverlayView != null) return;
        FrameLayout rootView = findViewById(android.R.id.content);
        if (rootView == null) return;

        TextView diagnosticsView = new TextView(this);
        diagnosticsView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 11);
        diagnosticsView.setTextColor(0xFFFFFFFF);
        diagnosticsView.setBackgroundColor(0xCC000000);
        diagnosticsView.setPadding(16, 16, 16, 16);
        diagnosticsView.setClickable(false);
        diagnosticsView.setFocusable(false);
        diagnosticsView.setText("Native diagnostics pending...");

        FrameLayout.LayoutParams overlayParams = new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.WRAP_CONTENT
        );
        overlayParams.gravity = Gravity.TOP;

        rootView.addView(diagnosticsView, overlayParams);
        diagnosticsOverlayView = diagnosticsView;
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

    private void updateDiagnosticsOverlay(String phase, WebView webView) {
        if (!ENABLE_HOST_ISOLATION_TEST_PAGE || diagnosticsOverlayView == null || webView == null) return;
        diagnosticsOverlayView.setText(buildDiagnosticsText(phase, webView));
    }

    private String buildDiagnosticsText(String phase, WebView webView) {
        StringBuilder diagnostics = new StringBuilder();
        ViewGroup.LayoutParams webViewLp = webView.getLayoutParams();
        diagnostics.append("NATIVE WEBVIEW DIAGNOSTICS [").append(phase).append("]\n");
        diagnostics.append("webView.getWidth()=").append(webView.getWidth()).append('\n');
        diagnostics.append("webView.getHeight()=").append(webView.getHeight()).append('\n');
        diagnostics.append("webView.getScale()=").append(webView.getScale()).append('\n');
        diagnostics.append("webView.getScaleX()=").append(webView.getScaleX()).append('\n');
        diagnostics.append("webView.getScaleY()=").append(webView.getScaleY()).append('\n');
        diagnostics.append("translationX/Y=").append(webView.getTranslationX()).append(" / ").append(webView.getTranslationY()).append('\n');
        diagnostics.append("padding L/R/T/B=").append(webView.getPaddingLeft())
            .append(" / ").append(webView.getPaddingRight())
            .append(" / ").append(webView.getPaddingTop())
            .append(" / ").append(webView.getPaddingBottom()).append('\n');
        diagnostics.append("layout params=").append(layoutParamsToString(webViewLp)).append('\n');

        ViewParent parent = webView.getParent();
        for (int level = 0; level < 2; level++) {
            if (!(parent instanceof View)) {
                diagnostics.append("parent[").append(level).append("]=<none>\n");
                break;
            }
            View parentView = (View) parent;
            diagnostics.append("parent[").append(level).append("] class=").append(parentView.getClass().getSimpleName())
                .append(" width=").append(parentView.getWidth())
                .append(" height=").append(parentView.getHeight())
                .append(" lp=").append(layoutParamsToString(parentView.getLayoutParams()))
                .append('\n');
            parent = parentView.getParent();
        }
        return diagnostics.toString().trim();
    }

    private String layoutParamsToString(ViewGroup.LayoutParams lp) {
        if (lp == null) return "null";
        return "w=" + lp.width + ",h=" + lp.height + ",class=" + lp.getClass().getName();
    }
}
