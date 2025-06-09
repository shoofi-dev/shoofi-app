import { makeAutoObservable, runInAction } from "mobx";
import { axiosInstance } from "../../utils/http-interceptor";
import { CUSTOMER_API } from "../../consts/api";

class AddressStore {
  addresses: any[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchAddresses(customerId: string) {
    this.loading = true;
    this.error = null;
    try {
      const response: any = await axiosInstance.get(`${CUSTOMER_API.CONTROLLER}/${customerId}/${CUSTOMER_API.GET_ADDRESSES}`);
      runInAction(() => {
        console.log("responsexx", response);
        this.addresses = response;
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = "Failed to fetch addresses";
        this.loading = false;
      });
      throw error;
    }
  }

  async addAddress(customerId: string, addressData: any) {
    this.loading = true;
    this.error = null;
    try {
      const response = await axiosInstance.post(
        `${CUSTOMER_API.CONTROLLER}/${customerId}/${CUSTOMER_API.ADD_ADDRESS}`,
        addressData
      );
      await this.fetchAddresses(customerId);
      return response.data;
    } catch (error) {
      runInAction(() => {
        this.error = "Failed to add address";
        this.loading = false;
      });
      throw error;
    }
  }

  async updateAddress(customerId: string, addressId: string, addressData: any) {
    this.loading = true;
    this.error = null;
    try {
      const response = await axiosInstance.put(
        `${CUSTOMER_API.CONTROLLER}/${customerId}/${CUSTOMER_API.UPDATE_ADDRESS}/${addressId}`,
        addressData
      );
      await this.fetchAddresses(customerId);
      return response.data;
    } catch (error) {
      runInAction(() => {
        this.error = "Failed to update address";
        this.loading = false;
      });
      throw error;
    }
  }

  async deleteAddress(customerId: string, addressId: string) {
    this.loading = true;
    this.error = null;
    try {
      const response = await axiosInstance.delete(
        `${CUSTOMER_API.CONTROLLER}/${customerId}/${CUSTOMER_API.DELETE_ADDRESS}/${addressId}`
      );
      await this.fetchAddresses(customerId);
      return response.data;
    } catch (error) {
      runInAction(() => {
        this.error = "Failed to delete address";
        this.loading = false;
      });
      throw error;
    }
  }

  async setDefaultAddress(customerId: string, addressId: string) {
    this.loading = true;
    this.error = null;
    try {
      const response = await axiosInstance.patch(
        `${CUSTOMER_API.CONTROLLER}/${customerId}/${CUSTOMER_API.SET_DEFAULT_ADDRESS}/${addressId}/default`
      );
      await this.fetchAddresses(customerId);
      return response.data;
    } catch (error) {
      runInAction(() => {
        this.error = "Failed to set default address";
        this.loading = false;
      });
      throw error;
    }
  }

  get defaultAddress() {
    console.log("this.addresses",this.addresses)
    if(this.addresses?.length === 1){
      return this.addresses[0];
    }
    return this.addresses?.find(addr => addr.isDefault);;
  }
}

export const addressStore = new AddressStore(); 