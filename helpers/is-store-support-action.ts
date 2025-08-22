import { cartStore } from "../stores/cart";
import { shoofiAdminStore } from "../stores/shoofi-admin";
import { storeDataStore } from "../stores/store";

const isStoreSupportAction = async (key: string) => {
  const cartStoreData = await cartStore.getCartStoreDBName();
  const selectedStoreRes = await storeDataStore.getStoreData(cartStoreData);
  const shoofiAdminRes = await shoofiAdminStore.getStoreData();
  switch (key) {
    case "creditcard_support":
      return shoofiAdminRes.creditcard_support;
    case "cash_support":
      return selectedStoreRes.cash_support && shoofiAdminRes.cash_support;
    case "apple_pay_support":
      return shoofiAdminRes.apple_pay_support;
    case "google_pay_support":
      return shoofiAdminRes.google_pay_support;
    case "bit_support":
      return shoofiAdminRes.bit_support;
    case "delivery_support":
      return shoofiAdminRes.delivery_support;
    case "takeaway_support":
      return (
        selectedStoreRes.takeaway_support && shoofiAdminRes.takeaway_support
      );
    default:
      return false;
  }
};
export default isStoreSupportAction;
