import { requestBackend } from './backend';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type CheckoutItemInput = {
  productId: string;
  quantity: number;
};

export type StoreAddressInput = {
  label: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  isDefault?: boolean;
};

export type StoreAddress = StoreAddressInput & {
  id: string;
  userId: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CouponValidation = {
  code: string;
  discountType: 'PERCENTAGE' | 'FLAT' | null;
  discountValue: number | null;
  subtotalPaise: number;
  discountPaise: number;
  totalPaise: number;
};

export type PaymentSession = {
  razorpay: {
    keyId: string;
    orderId: string;
    amountPaise: number;
    currency: string;
  };
  summary: {
    subtotalPaise: number;
    discountPaise: number;
    totalPaise: number;
    couponCode: string | null;
  };
};

export type StoreOrderItem = {
  id: string;
  orderId: string;
  productId: string;
  productSlug: string;
  title: string;
  capacity: string;
  quantity: number;
  unitPricePaise: number;
  lineTotalPaise: number;
  unitPriceAmount: number;
  lineTotalAmount: number;
  createdAt: string;
};

export type StoreOrder = {
  id: string;
  userId: string;
  addressId: string | null;
  couponId: string | null;
  status: 'PAYMENT_PENDING' | 'PAID' | 'PAYMENT_FAILED';
  subtotalPaise: number;
  discountPaise: number;
  totalPaise: number;
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  couponCode: string | null;
  addressSnapshot: unknown;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  createdAt: string;
  updatedAt: string;
  items: StoreOrderItem[];
};

async function readData<T>(request: Promise<ApiResponse<T>>) {
  const response = await request;
  return response.data;
}

export function getStoreAddresses() {
  return readData<StoreAddress[]>(
    requestBackend('/v1/store/addresses', {
      method: 'GET',
    })
  );
}

export function createStoreAddress(address: StoreAddressInput) {
  return readData<StoreAddress>(
    requestBackend('/v1/store/addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    })
  );
}

export function updateStoreAddress(
  addressId: string,
  address: Partial<StoreAddressInput>
) {
  return readData<StoreAddress>(
    requestBackend(`/v1/store/addresses/${encodeURIComponent(addressId)}`, {
      method: 'PUT',
      body: JSON.stringify(address),
    })
  );
}

export function deleteStoreAddress(addressId: string) {
  return requestBackend<{ success: boolean }>(
    `/v1/store/addresses/${encodeURIComponent(addressId)}`,
    {
      method: 'DELETE',
    }
  );
}

export function setDefaultStoreAddress(addressId: string) {
  return readData<StoreAddress>(
    requestBackend(
      `/v1/store/addresses/${encodeURIComponent(addressId)}/default`,
      {
        method: 'PUT',
      }
    )
  );
}

export function validateStoreCoupon(code: string, items: CheckoutItemInput[]) {
  return readData<CouponValidation>(
    requestBackend('/v1/store/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({
        code,
        items,
      }),
    })
  );
}

export function createStorePaymentSession({
  addressId,
  couponCode,
  items,
}: {
  addressId: string;
  couponCode?: string | null;
  items: CheckoutItemInput[];
}) {
  return readData<PaymentSession>(
    requestBackend('/v1/store/payment-sessions', {
      method: 'POST',
      body: JSON.stringify({
        addressId,
        couponCode,
        items,
      }),
    })
  );
}

export function createStoreOrder({
  addressId,
  couponCode,
  items,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: {
  addressId: string;
  couponCode?: string | null;
  items: CheckoutItemInput[];
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  return readData<StoreOrder>(
    requestBackend('/v1/store/orders', {
      method: 'POST',
      body: JSON.stringify({
        addressId,
        couponCode,
        items,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      }),
    })
  );
}

export function getStoreOrder(orderId: string) {
  return readData<StoreOrder>(
    requestBackend(`/v1/store/orders/${encodeURIComponent(orderId)}`, {
      method: 'GET',
    })
  );
}
