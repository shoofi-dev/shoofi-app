// // // // //PROD
// export const BASE_URL = "https://sari-apps-lcibm.ondigitalocean.app/api";
// export const WS_URL = "wss://sari-apps-lcibm.ondigitalocean.app";

//DEV
 export const BASE_URL = "http://192.168.68.56:1111/api";
 export const WS_URL = "ws://192.168.68.56:1111";

// export const BASE_URL = "http://192.168.0.100:1111/api";
// export const WS_URL = "ws://192.168.0.100:1111";

// export const BASE_URL = "http://192.168.68.70:1111/api";
// export const WS_URL = "ws://192.168.68.70:1111";

export const SHOOFI_ADMIN_API = {
    CONTROLLER: "shoofiAdmin",
    GET_STORES_LIST_API : "store/list",
    GET_CATEGORY_LIST_API : "category/list",
    UPDATE_STORE_API : "store/update",
};

export const AUTH_API = {
    CONTROLLER: "Authenticator",
    AUTHINTICATE_API : "Authenticate",
    VERIFY_API : "Verify",
    UPDATE_CUSTOMER_NAME_API : "UpdateCustomerName",
    GET_USER_DETAILS: "GetCustomerInfo",
    LOGOUT_API: "Logout",
    DELETE_ACOOUNT_API: "DeleteAccount"
};
export const ERROR_HANDLER = {
    CONTROLLER: "error-handler",
    INSERT_CLIENT_ERROR: "insert-client-error"

}
export const CUSTOMER_API = {
    CONTROLLER: "customer",
    CUSTOMER_CREATE_API : "create",
    ADMIN_CUSTOMER_CREATE_API : "admin-create",
    VERIFY_API : "validateAuthCode",
    GET_CUSTOMER_ORDERS_API: "orders",
    UPDATE_CUSTOMER_NAME_API : "update-name",
    UPDATE_CUSTOMER_NOTIFIVATION_TOKEN : "update-notification-token",
    GET_USER_DETAILS: "details",
    SEARCH_CUSTOMER_DETAILS: "search-customer",
    LOGOUT_API: "logout",
    DELETE_ACOOUNT_API: "delete"
};
export const MENU_API = {
    CONTROLLER: "config",
    GET_MENU_API : "menu",
    GET_SLIDER_API : "getAppSliderGallery",
    ADMIN_UPLOAD_IMAGES_API : "admin/images/upload",
    ADMIN_ADD_PRODUCT_API : "admin/product/insert",
    ADMIN_UPDATE_PRODUCT_API : "admin/product/update",
    ADMIN_UPDATE_PRODUCT_ACTIVE_TASTES_API : "admin/product/update/activeTastes",
    ADMIN_UPDATE_PRODUCTS_ORDER_TASTES_API : "admin/product/update/order",
    ADMIN_UPDATE_IS_IN_STORE_PRODUCT_API : "admin/product/update/isInStore",
    ADMIN_UPDATE_IS_IN_STORE_BY_CATEGORY_PRODUCT_API : "admin/product/update/isInStore/byCategory",
    ADMIN_DELETE_PRODUCT_API : "admin/product/delete",
    ADMIN_GET_EXTRAS_API : "admin/product/extras",
    GET_IMAGES_BY_CATEGORY : "images",
};
export const ORDER_API = {
    CONTROLLER: "order",
    SUBMIT_ORDER_API : "create",
    UPDATE_CCPAYMENT_API: "updateCCPayment",
    ADD_REFUND_API: "addRefund",
    GET_ADMIN_ORDERS_API: "admin/orders",
    GET_ADMIN_NOT_PRINTED_ORDERS_API: "admin/not-printed",
    GET_ADMIN_NOT_VIEWD_ORDERS_API: "admin/not-viewd",
    GET_ADMIN_ALL_NOT_VIEWD_ORDERS_API: "admin/all/not-viewd",
    GET_CUSTOMER_INVOICES_API: "customer-invoices",
    GET_CUSTOMER_ORDERS_API: "customer-orders",
    UPDATE_ADMIN_ORDERS_API: "update",
    UPDATE_ADMIN_ORDERS_VIEWD_API: "update/viewd",
    UPDATE_ADMIN_ORDERS_BOOK_DELIVERY_API: "book-delivery",
    CREATE_ADMIN_ORDERS_BOOK_CUSTOM_DELIVERY_API: "book-custom-delivery",
    UPDATE_ADMIN_ORDERS_BOOK_CUSTOM_DELIVERY_API: "update-custom-delivery",
    GET_ADMIN_ORDERS_BOOK_CUSTOM_DELIVERY_API: "get-custom-delivery",
    UPDATE_ALL_ADMIN_ORDERS_API: "update/all",
    PRINTED_ADMIN_ORDERS_API: "printed",
    GET_ORDERS_API : "getorders",
};
export const GEO_API = {
    CONTROLLER: "geo",
    IS_VALID_GEO_API: "isValidGeo",
};
export const STORE_API = {
    CONTROLLER: "Stores",
    GET_STORE_API : "store",
    UPDATE_STORE_API : "store/update",
    IS_UPDATE_VERSION_STORE_API : "store/is-should-update",
};
export const TRANSLATIONS_API = {
    CONTROLLER: "translations",
    GET_TRANSLATIONS : "getTranslations",
    UPDATE_TRANSLATIONS : "update",
    DELETE_TRANSLATIONS : "delete",
    ADD_TRANSLATIONS : "add",
};
export const CALANDER_API = {
    CONTROLLER: "calander",
    GET_DISABLED_HOURS_BY_DATE_API : "admin/calander/disabled/hours",
    ENABLE_DISABLED_HOUR_API : "admin/calander/enable/hour",
    ENABLE_DISABLED_HOUR_MULTI_API : "admin/calander/enable/hour/multi",
    INSERT_DISABLE_HOUR : "admin/calander/disable/hour/insert",
    INSERT_DISABLE_HOUR_MULTI : "admin/calander/disable/hour/insert/multi",
};

export const UTILITIES_API = {
    CONTROLLER: "Utilities",
    GET_ORDERS_API : "getOrders",
}
