import { Platform } from 'react-native';

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
};

export type RazorpayCheckoutResult = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayCheckoutModule = {
  open: (options: RazorpayCheckoutOptions) => Promise<RazorpayCheckoutResult>;
};

function loadRazorpayCheckout() {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const razorpayModule = require('react-native-razorpay') as
      | RazorpayCheckoutModule
      | { default?: RazorpayCheckoutModule };

    return 'open' in razorpayModule
      ? razorpayModule
      : razorpayModule.default ?? null;
  } catch {
    return null;
  }
}

export async function openRazorpayCheckout(options: RazorpayCheckoutOptions) {
  const RazorpayCheckout = loadRazorpayCheckout();

  if (!RazorpayCheckout) {
    throw new Error(
      'Razorpay checkout is not available in this build. Rebuild the app after installing react-native-razorpay.'
    );
  }

  return RazorpayCheckout.open(options);
}
