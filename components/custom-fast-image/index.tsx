import React, { useEffect, useRef, useState } from "react";
import { Alert, Image, View, ActivityIndicator } from "react-native";
import * as FileSystem from "expo-file-system";
export function getImgXtension(uri) {
  var basename = uri.split(/[\\/]/).pop();
  return /[.]/.exec(basename) ? /[^.]+$/.exec(basename) : undefined;
}
export async function findImageInCache(uri) {
  try {
    let info = await FileSystem.getInfoAsync(uri);
    return { ...info, err: false };
  } catch (error) {
    return {
      exists: false,
      err: true,
      msg: error,
    };
  }
}
export async function cacheImage(uri, cacheUri, callback) {
  try {
    const downloadImage = FileSystem.createDownloadResumable(
      uri,
      cacheUri,
      {},
      callback
    );

    const downloaded = await downloadImage.downloadAsync();

    return {
      cached: true,
      err: false,
      path: downloaded.uri,
    };
  } catch (error) {

    return {
      cached: false,
      err: true,
      msg: error,
    };
  }
}
const CustomFastImage = (props) => {
  const {
    source: { uri },
    cacheKey,
    style,
    resizeMode
  } = props;
  const isMounted = useRef(true);
  const [imgUri, setUri] = useState("");
  useEffect(() => {
    async function loadImg() {
      let imgXt = getImgXtension(uri);

      if (!imgXt || !imgXt.length) {
        return;
      }
      const cacheFileUri = `${FileSystem.cacheDirectory}${cacheKey}`;

      let imgXistsInCache = await findImageInCache(cacheFileUri);
      if (imgXistsInCache.exists) {
        setUri(cacheFileUri);
      } else {
        let cached = await cacheImage(uri, cacheFileUri, () => {});

        if (cached.cached) {
          setUri(cached.path);
        } else {
          setUri(uri);
        }
      }
    }
    loadImg();
    return () => (isMounted.current = false);
  }, [uri]);
  return (
    <>
      {imgUri ? (
        <Image source={{ uri: imgUri }} style={style} resizeMode={resizeMode}/>
      ) : (
        <View
          style={{ ...style, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size={33} />
        </View>
      )}
    </>
  );
};
export default CustomFastImage;