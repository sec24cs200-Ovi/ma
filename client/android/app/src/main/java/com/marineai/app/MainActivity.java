package com.marineai.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                webView.addJavascriptInterface(new WebCallBridge(), "AndroidBridge");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private class WebCallBridge {
        @JavascriptInterface
        public void makeCall(final String phoneNumber) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        Intent dialIntent = new Intent(Intent.ACTION_DIAL);
                        dialIntent.setData(Uri.parse("tel:" + phoneNumber));
                        dialIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(dialIntent);
                    } catch (Exception e) {
                        try {
                            Intent callIntent = new Intent(Intent.ACTION_CALL);
                            callIntent.setData(Uri.parse("tel:" + phoneNumber));
                            callIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            startActivity(callIntent);
                        } catch (Exception ex) {
                            ex.printStackTrace();
                        }
                    }
                }
            });
        }
    }
}
