import { makeAutoObservable, runInAction } from "mobx";
import { axiosInstance } from "../../utils/http-interceptor";
import { CALANDER_API } from "../../consts/api";

class CalanderStore {
  calanderData = null;

  constructor() {
    makeAutoObservable(this);
  }

  getDisabledHoursByDateFromServer = async (date: string) => {
    return axiosInstance
      .get(
        `${CALANDER_API.GET_DISABLED_HOURS_BY_DATE_API}/${date}`,
      )
      .then(function (response) {
        return response;
      })
      .catch((error) => {
      });
  };

  getDisabledHoursByDate = (date) => {
    return this.getDisabledHoursByDateFromServer(date);
  };

  insertDisableHourServer = async (data:any) => {
    return axiosInstance
      .post(
        `${CALANDER_API.INSERT_DISABLE_HOUR}`,
        data
      )
      .then(function (response) {
        return response;
      })
      .catch((error) => {
      });
  };
  
  insertDisableHour = (data: any) => {
    return this.insertDisableHourServer(data).then((res) => {
      runInAction(() => {
        this.calanderData = res;
      });
    });
  };


  insertDisableHourMultiServer = async (data:any) => {
    return axiosInstance
      .post(
        `${CALANDER_API.INSERT_DISABLE_HOUR_MULTI}`,
        data
      )
      .then(function (response) {
        return response;
      })
      .catch((error) => {
      });
  };
  
  
  insertDisableHourMulti = (data: any) => {
    return this.insertDisableHourMultiServer(data).then((res) => {
      runInAction(() => {
        this.calanderData = res;
      });
    });
  };

  enableDisabledHourServer = async (data:any) => {
    return axiosInstance
      .post(
        `${CALANDER_API.ENABLE_DISABLED_HOUR_API}`,
        data
      )
      .then(function (response) {
        return response;
      })
      .catch((error) => {
      });
  };
  
  enableDisabledHour = (data: any) => {
    return this.enableDisabledHourServer(data);
  };

  enableDisabledHourMultiServer = async (data:any) => {
    return axiosInstance
      .post(
        `${CALANDER_API.ENABLE_DISABLED_HOUR_MULTI_API}`,
        {data}
      )
      .then(function (response) {
        return response;
      })
      .catch((error) => {
      });
  };
  
  enableDisabledMultiHour = (data: any) => {
    return this.enableDisabledHourMultiServer(data);
  };
}

export const calanderStore = new CalanderStore();
