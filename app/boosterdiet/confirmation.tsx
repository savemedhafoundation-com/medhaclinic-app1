import { Ionicons } from '@expo/vector-icons';
import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import {
  useEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import ScreenNav, {
  SCREEN_NAV_CONTENT_PADDING_TOP,
} from '../../components/ScreenNav';
import { readErrorMessage } from '../../services/backend';
import { goBackOrReplace } from '../../services/navigation';
import {
  getStoreOrder,
  type StoreOrder,
} from '../../services/storeApi';

function formatPaise(amountPaise: number) {
  return `Rs ${(amountPaise / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function BoosterOrderConfirmationScreen() {
  const insets = useSafeAreaInsets();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const selectedOrderId = getParamValue(orderId);
  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [loading, setLoading] = useState(Boolean(selectedOrderId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      if (!selectedOrderId) {
        setLoading(false);
        setError('Order ID is missing.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const nextOrder = await getStoreOrder(selectedOrderId);

        if (active) {
          setOrder(nextOrder);
        }
      } catch (loadError) {
        if (active) {
          setError(readErrorMessage(loadError) ?? 'Could not load this order.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadOrder();

    return () => {
      active = false;
    };
  }, [selectedOrderId]);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScreenNav
          onBackPress={() => goBackOrReplace('/boosterdiet/store')}
          subtitle="Medha Botanics"
          title="Order Confirmed"
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: SCREEN_NAV_CONTENT_PADDING_TOP,
              paddingBottom: insets.bottom + 36,
            },
          ]}
        >
          <View style={styles.heroCard}>
            <View style={styles.successIcon}>
              <Ionicons color="#FFFFFF" name="checkmark" size={38} />
            </View>
            <Text style={styles.title}>Payment Successful</Text>
            <Text style={styles.subtitle}>
              Your booster order has been placed.
            </Text>
          </View>

          {loading ? (
            <View style={styles.stateCard}>
              <ActivityIndicator color="#138A07" />
              <Text style={styles.stateText}>Loading order details</Text>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {order ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Order Summary</Text>
              <Text style={styles.orderId}>Order ID: {order.id}</Text>

              {order.items.map(item => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemCopy}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemMeta}>
                      {item.capacity} x {item.quantity}
                    </Text>
                  </View>
                  <Text style={styles.itemAmount}>
                    {formatPaise(item.lineTotalPaise)}
                  </Text>
                </View>
              ))}

              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  {formatPaise(order.subtotalPaise)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={styles.discountValue}>
                  - {formatPaise(order.discountPaise)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.payableLabel}>Paid</Text>
                <Text style={styles.payableValue}>
                  {formatPaise(order.totalPaise)}
                </Text>
              </View>
            </View>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => router.replace('/boosterdiet/store')}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FBF7',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  heroCard: {
    borderRadius: 8,
    backgroundColor: '#103012',
    padding: 24,
    alignItems: 'center',
  },
  successIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#138A07',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 18,
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    color: '#DDEEDD',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  stateCard: {
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: 18,
    alignItems: 'center',
  },
  stateText: {
    marginTop: 10,
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '700',
  },
  errorCard: {
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    padding: 14,
  },
  errorText: {
    color: '#B42318',
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  orderId: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
  },
  itemRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemCopy: {
    flex: 1,
    paddingRight: 12,
  },
  itemTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
  },
  itemMeta: {
    marginTop: 3,
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },
  itemAmount: {
    color: '#138A07',
    fontSize: 15,
    fontWeight: '800',
  },
  divider: {
    marginTop: 16,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  summaryRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '700',
  },
  summaryValue: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
  },
  discountValue: {
    color: '#138A07',
    fontSize: 15,
    fontWeight: '800',
  },
  payableLabel: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '900',
  },
  payableValue: {
    color: '#138A07',
    fontSize: 22,
    fontWeight: '900',
  },
  primaryButton: {
    marginTop: 18,
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: '#138A07',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});
