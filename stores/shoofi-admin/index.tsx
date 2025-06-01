import { makeAutoObservable, runInAction } from "mobx";
import { axiosInstance } from "../../utils/http-interceptor";
import { STORE_API, SHOOFI_ADMIN_API } from "../../consts/api";
import { fromBase64, toBase64 } from "../../helpers/convert-base64";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_NAME } from "../../consts/shared";

export type TStore = {
    storeName: string;
    storeLogo: string;
    storeDB: string;
}

class ShoofiAdminStore {
  storesList = null;
  categoryList = null;
  paymentCredentials = null;
  storeData = null;
  repeatNotificationInterval = null;

  constructor() {
    makeAutoObservable(this);

  }

  getStoresListDataFromServer = async (location) => {
    const body = { date: moment().format(), location}
    return axiosInstance
      .post(
        `${SHOOFI_ADMIN_API.CONTROLLER}/${SHOOFI_ADMIN_API.GET_AVAILABLE_STORES_API}`,
        body,
        {
          headers: {
            "app-name": APP_NAME
          }
        }
      )
      .then(function (response) {

        const res = response;
        return res;
      }).catch((error) => {
        console.log(error);
      })
  };

  getStoresListData = (location) => {
    return this.getStoresListDataFromServer(location).then((res:any) => {
      runInAction(() => {
        this.storesList = res?.map((item)=> item.store);
      })
      return res;
    })
  };


  getCategoryListDataFromServer = async () => {
    const body = { date: moment().format()}
    return axiosInstance
      .post(
        `${SHOOFI_ADMIN_API.CONTROLLER}/${SHOOFI_ADMIN_API.GET_CATEGORY_LIST_API}`,
        body,
        {
          headers: {
            "app-name": APP_NAME
          }
        }
      )
      .then(function (response) {
        const res = response;
        return res;
      }).catch((error) => {
        console.log(error);
      })
  };

  getCategoryListData = () => {
    return this.getCategoryListDataFromServer().then((res:any) => {
      runInAction(() => {
        this.categoryList = res;
      })
      return res;
    })
  };


 
  setStoreDBName = async (storeDBName) => {
    await AsyncStorage.setItem("@storage_storeDB", storeDBName);
  };
  getStoreDBName = async () => {
    await AsyncStorage.getItem("@storage_storeDB")
  };

  getStoreById = (storeId) => {
    console.log("storesList",this.storesList)
    console.log("storeId",storeId)
    const store = this.storesList?.find((store)=> store.appName === storeId);
    console.log("store",store)

    return store;
  }

  getStoreDataFromServer = async () => {
    const body = { date: moment().format()}
    return axiosInstance
      .post(
        `${STORE_API.GET_STORE_API}`,
        body,
        {
          headers: {
            "app-name": APP_NAME
          }
        }
      )
      .then(function (response) {
        const res = response.data;
        return res;
      }).catch((error) => {
        console.log(error);
      })
  };

  getStoreData = () => {
    return this.getStoreDataFromServer().then((res:any) => {
      runInAction(() => {
        console.log("resSSStore", res)
        this.storeData = res[0];
        this.paymentCredentials = res[0].credentials;
      })
      return res[0];
    })
  };

  getstoresCategories = async () => {
    const body = { date: moment().format()}
    return axiosInstance
      .post(
        `${SHOOFI_ADMIN_API.CONTROLLER}/${SHOOFI_ADMIN_API.GET_CATEGORY_LIST_API}`,
        body,
        {
          headers: {
            "app-name": APP_NAME
          }
        }
      )
  }
}

export const shoofiAdminStore = new ShoofiAdminStore();
