package com.facebook.react;

import android.app.Application;
import android.content.Context;
import android.content.res.Resources;

import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;

public class PackageList {
  private Application application;
  private Resources resources;

  public PackageList(ReactNativeHost reactNativeHost) {
    this(reactNativeHost.getApplication());
  }

  public PackageList(Application application) {
    this.application = application;
    this.resources = application.getResources();
  }

  public List<ReactPackage> getPackages() {
    return new ArrayList<>(Arrays.<ReactPackage>asList(
      new MainReactPackage()
      // Other packages will be added by autolinking
    ));
  }
} 