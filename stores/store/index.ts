import { makeAutoObservable, runInAction } from "mobx";
import { axiosInstance } from "../../utils/http-interceptor";
import { STORE_API } from "../../consts/api";
import { fromBase64, toBase64 } from "../../helpers/convert-base64";
import moment from "moment";

class StoreDataStore {
  paymentCredentials = null;
  storeData = null;
  repeatNotificationInterval = null;

  constructor() {
    makeAutoObservable(this);

  }

  getStoreDataFromServer = async () => {
    const body = { date: moment().format()}
    return axiosInstance
      .post(
        `${STORE_API.GET_STORE_API}`,
        body
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
        this.storeData = res[0];
        this.paymentCredentials = res[0].credentials;
      })
      return res[0];
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
        console.log(error);
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
