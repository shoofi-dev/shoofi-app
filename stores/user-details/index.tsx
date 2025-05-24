import { makeAutoObservable, runInAction } from "mobx";
import { axiosInstance } from "../../utils/http-interceptor";
import { AUTH_API, CUSTOMER_API } from "../../consts/api";
import { fromBase64, toBase64 } from "../../helpers/convert-base64";
import { menuStore } from "../menu";
import { APP_NAME, ROLES } from "../../consts/shared";

type TUserDetails = {
  name: string;
  phone: string;
  isAdmin: boolean;
  customerId?: string;
  roles?: string[],
  appName?: string
};

class UserDetailsStore {
  userDetails: TUserDetails = null;
  isAcceptedTerms: boolean = false;
  constructor() {
    makeAutoObservable(this);
  }

  setIsAcceptedTerms = (flag: boolean) =>{
    this.isAcceptedTerms = flag;
  }

  getUserDetailsFromServer = () => {
    return axiosInstance
      .get(
        `${CUSTOMER_API.CONTROLLER}/${CUSTOMER_API.GET_USER_DETAILS}`,
        {
          headers: { "Content-Type": "application/json", "app-name": APP_NAME }
        }
      )
      .then(function (response) {
        //const res = JSON.parse(fromBase64(response.data));
        return response.data;
      });
  };

  getUserDetails = () => {
    return this.getUserDetailsFromServer().then((res: any)=>{
      console.log("resUserDetails", res)
      const userDetailsTmp: TUserDetails = {
        name: res.fullName,
        phone: res.phone,
        isAdmin: res.isAdmin,
        roles: res.roles,
        customerId: res.customerId || res.id,
        appName: res?.appName
      }
      runInAction(() => {
        this.userDetails = userDetailsTmp;
        //menuStore.updateBcoinPrice();
      });
      return userDetailsTmp;
    })
  };

  isAdmin = (role?) => {
    let isHavePermission = true;
    if(this.userDetails?.isAdmin && role){
      isHavePermission = this.userDetails?.roles.indexOf(role) > -1;
    }
    return this.userDetails?.isAdmin && isHavePermission;
  }

  resetUser = () => {
    this.userDetails = null;
  }

}

export const userDetailsStore = new UserDetailsStore();
