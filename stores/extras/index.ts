import { makeAutoObservable } from "mobx";

class ExtrasStore {
  selections = {};
  constructor() {
    makeAutoObservable(this);
  }
  setSelection(extraId, value) {
    this.selections[extraId] = value;
    this.selections = {...this.selections};
  }
  getSelection(extraId) {
    return this.selections[extraId];
  }
  reset() {
    this.selections = {};
  }
  validate(extras) {
    if(!extras){
        return true;
    }
    for (const extra of extras) {
      const val = this.selections[extra.id];
      if (extra.required) {
        if (extra.type === "single" && !val) return false;
        if (extra.type === "multi" && (!val || val.length < (extra.min || 1))) return false;
        if (extra.type === "counter" && (val === undefined || val < (extra.min || 0))) return false;
      }
      if (extra.type === "multi" && extra.max && val && val.length > extra.max) return false;
      if (extra.type === "counter" && extra.max && val > extra.max) return false;
    }
    return true;
  }
  calculateExtrasPrice(extras) {
    let total = 0;
    for (const extra of extras) {
      const val = this.selections[extra.id];
      if (extra.type === "single" && extra.options) {
        const opt = extra.options.find(o => o.id === val);
        if (opt && opt.price) total += opt.price;
      }
      if (extra.type === "multi" && extra.options && Array.isArray(val)) {
        for (const id of val) {
          const opt = extra.options.find(o => o.id === id);
          if (opt && opt.price) total += opt.price;
        }
      }
      if (extra.type === "counter" && extra.price && val) {
        total += extra.price * val;
      }
    }
    return total;
  }
}

export const extrasStore = new ExtrasStore();
