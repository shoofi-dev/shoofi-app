import { makeAutoObservable, runInAction } from "mobx";
import { Coupon, CouponApplication } from '../../types/coupon';
import { axiosInstance } from "../../utils/http-interceptor";

class CouponsStore {
  selections = {};
  availableCoupons: Coupon[] = [];
  appliedCoupon: CouponApplication | null = null;
  isFreeDelivery = false;
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Apply a coupon to an order
  async applyCoupon(code: string, orderAmount: number, userId: string, deliveryFee?: number): Promise<CouponApplication> {
    this.loading = true;
    this.error = null;
    
    try {
      const response = await axiosInstance.post('/coupons/apply', {
        code: code.toUpperCase(),
        orderAmount,
        userId,
        deliveryFee: deliveryFee || 0
      });


      const data: any = response;
      
      runInAction(() => {
        this.appliedCoupon = data;
        this.loading = false;
      });

      return data;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      throw error;
    }
  }

  // Remove applied coupon
  removeCoupon() {
    this.appliedCoupon = null;
    this.error = null;
  }

  // Redeem a coupon (mark as used)
  async redeemCoupon(code: string, userId: string, orderId: string, discountAmount: number): Promise<any> {
    try {
      const response = await axiosInstance.post('/coupons/redeem', {
        code: code.toUpperCase(),
        userId,
        orderId,
        discountAmount
      });

      const data: any = response;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Get and apply auto-apply coupons for a customer
  async getAndApplyAutoCoupons(userId?: string, orderAmount?: number, deliveryFee?: number): Promise<CouponApplication | null> {
    try {
      const response = await axiosInstance.get(`/coupons/auto-apply/${userId}?orderAmount=${orderAmount}&deliveryFee=${deliveryFee}`);
      const autoApplyCoupons: Coupon[] = response.data || response;

      if (autoApplyCoupons.length === 0) {
        return null;
      }

      // Find the best auto-apply coupon (highest discount value)
      let bestCoupon: Coupon | null = null;
      let bestDiscount = 0;

      for (const coupon of autoApplyCoupons) {
        let discountAmount = 0;
        
        switch (coupon.type) {
          case 'percentage':
            discountAmount = (orderAmount * coupon.value) / 100;
            if (coupon.maxDiscount) {
              discountAmount = Math.min(discountAmount, coupon.maxDiscount);
            }
            break;
          case 'fixed_amount':
            discountAmount = coupon.value;
            break;
          case 'free_delivery':
            discountAmount = coupon.value;
            break;
        }

        if (discountAmount > bestDiscount) {
          bestCoupon = coupon;
          bestDiscount = discountAmount;
        }
      }

      if (bestCoupon) {
        const couponApp: CouponApplication = {
          coupon: bestCoupon,
          discountAmount: bestDiscount
        };

        runInAction(() => {
          this.appliedCoupon = couponApp;
          this.isFreeDelivery = couponApp.coupon.type === "free_delivery";
        });

        return couponApp;
      }

      return null;
    } catch (error) {
      console.error('Failed to get auto-apply coupons:', error);
      return null;
    }
  }

  // Get available coupons for a user
  async getAvailableCoupons(): Promise<Coupon[]> {
    this.loading = true;
    this.error = null;

    try {
      const response = await axiosInstance.get('/coupons/available');
      
      const data: any = response;
      
      runInAction(() => {
        this.availableCoupons = data;
        this.loading = false;
      });

      return data;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      throw error;
    }
  }

  // Get user's coupon usage history
  async getUserCouponHistory(userId: string): Promise<any[]> {
    try {
      const response = await axiosInstance.get(`/coupons/user/${userId}/history`);
      
      const data: any = response;
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Clear error
  clearError() {
    this.error = null;
  }
}

export const couponsStore = new CouponsStore();
export { CouponsStore };
