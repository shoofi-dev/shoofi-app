import { shoofiAdminStore } from "../stores/shoofi-admin";
import { storeDataStore } from "../stores/store";

const isStoreSupportAction = async (key: string) => {
    // const res = await storeDataStore.getStoreData();
    
    const shoofiAdminRes = await shoofiAdminStore.getStoreData();
    return shoofiAdminRes[key];
    //   setDeliveryPrice(res.delivery_price);
  };
  export default isStoreSupportAction;