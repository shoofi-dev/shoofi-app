import axios from "axios";
import { BASE_URL } from "../../consts/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeviceEventEmitter } from "react-native";
import Constants from "expo-constants";
import { APP_NAME } from "../../consts/shared";
import { DIALOG_EVENTS } from "../../consts/events";
import { errorHandlerStore } from "../../stores/error-handler";
import moment from "moment";

const general_errors_codes = ["-400", "-6", "-7", "-10", "-11", "-401"];
const TOKEN_NOT_VALID = -12;
export const axiosInstance = axios.create({
  baseURL: BASE_URL + "/",
});

axiosInstance.interceptors.request.use(
  async function (config) {
    const token = await AsyncStorage.getItem("@storage_userToken");
    if (token) {
      config.headers["Authorization"] = "Token " + token;
    }
    if (config.headers["Content-Type"] !== "multipart/form-data") {
      config.headers["Content-Type"] = "application/json";
    }

    const version = Constants.nativeAppVersion;
    config.headers["app-version"] = version;
    
    // config.headers["app-name"] = APP_NAME;
    const storeDB = await AsyncStorage.getItem("@storage_storeDB");
    config.headers["app-name"] = config.headers["app-name"] || storeDB || APP_NAME;
    config.headers["app-type"] = "shoofi-shopping";

    return config;
  },
  function (error) {
    errorHandlerStore.sendClientError({
      error: JSON.stringify(error),
      createdDate: moment().format(),
      type: "axios-request-error"
    });
    if (error?.message?.includes("Network Error")) {
      DeviceEventEmitter.emit(DIALOG_EVENTS.OPEN_INTERNET_CONNECTION_DIALOG, {
        show: true,
        isSignOut: false,
      });
    }
    if (error?.message?.includes("timeout")) {
      DeviceEventEmitter.emit(`OPEN_GENERAL_SERVER_ERROR_DIALOG`, {
        show: true,
        isSignOut: false,
      });
    }
    // Do something with request error
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  function (response: any) {
    if (
      response.has_err &&
      general_errors_codes.indexOf(response.error_code) > -1
    ) {
      //DeviceEventEmitter.emit(`OPEN_GENERAL_SERVER_ERROR_DIALOG`, { show: true, isSignOut: true });
    }
    // const jsonValue:any = JSON.parse(fromBase64(response.data));
    // if(response.has_err && general_errors_codes.indexOf(response.error_code) > -1){
    //     DeviceEventEmitter.emit(`OPEN_GENERAL_SERVER_ERROR_DIALOG`, { show: true, isSignOut: true });
    // }
    // if(jsonValue.has_err && jsonValue.code === TOKEN_NOT_VALID){
    //     DeviceEventEmitter.emit(`OPEN_GENERAL_SERVER_ERROR_DIALOG`, { show: true, isSignOut: true });
    // }
    return response.data;
  },
  function (error) {
    errorHandlerStore.sendClientError({
      error: JSON.stringify(error),
      createdDate: moment().format(),
      type: "axios-response-error"
    });
    if (error?.message?.includes("Network Error")) {
      DeviceEventEmitter.emit(DIALOG_EVENTS.OPEN_INTERNET_CONNECTION_DIALOG, {
        show: true,
        isSignOut: false,
      });
    }
    if (
      error?.message?.includes("timeout")
    ) {
      DeviceEventEmitter.emit(`OPEN_GENERAL_SERVER_ERROR_DIALOG`, {
        show: true,
        isSignOut: false,
      });
    }
    if (error?.message?.includes("401")) {
      DeviceEventEmitter.emit(`OPEN_GENERAL_SERVER_ERROR_DIALOG`, {
        show: true,
        isSignOut: true,
      });
    }
    // if (error?.message?.includes("402")) {
    //   DeviceEventEmitter.emit(`OPEN_GENERAL_SERVER_ERROR_DIALOG`, {
    //     show: true,
    //     isSignOut: true,
    //   });
    // }

    return Promise.reject(error);
  }
);
