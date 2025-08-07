import { axiosInstance } from "../../utils/http-interceptor";
import {  ERROR_HANDLER } from "../../consts/api";

class ErrorHandlerStore {

  sendClientErrorFromServer = (data) => {
    const body = { ...data };
    return axiosInstance
      .post(
        `${ERROR_HANDLER.CONTROLLER}/${ERROR_HANDLER.INSERT_CLIENT_ERROR}`,
        body,
        {
          headers: {
            appName: "shoofi",
          },
        }
      )
      .then(function (response) {
        const res = response;
        return res;
      });
  }


  sendClientError = (data) => {
    return new Promise((resolve) => {
      this.sendClientErrorFromServer(data).then((res) => {
          resolve(true);
      }).catch(logErr => {
        // silent fail, avoid nested logging
      })
    });
  }
}

export const errorHandlerStore = new ErrorHandlerStore();
