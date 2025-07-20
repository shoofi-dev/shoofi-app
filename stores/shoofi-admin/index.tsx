import { makeAutoObservable, runInAction } from "mobx";
import { axiosInstance } from "../../utils/http-interceptor";
import { STORE_API, SHOOFI_ADMIN_API } from "../../consts/api";
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
  selectedCategory = null;
  selectedGeneralCategory = null;
  exploreData = null;
  availableDrivers = null;
  availableDriversLoading = false;
  availableDriversError = null;
  customerLocation = null;

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
      })
  };

  getStoresListData = (location) => {
    return this.getStoresListDataFromServer(location).then((res:any) => {
      runInAction(() => {
        this.storesList = res?.map((item)=> item);
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

  // New method for server-side filtered explore data
  getExploreDataFromServer = async (location = null) => {
    try {
      // Don't call the API if location is not provided
      if (!location) {
        console.log('Location not provided, skipping explore data fetch');
        return null;
      }
      
      const params = { location: JSON.stringify(location) };
      const response = await axiosInstance.get(
        `${SHOOFI_ADMIN_API.CONTROLLER}/explore/categories-with-stores`,
        { params }
      );
      return response;
    } catch (error) {
      console.error('Error fetching explore data:', error);
      throw error;
    }
  };

  getExploreData = (location = null) => {
    return this.getExploreDataFromServer(location).then((res: any) => {
      runInAction(() => {
        this.exploreData = res;
      });
      return res;
    }).catch((error) => {
      console.error('Error in getExploreData:', error);
      runInAction(() => {
        this.exploreData = null;
      });
      return null;
    });
  };

  // Method to clear explore cache (useful when store status changes)
  clearExploreCache = async () => {
    try {
      await axiosInstance.post(`${SHOOFI_ADMIN_API.CONTROLLER}/explore/clear-cache`);
      runInAction(() => {
        this.exploreData = null;
      });
    } catch (error) {
      console.error('Error clearing explore cache:', error);
    }
  };

  // Method to get explore cache stats
  getExploreCacheStats = async () => {
    try {
      const response = await axiosInstance.get(`${SHOOFI_ADMIN_API.CONTROLLER}/explore/cache-stats`);
      return response;
    } catch (error) {
      console.error('Error getting explore cache stats:', error);
      throw error;
    }
  };

  setStoreDBName = async (storeDBName) => {
    await AsyncStorage.setItem("@storage_storeDB", storeDBName);
  };
  
  getStoreDBName = async () => {
    const storeDBName = await AsyncStorage.getItem("@storage_storeDB")
    return storeDBName;
  };

  getStoreById = (storeId) => {
    const store = this.storesList?.find((store)=> store.appName === storeId);
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
      })
  };

  getStoreData = () => {
    return this.getStoreDataFromServer().then((res:any) => {
      runInAction(() => {
        this.storeData = res[0];
      })
      return res[0];
    }).catch((error) => {
    })
  };

  getStoreZCrDataFromServer = async () => {
    return axiosInstance
      .get(
        `${SHOOFI_ADMIN_API.CONTROLLER}/${SHOOFI_ADMIN_API.GET_STORE_Z_CR_API}`,
      
      )
      .then(function (response) {
        const res = response;
        return res;
      }).catch((error) => {
      })
  };

  getStoreZCrData = () => {
    return this.getStoreZCrDataFromServer().then((res:any) => {
      runInAction(() => {
        this.paymentCredentials = res;
      })
      return res;
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

  setSelectedCategory(category) {
      this.selectedCategory = category;
  }
  
  setSelectedGeneralCategory(generalCategory) {
    this.selectedGeneralCategory = generalCategory;
  }

  getAvailableDrivers = async (
    location: { lat: number; lng: number },
    storeLocation?: { lat: number; lng: number }
  ) => {
    try {
      const body: any = { location };
      if (storeLocation) {
        body.storeLocation = storeLocation;
      }
      const response = await axiosInstance.post('/delivery/available-drivers', body);
      return response;
    } catch (error) {
      console.error('Error fetching available drivers:', error);
      throw error;
    }
  };

  fetchAvailableDrivers = async (
    customerLocation: { lat: number; lng: number },
    storeLocation?: { lat: number; lng: number }
  ) => {
    runInAction(() => {
      this.availableDriversLoading = true;
      this.availableDriversError = null;
      this.customerLocation = customerLocation;
    });

    try {
      const response = await this.getAvailableDrivers(customerLocation, storeLocation);
      runInAction(() => {
        this.availableDrivers = response;
        this.availableDriversLoading = false;
      });
      return response;
    } catch (error) {
      runInAction(() => {
        this.availableDriversError = error;
        this.availableDriversLoading = false;
      });
      throw error;
    }
  };

  clearAvailableDrivers = () => {
    runInAction(() => {
      this.availableDrivers = null;
      this.availableDriversLoading = false;
      this.availableDriversError = null;
      this.customerLocation = null;
    });
  };
}

export const shoofiAdminStore = new ShoofiAdminStore();
