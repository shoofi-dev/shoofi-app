#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const manifestFixes = [
  {
    file: 'node_modules/@react-native-camera-roll/camera-roll/android/src/main/AndroidManifest.xml',
    package: 'com.reactnativecommunity.cameraroll'
  },
  {
    file: 'node_modules/react-native-screens/android/src/main/AndroidManifest.xml',
    package: 'com.swmansion.rnscreens'
  },
  {
    file: 'node_modules/expo-json-utils/android/src/main/AndroidManifest.xml',
    package: 'expo.modules.jsonutils'
  }
];

manifestFixes.forEach(({ file, package: packageName }) => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (!content.includes('package=')) {
      // Handle both single-line and multi-line manifest formats
      let fixedContent = content.replace(
        '<manifest xmlns:android="http://schemas.android.com/apk/res/android">',
        `<manifest xmlns:android="http://schemas.android.com/apk/res/android"\n          package="${packageName}">`
      );
      
      // Handle multi-line format with closing bracket on separate line
      fixedContent = fixedContent.replace(
        '<manifest xmlns:android="http://schemas.android.com/apk/res/android"\n          >',
        `<manifest xmlns:android="http://schemas.android.com/apk/res/android"\n          package="${packageName}">`
      );
      
      fs.writeFileSync(file, fixedContent);
      console.log(`Fixed AndroidManifest.xml: ${file}`);
    }
  }
});

console.log('AndroidManifest.xml files fixed!'); 