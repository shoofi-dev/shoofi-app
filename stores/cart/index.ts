import AsyncStorage from "@react-native-async-storage/async-storage";
import { makeAutoObservable } from "mobx";
import { toBase64, fromBase64 } from "../../helpers/convert-base64";
import { ORDER_API, GEO_API } from "../../consts/api";
import Constants from "expo-constants";
import * as Device from "expo-device";
import i18n from "../../translations/index-x";
import { axiosInstance } from "../../utils/http-interceptor";
import { getCurrentLang } from "../../translations/i18n";
import { Platform } from "react-native";
import { bcoindId } from "../../consts/shared";
import moment from "moment";
var hash = require("object-hash");

export type TOrderSubmitResponse = {
  response: {
    has_err: boolean;
    code: number;
    orderId: number;
    status: string;
    salt: string;
  },
  cartData: any;

};

export type TUpdateCCPaymentRequest = {
  orderId: number;
  creditcard_ReferenceNumber: string;
  datetime: string;
  ZCreditInvoiceReceiptResponse: any;
  ZCreditChargeResponse: any;
};
type TOrderHistory = {
  phoneNumber: string;
  ordersList: TCart[];
};
type TGradiants = {
  id: number;
  name: string;
  value: any;
};
type TProduct = {
  item_id: number;
  qty: number;
  price: number;
  notes: string;
  data: TGradiants[];
};
type TOrder = {
  payment_method: "CREDITCARD" | "CASH";
  receipt_method: "DELIVERY" | "TAKEAWAY";
  creditcard_ReferenceNumber?: string;
  geo_positioning?: string;
  items: TProduct[];
};

type TCart = {
  order: TOrder;
  total: number;
  app_language: "0" | "1";
  device_os: string;
  app_version: string;
  unique_hash?: string;
  datetime: any;
  orderDate: any;
  customerId?: string;
  orderType: string;
  orderId?: string;
  db_orderId?: string;
  isAdmin?: boolean;
};

const prodcutExtrasAdapter = (extras) => {
  let productExtras = [];
  if (!extras) {
    return productExtras;
  }
  Object.keys(extras).map((key) => {
    if (key !== "orderList") {
      return extras[key].map((extra) => {
        if (extra.available_on_app) {
          if (extra.type === "CHOICE" && !extra.multiple_choice) {
            if (extra.value !== false) {
              productExtras.push({
                id: extra.id,
                name: extra.name,
                value: extra.value,
              });
            }
          }
          if (extra.type === "COUNTER") {
            if (extra.counter_init_value !== extra.value) {
              productExtras.push({
                id: extra.id,
                name: extra.name,
                value: extra.value,
              });
            }
          }
          if (extra.type === "CHOICE" && extra.multiple_choice) {
            if (extra.isdefault !== extra.value) {
              productExtras.push({
                id: extra.id,
                name: extra.name,
                value: extra.value,
              });
            }
          }
        }
      });
    }
  });
  return productExtras;
};
const getPriceBySize = (product) => {
  return null;
  return product.data.extras.size.options[product.data.extras.size.value].price;

  const size = product.data.extras.size.options?.filter(
    (size) => size.title === product.data.extras.size.value
  )[0];
  return size?.price;
};
const produtsAdapter = (order) => {
  let finalProducts = [];
  order.products.map((product) => {

    const finalProduct = {
      item_id: product.data._id,
      name: product.data.nameHE,
      nameAR: product.data.nameAR,
      nameHE: product.data.nameHE,
      qty: product.data.extras.counter.value,
      note: product.others.note,
      toName: product.others.toName,
      toAge: product.others.toAge,
      size: product.data.extras.size.value,
      clienImage: product.data.extras.image?.value,
      suggestedImage: product.data.extras.suggestedImage?.value,
      taste: product.data.extras.taste?.value,
      halfOne: product.data.extras.halfOne?.value,
      halfTwo: product.data.extras.halfTwo?.value,
      onTop: product.data.extras.onTop?.value,
      price: getPriceBySize(product) || product.data.price,
      data: prodcutExtrasAdapter(product.extras),
    };
    finalProducts.push(finalProduct);
  });
  return finalProducts;
};

class CartStore {
  cartItems = [];

  isEnabled = false;

  constructor() {
    makeAutoObservable(this);
    this.getDefaultValue();
  }
  getDefaultValue = async () => {
    const jsonValue = await AsyncStorage.getItem("@storage_cartItems");
    const value = jsonValue != null ? JSON.parse(jsonValue) : [];
    this.setDefaultValue(value);
  };

  setDefaultValue = (value) => {
    this.cartItems = value;
  };

  updateLocalStorage = async () => {
    try {
      const jsonValue = JSON.stringify(this.cartItems);
      await AsyncStorage.setItem("@storage_cartItems", jsonValue);
    } catch (e) {
      // saving error
    }
  };

  addProductToCart = async (product, isBcoin = false) => {
    if (this.cartItems.length === 0) {
      const storage_cartCreatedDate = {
        date: new Date(),
      };
      await AsyncStorage.setItem(
        "@storage_cartCreatedDate",
        JSON.stringify(storage_cartCreatedDate)
      );
    }
    if (isBcoin) {
      this.cartItems.unshift(product);
    } else {
      this.cartItems = [...this.cartItems, product];
    }
    this.updateLocalStorage();
  };

  addProductListToCart = async (products, isBcoin = false) => {
    if (this.cartItems.length === 0) {
      const storage_cartCreatedDate = {
        date: new Date(),
      };
      await AsyncStorage.setItem(
        "@storage_cartCreatedDate",
        JSON.stringify(storage_cartCreatedDate)
      );
    }
    this.cartItems = [...products];
    this.updateLocalStorage();
  };

  removeProduct = (productId) => {
    this.cartItems = this.cartItems.filter(
      (item, index) => item.data._id.toString() + index !== productId
    );
    this.updateLocalStorage();
  };

  updateCartProduct = (index, product) => {
    this.cartItems[index] = { ...product };
    this.cartItems = [...this.cartItems]
  };

  getProductByIndex = (index) => {
    return JSON.parse(JSON.stringify(this.cartItems[index]));
  };

  updateProductCount = (productId, count) => {
    this.cartItems = this.cartItems.map((item, index) => {
      if (item.data._id.toString() + index === productId) {
        // item.data.price = item.data.price + ((count - item.data.extras.counter.value) * (item.data.price / item.data.extras.counter.value));
        item.data.extras.counter.value = count;
      }
      return item;
    });
    this.updateLocalStorage();
  };

  getProductsCount = () => {
    let count = 0;
    this.cartItems.forEach((product) => {
      if (product) {
        count += Number(product?.others?.count);
      }
    });
    return count;
  };

  generateUniqueHash = (value: any) => {
    var hash = 0,
      i,
      chr;
    if (value.length === 0) return hash;
    for (i = 0; i < value.length; i++) {
      chr = value.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };

  getHashKey = async (finalOrder: any) => {
    const cartCreatedDate = await AsyncStorage.getItem(
      "@storage_cartCreatedDate"
    );
    const cartCreatedDateValue = JSON.parse(cartCreatedDate);
    const hashObject = {
      finalOrder,
      cartCreatedDateValue: cartCreatedDateValue.date,
    };
    return hash(hashObject);
  };

  getCartData = async (order: any) => {
    let finalOrder: TOrder = {
      payment_method: order.paymentMthod,
      receipt_method: order.shippingMethod,
      geo_positioning: order.geo_positioning,
      items: produtsAdapter(order),
    };
    const version = Constants.nativeAppVersion;
    const hashKey = await this.getHashKey(finalOrder);

    const cartData: TCart = {
      order: finalOrder,
      total: order.totalPrice,
      app_language: order?.app_language ?? getCurrentLang() === "ar" ? "0" : "1",
      device_os: Platform.OS === "android" ? "Android" : "iOS",
      app_version: version,
      unique_hash: hashKey,
      datetime: moment().format(),
      orderDate: order.orderDate || moment().format(),
      customerId: order.customerId,
      orderType: order.orderType,
    };

    return cartData;
  };

  resetCart = () => {
    this.cartItems = [];
    this.updateLocalStorage();
  };

  getProductsImages = (cartData) => {
    const imagesListTemp = cartData.order.items.map((item) => item.clienImage);
    const imagesList = imagesListTemp.filter((item) => item);
    return imagesList;
  };

  submitOrder = async (order: any): Promise<TOrderSubmitResponse | string> => {
    const cartData = await this.getCartData(order);
    await AsyncStorage.setItem(
      "@storage_orderHashKey",
      JSON.stringify(cartData.unique_hash)
    );
    const orderBase64 = toBase64(cartData).toString();
    const imagesList = this.getProductsImages(cartData);
    let formData = new FormData();
    cartData.isAdmin = order?.isAdmin;
    const body = cartData;
    formData.append("body", JSON.stringify(body));
    // formData.append("images", JSON.stringify(imagesList));
    if (imagesList.length > 0) {
      imagesList.forEach((image) => {
        const imageObj = {
          uri: image.path || image.uri,
          type: image.type,
          name: image.fileName,
        };
        formData.append("img", imageObj);
      });
    }
    return axiosInstance
      .post(`${ORDER_API.CONTROLLER}/${ORDER_API.SUBMIT_ORDER_API}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(function (response: any) {
        // const jsonValue: any = JSON.parse(fromBase64(response.data));

        // const data: TOrderSubmitResponse = {
        //   has_err: jsonValue.has_err,
        //   orderId: jsonValue.orderId,
        //   salt: jsonValue.salt,
        //   status: jsonValue.status,
        //   code: jsonValue.code,
        // }
        return {response, cartData: body};
      })
      .catch(function (error) {
        const data: TOrderSubmitResponse = {
          has_err: true,
          orderId: 0,
          salt: "",
          status: "",
          code: 0,
        };
        return data;
      });
  };

  updateOrderAdmin = async (
    order: any
  ): Promise<TOrderSubmitResponse | string> => {
    let cartData = await this.getCartData(order);
    await AsyncStorage.setItem(
      "@storage_orderHashKey",
      JSON.stringify(cartData.unique_hash)
    );
    const orderBase64 = toBase64(cartData).toString();
    const imagesList = this.getProductsImages(cartData);
    let formData = new FormData();
    cartData.orderId = order.orderId;
    cartData.db_orderId = order.db_orderId;
    const body = cartData;
    formData.append("body", JSON.stringify(body));
    // formData.append("images", JSON.stringify(imagesList));
    if (imagesList.length > 0) {
      imagesList.forEach((image) => {
        console.log("image", image);
        if (
          (image?.path && !image?.path?.includes("orders")) ||
          (image?.uri && !image?.uri?.includes("orders"))
        ) {
          const imageObj = {
            uri: image.path || image.uri,
            type: image.type,
            name: image.fileName,
          };
          formData.append("img", imageObj);
        }
      });
    }
    console.log("order", cartData.order.items);

    return axiosInstance
      .post(
        `${ORDER_API.CONTROLLER}/${ORDER_API.UPDATE_ALL_ADMIN_ORDERS_API}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      )
      .then(function (response: any) {
        // const jsonValue: any = JSON.parse(fromBase64(response.data));

        // const data: TOrderSubmitResponse = {
        //   has_err: jsonValue.has_err,
        //   orderId: jsonValue.orderId,
        //   salt: jsonValue.salt,
        //   status: jsonValue.status,
        //   code: jsonValue.code,
        // }
        return response;
      })
      .catch(function (error) {
        const data: TOrderSubmitResponse = {
          has_err: true,
          orderId: 0,
          salt: "",
          status: "",
          code: 0,
        };
        return data;
      });
  };

  UpdateCCPayment = ({
    orderId,
    creditcard_ReferenceNumber,
    datetime,
    ZCreditInvoiceReceiptResponse,
    ZCreditChargeResponse
  }: TUpdateCCPaymentRequest) => {
    const body: TUpdateCCPaymentRequest = {
      orderId,
      creditcard_ReferenceNumber,
      datetime,
      ZCreditInvoiceReceiptResponse,
      ZCreditChargeResponse
    };
    return axiosInstance
      .post(
        `${ORDER_API.CONTROLLER}/${ORDER_API.UPDATE_CCPAYMENT_API}`,
        body
      )
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  isValidGeo = (latitude: number, longitude: number) => {
    const body = {
      latitude,
      longitude,
    };
    return axiosInstance
      .post(`${GEO_API.CONTROLLER}/${GEO_API.IS_VALID_GEO_API}`, body)
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  isDeltaTimeSupported = (item, birthdayCakesConfig)=>{
    switch(item?.data?.categoryId){
      case "5":
        return (birthdayCakesConfig?.catDeltaTimeSupport?.indexOf(item?.data?.categoryId) > -1 &&
        birthdayCakesConfig?.subcCatBirthdayDeltaTimeSupport?.indexOf(item?.data?.subCategoryId) > -1)
        default:
          return birthdayCakesConfig?.catDeltaTimeSupport?.indexOf(item?.data?.categoryId) > -1;
        }
  }

  isBirthdayCakeInCart = (birthdayCakesConfig) => {
    const result = this.cartItems.filter((item)=> this.isDeltaTimeSupported(item,birthdayCakesConfig));
    return result.length > 0;
  }
}

export const cartStore = new CartStore();
