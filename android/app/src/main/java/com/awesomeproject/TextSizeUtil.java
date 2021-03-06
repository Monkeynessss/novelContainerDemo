package com.awesomeproject;

import android.graphics.Paint;
import android.graphics.Rect;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class TextSizeUtil extends ReactContextBaseJavaModule {

	@NonNull
	@Override
	public String getName() {
		return "TextSizeUtil";
	}

	private static ReactApplicationContext reactContext;

	private final Paint paint;
	private final Rect rect;

	public TextSizeUtil(ReactApplicationContext context) {
		super(context);
		reactContext = context;
		paint = new Paint();
		rect = new Rect();
	}

	@ReactMethod
	public void getTextWidth(String str, Float textSize, Integer start, Integer end, Promise promise) {
		paint.setTextSize(textSize);
		paint.getTextBounds(str, start, end, rect);
		promise.resolve(rect.width());
	}

}
