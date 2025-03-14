import { makeAutoObservable, runInAction } from "mobx";
import { groupBy } from "lodash";
import { MENU_API } from "../../consts/api";
import { fromBase64 } from "../../helpers/convert-base64";
import { axiosInstance } from "../../utils/http-interceptor";
import i18n from "../../translations/index-x";
import { setTranslations, getCurrentLang } from "../../translations/i18n";
import { orderBy } from "lodash";
import { TProduct } from "../../screens/admin/product/add";

class MenuStore {
  menu = null;
  categories = null;
  meals = null;
  dictionary = null;
  homeSlides = null;
  imagesUrl = [];
  categoriesImages = [];
  selectedCategoryId = null;

  constructor() {
    makeAutoObservable(this);
  }
  getMealTags = (mealId) => {
    const mealTags = groupBy(this.meals[mealId], (x) => x.tag);
    return mealTags;
  };
  getMenuFromServer = () => {
    const body = {};
    return axiosInstance
      .get(`${MENU_API.GET_MENU_API}`)
      .then(function (response) {
        return response;
      });
  };
  getMenu = () => {
    return new Promise((resolve) => {
      this.getMenuFromServer().then((res: any) => {
        runInAction(() => {
          this.categories = res.menu;
          this.imagesUrl = res.productsImagesList;
          this.categoriesImages = res.categoryImages;
          // Object.keys(this.meals).map((key) => {
          //   const extras = this.getMealTags(key);
          //   this.meals[key].extras = extras;
          //   this.mainMealTags(key, extras);
          //   this.meals[key].data = res.menu.find((product) => product.id.toString() === key)
          //   this.imagesUrl.push(this.meals[key].data?.image_url)
          // });
          resolve(true);
        });
      });
    });
  };

  getSlidesFromServer = () => {
    const body = {};
    return axiosInstance
      .post(`${MENU_API.CONTROLLER}/${MENU_API.GET_SLIDER_API}`, body)
      .then(function (response) {
        const res = JSON.parse(fromBase64(response.data));
        return res;
      });
  };

  getSlides = () => {
    return new Promise((resolve) => {
      this.getSlidesFromServer().then((res) => {
        runInAction(() => {
          this.homeSlides = res.slider_gallery;
          resolve(true);
        });
      });
    });
  };

  updateProductIsInStoreFromServer = (data) => {
    const body = data;
    return axiosInstance
      .post(`${MENU_API.ADMIN_UPDATE_IS_IN_STORE_PRODUCT_API}`, body)
      .then(function (response) {
        return true;
      });
  };

  updateProductIsInStore = (data) => {
    return new Promise((resolve) => {
      this.updateProductIsInStoreFromServer(data).then((res) => {
          resolve(true);
      });
    });
  };

  updateProductIsInStoreByCategoryFromServer = (data) => {
    const body = data;
    return axiosInstance
      .post(`${MENU_API.ADMIN_UPDATE_IS_IN_STORE_BY_CATEGORY_PRODUCT_API}`, body)
      .then(function (response) {
        return true;
      });
  };

  updateProductIsInStoreByCategory = (data) => {
    return new Promise((resolve) => {
      this.updateProductIsInStoreByCategoryFromServer(data).then((res) => {
          resolve(true);
      });
    });
  };
  
  updateProductActiveTastesFromServer = (data) => {
    const body = data;
    return axiosInstance
      .post(`${MENU_API.ADMIN_UPDATE_PRODUCT_ACTIVE_TASTES_API}`, body)
      .then(function (response) {
        return true;
      });
  };

  updateProductActiveTastes = (data) => {
    return new Promise((resolve) => {
      this.updateProductActiveTastesFromServer(data).then((res) => {
          resolve(true);
      });
    });
  };

  updateProductsOrderFromServer = (data) => {
    const body = data;
    return axiosInstance
      .post(`${MENU_API.ADMIN_UPDATE_PRODUCTS_ORDER_TASTES_API}`, body)
      .then(function (response) {
        return true;
      });
  };

  updateProductsOrder = (data) => {
    return new Promise((resolve) => {
      this.updateProductsOrderFromServer(data).then((res) => {
          resolve(true);
      });
    });
  };

  getImagesByCategoryFromServer = (categoryType: string) => {
    const body = {
      type: categoryType,
    };
    return axiosInstance
      .post(`${MENU_API.GET_IMAGES_BY_CATEGORY}`, body)
      .then(function (response) {
        const res = response;
        return res;
      });
  };

  getImagesByCategory = (categoryType: string) => {
    return this.getImagesByCategoryFromServer(categoryType);
  };

  getMealByKey = (key) => {
    let temp = {};
    if (this.meals[key]) {
      temp = JSON.parse(JSON.stringify(this.meals[key]));
    }
    return temp;
  };
  getFromCategoriesMealByKey = (mealId) => {
    let foundedMeal = null;
    this.categories.forEach((category) => {
      if (foundedMeal) {
        return;
      }
      foundedMeal = category.products.find((product) => product._id === mealId);
    });
    return foundedMeal || {};
  };
  updateBcoinPrice = (price: number) => {
    Object.keys(this.categories).map((key) => {
      const founded = this.categories[key].find((meal, index) => {
        if (meal.id == 3027) {
          this.categories[key][index] = { ...meal, price };
          this.categories[key];
          this.categories[key] = {
            ...this.categories,
            [key]: this.categories[key],
          };
        }
      });
    });
  };

  initMealsTags = (tag, type, key) => {
    const extrasType = this.meals[key].extras[type].map((tagItem) => {
      if (tagItem.id === tag.id) {
        if (tag.type === "CHOICE") {
          tagItem.value = tag.isdefault;
        } else {
          tagItem.value = tag.counter_init_value;
        }
      }
      return tagItem;
    });
    const sortedExtrasType = orderBy(
      extrasType,
      ["constant_order_priority"],
      ["asc"]
    );
    this.meals[key].extras[type] = sortedExtrasType;
    this.meals[key].extras["orderList"] =
      this.meals[key].extras["orderList"] || {};
    if (this.meals[key].extras[type][0].available_on_app) {
      this.meals[key].extras["orderList"][type] = this.meals[key].extras[
        type
      ][0].order_priority;
    }
    this.meals[key] = { ...this.meals[key], extras: this.meals[key].extras };
  };

  mainMealTags = (mealKey, mealTags) => {
    Object.keys(mealTags).map((key) => {
      mealTags[key].map((tag) => {
        this.initMealsTags(tag, key, mealKey);
      });
    });
  };

  translate = (id: string) => {
    const item = this.dictionary.find((item) => item.id === id);
    if (getCurrentLang() === "ar") {
      return item.name_ar;
    }
    return item.name_he;
  };

  uploadImages = (imagesList: any, subType?: any, isEditMode?: boolean) => {
    let formData = new FormData();
    const images = imagesList.map((image) => {
      const imageObj = {
        uri: image.path,
        type: image.type,
        name: image.fileName,
      };
      formData.append("img", imageObj);
      return imageObj;
    });

    subType && formData.append("subType", subType);

    return axiosInstance
      .post(
        `${
          isEditMode
            ? MENU_API.ADMIN_UPDATE_PRODUCT_API
            : MENU_API.ADMIN_UPLOAD_IMAGES_API
        }`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      )
      .then(function (response) {
        return response;
      })
      .catch((e) => {});
  };

  addOrUpdateProduct = (
    product: TProduct,
    isEditMode: boolean,
    isNewImage: boolean
  ) => {
    let formData = new FormData();
    product.nameAR && formData.append("nameAR", product.nameAR);
    product.nameHE && formData.append("nameHE", product.nameHE);

    if (!isEditMode || isNewImage) {
      product.img &&
        formData.append("img", {
          uri: product.img.uri,
          type: product.img.type,
          name: product.img.fileName,
        });
    }
    if (isEditMode) {
      product?._id && formData.append("productId", product?._id);
    }

    product.categoryId && formData.append("categoryId", product.categoryId);
    product.subCategoryId && formData.append("subCategoryId", product.subCategoryId);
    product.cakeLevels && formData.append("cakeLevels", product.cakeLevels.toString());

    formData.append("descriptionAR", product.descriptionAR);
    formData.append("descriptionHE", product.descriptionHE);

    product.notInStoreDescriptionAR && formData.append("notInStoreDescriptionAR", product.notInStoreDescriptionAR);
    product.notInStoreDescriptionAR && formData.append("notInStoreDescriptionHE", product.notInStoreDescriptionHE);


    formData.append("mediumPrice", product.mediumPrice.toString());
    product.largePrice && formData.append("largePrice", product.largePrice.toString());
    formData.append("mediumCount", product.mediumCount.toString());
    product.largeCount && formData.append("largeCount", product.largeCount.toString());
    formData.append("isInStore", product.isInStore.toString());
    formData.append("isToNameAndAge", product.isToNameAndAge.toString());
    formData.append("isUploadImage", product.isUploadImage.toString());
    product.isWeight && formData.append("isWeight", product.isWeight.toString());

    product?.activeTastes && formData.append("activeTastes", product.activeTastes.toString());
    // return axios
    //   .post(process.env.REACT_APP_API+"admin/product/insert",formData,{})
    //   .then(function (response) {
    //       return response.data;
    //   });

    return axiosInstance
      .post(
        `${
          isEditMode
            ? MENU_API.ADMIN_UPDATE_PRODUCT_API
            : MENU_API.ADMIN_ADD_PRODUCT_API
        }`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      )
      .then(function (response) {
        return response;
      })
      .catch((e) => {});
  };

  deleteProduct = (ids: string[]) => {
    return axiosInstance
      .post(`${MENU_API.ADMIN_DELETE_PRODUCT_API}`, { productsIdsList: ids })
      .then(function (response) {
        return response;
      });
  };

  getCategoryById = (categoryId: string) => {
    return this.categories.find((category) => category?._id === categoryId);
  };

  getMenuImages = () => {};

  updateSelectedCategory = (categoryId) =>{
    this.selectedCategoryId = categoryId;
  }
}

export const menuStore = new MenuStore();
