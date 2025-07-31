import { makeAutoObservable, runInAction } from "mobx";
import { axiosInstance } from "../../utils/http-interceptor";
import { STORE_API } from "../../consts/api";
import moment from "moment";
import { APP_NAME, APP_TYPE } from "../../consts/shared";
import { Platform } from "react-native";

class StoreDataStore {
  paymentCredentials = null;
  storeData = null;
  repeatNotificationInterval = null;

  constructor() {
    makeAutoObservable(this);

  }

  getStoreDataFromServer = async (storeDBName?: string) => {
    const body = { date: moment().format()}
   
    return axiosInstance
      .post(
        `${STORE_API.GET_STORE_API}`,
        body,
        {
          headers: {
            "app-name": storeDBName
          }
        }
      )
      .then(function (response) {
        const res = response.data;
        return res;
      }).catch((error) => {
      })
  };

  getStoreData = (storeDBName?: string) => {
    return this.getStoreDataFromServer(storeDBName).then((res:any) => {
      runInAction(() => {
        this.storeData = res[0];
      })
      return res[0];
    })
  };
  
  isUpdateAppVersionFromServer = async () => {
    return axiosInstance
      .get(`${STORE_API.IS_UPDATE_VERSION_STORE_API}`, {
        headers: {
          "app-type": APP_TYPE,
          "app-name": APP_NAME,
          "device_os": Platform.OS === "android" ? "Android" : "iOS",
        }
      })
      .then(function (response) {
        const res = response;
        return res;
      }).catch((error) => {
      })
  };

  isUpdateAppVersion = () => {
    return this.isUpdateAppVersionFromServer().then((res:any) => {
      return res
    })
  };

  updateStoreDataFromServer = async (storeData) => {
    const body = storeData;
    return axiosInstance
      .post(
        `${STORE_API.UPDATE_STORE_API}`,
        body
      )
      .then(function (response) {
        const res = response.data;
        return res;
      }).catch((error) => {
      })
  };

  updateStoreData = (storeData) => {
    return this.updateStoreDataFromServer(storeData).then((res:any) => {
      return true
    })
  };
 
  setRepeatNotificationInterval = (intervalId) => {
    this.repeatNotificationInterval = intervalId;
  };
}

export const storeDataStore = new StoreDataStore();
