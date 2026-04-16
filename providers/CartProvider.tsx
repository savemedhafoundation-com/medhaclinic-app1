import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  getBoosterProduct,
  type BoosterProduct,
} from '../constants/boosterStore';

type StoredCartEntry = {
  productId: string;
  quantity: number;
};

export type CartItem = {
  product: BoosterProduct;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  ready: boolean;
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getQuantity: (productId: string) => number;
};

const STORAGE_KEY = 'medha_booster_cart_v1';
const CartContext = createContext<CartContextValue | null>(null);

function toValidEntries(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as StoredCartEntry[];
  }

  return value
    .map(entry => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const candidate = entry as Record<string, unknown>;
      const productId =
        typeof candidate.productId === 'string' ? candidate.productId : '';
      const quantity =
        typeof candidate.quantity === 'number'
          ? Math.floor(candidate.quantity)
          : Number.NaN;

      if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
        return null;
      }

      if (!getBoosterProduct(productId)) {
        return null;
      }

      return {
        productId,
        quantity,
      };
    })
    .filter((entry): entry is StoredCartEntry => Boolean(entry));
}

export function CartProvider({ children }: PropsWithChildren) {
  const [entries, setEntries] = useState<StoredCartEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function hydrateCart() {
      try {
        const rawValue = await AsyncStorage.getItem(STORAGE_KEY);

        if (!active || !rawValue) {
          return;
        }

        const parsedValue = JSON.parse(rawValue) as unknown;
        setEntries(toValidEntries(parsedValue));
      } catch (error) {
        console.log('Cart restore error:', error);
      } finally {
        if (active) {
          setReady(true);
        }
      }
    }

    void hydrateCart();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries)).catch(error => {
      console.log('Cart persist error:', error);
    });
  }, [entries, ready]);

  const items = entries
    .map(entry => {
      const product = getBoosterProduct(entry.productId);

      if (!product) {
        return null;
      }

      return {
        product,
        quantity: entry.quantity,
      };
    })
    .filter((entry): entry is CartItem => Boolean(entry));

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  function addItem(productId: string) {
    const product = getBoosterProduct(productId);

    if (!product) {
      return;
    }

    setEntries(currentEntries => {
      const existingEntry = currentEntries.find(entry => entry.productId === productId);

      if (!existingEntry) {
        return [...currentEntries, { productId, quantity: 1 }];
      }

      return currentEntries.map(entry =>
        entry.productId === productId
          ? { ...entry, quantity: entry.quantity + 1 }
          : entry
      );
    });
  }

  function removeItem(productId: string) {
    setEntries(currentEntries =>
      currentEntries.filter(entry => entry.productId !== productId)
    );
  }

  function updateQuantity(productId: string, quantity: number) {
    const product = getBoosterProduct(productId);
    const nextQuantity = Math.floor(quantity);

    if (!product) {
      return;
    }

    if (nextQuantity <= 0) {
      removeItem(productId);
      return;
    }

    setEntries(currentEntries => {
      const existingEntry = currentEntries.find(entry => entry.productId === productId);

      if (!existingEntry) {
        return [...currentEntries, { productId, quantity: nextQuantity }];
      }

      return currentEntries.map(entry =>
        entry.productId === productId
          ? { ...entry, quantity: nextQuantity }
          : entry
      );
    });
  }

  function clearCart() {
    setEntries([]);
  }

  function getQuantity(productId: string) {
    const matchingEntry = entries.find(entry => entry.productId === productId);
    return matchingEntry?.quantity ?? 0;
  }

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalAmount,
        ready,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider.');
  }

  return context;
}
