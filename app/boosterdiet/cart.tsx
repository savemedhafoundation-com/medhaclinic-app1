import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  Image,
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

import BottomNav from '../../components/BottomNav';
import ScreenNav, {
  SCREEN_NAV_CONTENT_PADDING_TOP,
} from '../../components/ScreenNav';
import { useCart } from '../../providers/CartProvider';
import { goBackOrReplace } from '../../services/navigation';

function formatPrice(amount: number) {
  return `Rs ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function BoosterCartScreen() {
  const insets = useSafeAreaInsets();
  const {
    clearCart,
    itemCount,
    items,
    removeItem,
    totalAmount,
    updateQuantity,
  } = useCart();

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScreenNav
          onBackPress={() => goBackOrReplace('/boosterdiet/store')}
          right={
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => clearCart()}
              style={styles.clearButton}
            >
              <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          }
          subtitle={
            itemCount > 0
              ? `${itemCount} item${itemCount === 1 ? '' : 's'} ready`
              : 'Add booster products to see them here'
          }
          title="Your Cart"
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: SCREEN_NAV_CONTENT_PADDING_TOP,
              paddingBottom: insets.bottom + 130,
            },
          ]}
        >
          {items.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconWrap}>
                <Ionicons color="#138A07" name="cart-outline" size={34} />
              </View>
              <Text style={styles.emptyTitle}>Your cart is empty</Text>
              <Text style={styles.emptyText}>
                Go back to the Booster Store and add the products you want to keep.
              </Text>

              <TouchableOpacity
                activeOpacity={0.92}
                onPress={() => router.replace('/boosterdiet/store')}
                style={styles.emptyButton}
              >
                <Text style={styles.emptyButtonText}>Browse Store</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {items.map(item => (
                <View key={item.product.id} style={styles.itemCard}>
                  <View style={styles.itemImageWrap}>
                    <Image
                      source={item.product.image}
                      resizeMode="contain"
                      style={styles.itemImage}
                    />
                  </View>

                  <View style={styles.itemBody}>
                    <View style={styles.itemTopRow}>
                      <View style={styles.itemCopy}>
                        <Text style={styles.itemTitle}>{item.product.title}</Text>
                        <Text style={styles.itemCapacity}>{item.product.capacity}</Text>
                        <Text style={styles.itemDescription}>{item.product.description}</Text>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.88}
                        onPress={() => removeItem(item.product.id)}
                        style={styles.removeButton}
                      >
                        <Ionicons color="#EF4444" name="close" size={20} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.itemFooter}>
                      <Text style={styles.itemPrice}>{item.product.priceLabel}</Text>

                      <View style={styles.quantityRow}>
                        <TouchableOpacity
                          activeOpacity={0.88}
                          onPress={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          style={styles.quantityButton}
                        >
                          <Ionicons color="#138A07" name="remove" size={18} />
                        </TouchableOpacity>

                        <Text style={styles.quantityText}>{item.quantity}</Text>

                        <TouchableOpacity
                          activeOpacity={0.88}
                          onPress={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          style={styles.quantityButton}
                        >
                          <Ionicons color="#138A07" name="add" size={18} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Text style={styles.lineTotal}>
                      Line Total: {formatPrice(item.product.price * item.quantity)}
                    </Text>
                  </View>
                </View>
              ))}

              <View style={styles.summaryCard}>
                <Text style={styles.summaryEyebrow}>Order Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Items</Text>
                  <Text style={styles.summaryValue}>{itemCount}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Estimated Total</Text>
                  <Text style={styles.summaryTotal}>{formatPrice(totalAmount)}</Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.92}
                  onPress={() => router.push('/boosterdiet/checkout')}
                  style={styles.checkoutButton}
                >
                  <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>

        <BottomNav />
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
  headerBlock: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 148,
    height: 64,
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    marginTop: 18,
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
  },
  headerSubtitle: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.88)',
    fontSize: 14,
    lineHeight: 20,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  emptyCard: {
    marginTop: 24,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 22,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EAF8E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 18,
    color: '#123E16',
    fontSize: 22,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 10,
    color: '#5B6670',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 22,
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#138A07',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  itemCard: {
    marginBottom: 14,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    padding: 14,
    flexDirection: 'row',
  },
  itemImageWrap: {
    width: 104,
    height: 118,
    borderRadius: 18,
    backgroundColor: '#F7FAF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImage: {
    width: '82%',
    height: '82%',
  },
  itemBody: {
    flex: 1,
    marginLeft: 12,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemCopy: {
    flex: 1,
    paddingRight: 8,
  },
  itemTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  itemCapacity: {
    marginTop: 4,
    color: '#138A07',
    fontSize: 13,
    fontWeight: '700',
  },
  itemDescription: {
    marginTop: 8,
    color: '#5F6673',
    fontSize: 13,
    lineHeight: 18,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemFooter: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemPrice: {
    color: '#138A07',
    fontSize: 18,
    fontWeight: '800',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EDF8EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    minWidth: 28,
    textAlign: 'center',
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  lineTotal: {
    marginTop: 10,
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '600',
  },
  summaryCard: {
    marginTop: 8,
    borderRadius: 24,
    backgroundColor: '#103012',
    padding: 20,
  },
  summaryEyebrow: {
    color: 'rgba(255,255,255,0.74)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  summaryRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: '#E5F4E2',
    fontSize: 15,
    fontWeight: '600',
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  summaryTotal: {
    color: '#24CF16',
    fontSize: 22,
    fontWeight: '800',
  },
  checkoutButton: {
    marginTop: 22,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#138A07',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
