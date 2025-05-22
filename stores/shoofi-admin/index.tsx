import { makeAutoObservable, runInAction } from "mobx";
import { axiosInstance } from "../../utils/http-interceptor";
import { STORE_API, SHOOFI_ADMIN_API } from "../../consts/api";
import { fromBase64, toBase64 } from "../../helpers/convert-base64";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  getStoresListDataFromServer = async () => {
    const body = { date: moment().format()}
    return axiosInstance
      .post(
        `${SHOOFI_ADMIN_API.CONTROLLER}/${SHOOFI_ADMIN_API.GET_STORES_LIST_API}`,
        body,
        {
          headers: {
            "db-name": "shoofi"
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

  getStoresListData = () => {
    return this.getStoresListDataFromServer().then((res:any) => {
      runInAction(() => {

        this.storesList = res;
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
            "db-name": "shoofi"
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

  getStoreById = (storeId) => {
    const store = this.storesList?.find((store)=> store._id === storeId);
    console.log("storesList",store)
    return store;
  }
}

export const shoofiAdminStore = new ShoofiAdminStore();
