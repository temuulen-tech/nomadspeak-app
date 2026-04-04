package com.nomadspeak.mobile;

import android.os.Bundle;
import android.os.Build;
import android.util.Log;
import android.util.DisplayMetrics;
import android.view.WindowInsets;
import android.view.WindowMetrics;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.FrameLayout;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "NomadSpeakNativeView";
    private static final String LOG_PREFIX = "[NOMADSPEAK_NATIVE_DIAG] ";
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

        webView.post(() -> {
            logWebViewDiagnostics("postOnCreate", webView);
        });
        webView.addOnLayoutChangeListener((v, left, top, right, bottom, oldLeft, oldTop, oldRight, oldBottom) ->
        {
            logWebViewDiagnostics("onLayoutChange", webView);
        }
        );

        if (ENABLE_HOST_ISOLATION_TEST_PAGE) {
            webView.post(() -> {
                webView.loadUrl(bridge.getLocalUrl() + "/host-isolation-test.html");
                logWebViewDiagnostics("testPageLoad", webView);
            });
        }
    }

    private void logWebViewDiagnostics(String phase, WebView webView) {
        View decorView = getWindow() != null ? getWindow().getDecorView() : null;
        FrameLayout contentRoot = findViewById(android.R.id.content);
        View contentFirstChild = contentRoot != null && contentRoot.getChildCount() > 0
            ? contentRoot.getChildAt(0)
            : null;
        ViewGroup.LayoutParams lp = webView.getLayoutParams();
        Log.d(TAG, LOG_PREFIX + phase + " decorView width/height=" + sizeToString(decorView));
        Log.d(TAG, LOG_PREFIX + phase + " decorView scaleX/scaleY=" + scaleToString(decorView));
        Log.d(TAG, LOG_PREFIX + phase + " decorView translationX/translationY=" + translationToString(decorView));
        Log.d(TAG, LOG_PREFIX + phase + " decorView padding L/R/T/B=" + paddingToString(decorView));
        Log.d(TAG, LOG_PREFIX + phase + " android.R.id.content width/height=" + sizeToString(contentRoot));
        Log.d(TAG, LOG_PREFIX + phase + " android.R.id.content scaleX/scaleY=" + scaleToString(contentRoot));
        Log.d(TAG, LOG_PREFIX + phase + " android.R.id.content translationX/translationY=" + translationToString(contentRoot));
        Log.d(TAG, LOG_PREFIX + phase + " android.R.id.content padding L/R/T/B=" + paddingToString(contentRoot));
        Log.d(TAG, LOG_PREFIX + phase + " android.R.id.content firstChild width/height/layoutParams="
            + sizeToString(contentFirstChild) + " / " + layoutParamsToString(contentFirstChild != null ? contentFirstChild.getLayoutParams() : null));
        Log.d(TAG, LOG_PREFIX + phase + " WebView width/height=" + webView.getWidth() + "x" + webView.getHeight());
        Log.d(TAG, LOG_PREFIX + phase + " WebView scale/scaleX/scaleY=" + webView.getScale() + "/" + webView.getScaleX() + "/" + webView.getScaleY());
        Log.d(TAG, LOG_PREFIX + phase + " WebView translationX/translationY=" + webView.getTranslationX() + "/" + webView.getTranslationY());
        Log.d(TAG, LOG_PREFIX + phase + " WebView layoutParams=" + layoutParamsToString(lp));
        Log.d(TAG, LOG_PREFIX + phase + " WindowMetrics bounds=" + windowMetricsToString());
        Log.d(TAG, LOG_PREFIX + phase + " DisplayMetrics widthPixels/heightPixels/density=" + displayMetricsToString());
        Log.d(TAG, LOG_PREFIX + phase + " isInMultiWindowMode=" + isInMultiWindowMode());
    }

    private String layoutParamsToString(ViewGroup.LayoutParams lp) {
        if (lp == null) return "null";
        return "w=" + lp.width + ",h=" + lp.height + ",class=" + lp.getClass().getName();
    }

    private String sizeToString(View view) {
        if (view == null) return "null";
        return view.getWidth() + "x" + view.getHeight();
    }

    private String scaleToString(View view) {
        if (view == null) return "null";
        return view.getScaleX() + "/" + view.getScaleY();
    }

    private String translationToString(View view) {
        if (view == null) return "null";
        return view.getTranslationX() + "/" + view.getTranslationY();
    }

    private String paddingToString(View view) {
        if (view == null) return "null";
        return view.getPaddingLeft() + "/" + view.getPaddingRight() + "/" + view.getPaddingTop() + "/" + view.getPaddingBottom();
    }

    private String displayMetricsToString() {
        DisplayMetrics dm = getResources().getDisplayMetrics();
        if (dm == null) return "null";
        return dm.widthPixels + "/" + dm.heightPixels + "/" + dm.density;
    }

    private String windowMetricsToString() {
        if (getWindowManager() == null) return "null";
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            WindowMetrics metrics = getWindowManager().getCurrentWindowMetrics();
            if (metrics == null) return "null";
            android.graphics.Rect bounds = metrics.getBounds();
            WindowInsets insets = metrics.getWindowInsets();
            return bounds.width() + "x" + bounds.height() + "@" + bounds.left + "," + bounds.top
                + ",insets=" + (insets == null ? "null" : insets.toString());
        }
        DisplayMetrics legacy = new DisplayMetrics();
        getWindowManager().getDefaultDisplay().getMetrics(legacy);
        return legacy.widthPixels + "x" + legacy.heightPixels + ",density=" + legacy.density;
    }
}
