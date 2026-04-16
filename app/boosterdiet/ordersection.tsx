import { Ionicons } from '@expo/vector-icons';
import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import { useState } from 'react';
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

import {
  BOOSTER_PRODUCTS,
  getBoosterProduct,
} from '../../constants/boosterStore';
import ScreenNav, {
  SCREEN_NAV_CONTENT_PADDING_TOP,
} from '../../components/ScreenNav';
import { useCart } from '../../providers/CartProvider';
import { goBackOrReplace } from '../../services/navigation';

type DetailTab = 'description' | 'howToUse' | 'review';

const DETAIL_TABS: {
  key: DetailTab;
  label: string;
}[] = [
  { key: 'description', label: 'Description' },
  { key: 'howToUse', label: 'How to use' },
  { key: 'review', label: 'Review' },
];

function getParamValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function formatPrice(amount: number) {
  return `Rs ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatTotal(amount: number) {
  return amount.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  });
}

function getPackCount(packSize: string) {
  const count = Number.parseInt(packSize, 10);
  return Number.isFinite(count) && count > 0 ? count : 60;
}

export default function BoosterOrderSectionScreen() {
  const insets = useSafeAreaInsets();
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const selectedProductId = getParamValue(productId);
  const product =
    getBoosterProduct(selectedProductId ?? '') ??
    getBoosterProduct('bone-marrow-booster') ??
    BOOSTER_PRODUCTS[0];
  const { getQuantity, updateQuantity } = useCart();
  const cartQuantity = getQuantity(product.id);
  const [quantity, setQuantity] = useState(cartQuantity > 0 ? cartQuantity : 1);
  const [selectedPackSize, setSelectedPackSize] = useState(
    product.packSizes.includes(product.capacity)
      ? product.capacity
      : product.packSizes[0]
  );
  const [activeTab, setActiveTab] = useState<DetailTab>('description');

  const discountPercent = Math.round(
    ((product.mrp - product.price) / product.mrp) * 100
  );
  const totalCost = product.price * quantity;
  const pricePerCapsule = product.price / getPackCount(product.packSizes[0]);
  const activeDetail =
    activeTab === 'howToUse'
      ? product.howToUse
      : activeTab === 'review'
        ? product.review
        : product.detailDescription;

  function decreaseQuantity() {
    setQuantity(currentQuantity => Math.max(1, currentQuantity - 1));
  }

  function increaseQuantity() {
    setQuantity(currentQuantity => currentQuantity + 1);
  }

  function handlePayNow() {
    updateQuantity(product.id, quantity);
    router.push('/boosterdiet/cart');
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScreenNav onBackPress={() => goBackOrReplace('/boosterdiet/store')} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: SCREEN_NAV_CONTENT_PADDING_TOP,
              paddingBottom: insets.bottom + 150,
            },
          ]}
        >
          <View style={styles.productStage}>
            <View style={[styles.capsuleGlow, styles.capsuleGlowTop]} />
            <View style={[styles.capsuleGlow, styles.capsuleGlowLeft]} />
            <View style={[styles.capsuleGlow, styles.capsuleGlowBottom]} />

            <Image
              source={product.image}
              resizeMode="contain"
              style={styles.heroBottle}
            />
          </View>

          <View style={styles.titleRow}>
            <View style={styles.titleCopy}>
              <Text style={styles.productTitle}>{product.title}</Text>
              <Text style={styles.productSubtitle}>{product.subtitle}</Text>
            </View>

            <View style={styles.quantityPill}>
              <TouchableOpacity
                activeOpacity={0.86}
                onPress={increaseQuantity}
                style={styles.quantityButton}
              >
                <Ionicons name="add" size={16} color="#117D07" />
              </TouchableOpacity>

              <Text style={styles.quantityText}>{quantity}</Text>

              <TouchableOpacity
                activeOpacity={0.86}
                onPress={decreaseQuantity}
                style={styles.quantityButton}
              >
                <Ionicons name="remove" size={16} color="#117D07" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.tabShell}>
            {DETAIL_TABS.map(tab => {
              const active = activeTab === tab.key;

              return (
                <TouchableOpacity
                  key={tab.key}
                  activeOpacity={0.86}
                  onPress={() => setActiveTab(tab.key)}
                  style={[styles.tabButton, active && styles.tabButtonActive]}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.detailText}>{activeDetail}</Text>
          <Text style={styles.supportLine}>{product.supportLine}</Text>

          <View style={styles.packRow}>
            <Text style={styles.packLabel}>Select Pack Size:</Text>

            <View style={styles.packOptions}>
              {product.packSizes.map(packSize => {
                const selected = selectedPackSize === packSize;

                return (
                  <TouchableOpacity
                    key={packSize}
                    activeOpacity={0.88}
                    onPress={() => setSelectedPackSize(packSize)}
                    style={[styles.packPill, selected && styles.packPillActive]}
                  >
                    <Text
                      style={[
                        styles.packPillText,
                        selected && styles.packPillTextActive,
                      ]}
                    >
                      {packSize}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceText}>{formatPrice(product.price)}</Text>
            <Text style={styles.mrpText}>MRP* {formatPrice(product.mrp)}</Text>
            <Text style={styles.discountText}>{discountPercent}% Off</Text>
          </View>

          <Text style={styles.capsulePrice}>
            Rs {pricePerCapsule.toFixed(2)}/Capsule inclusive of all taxes
          </Text>
        </ScrollView>
      </SafeAreaView>

      <View
        style={[
          styles.payFooter,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <View>
          <Text style={styles.totalLabel}>Total Cost</Text>
          <Text style={styles.totalValue}>{formatTotal(totalCost)}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.92}
          onPress={handlePayNow}
          style={styles.payButton}
        >
          <Text style={styles.payButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EAF1F2',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    minHeight: 94,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 160,
    height: 70,
  },
  headerSpacer: {
    width: 42,
    height: 42,
  },
  content: {
    paddingHorizontal: 22,
  },
  productStage: {
    minHeight: 310,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  capsuleGlow: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.62)',
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  capsuleGlowTop: {
    top: 18,
    right: -42,
    width: 88,
    height: 168,
    transform: [{ rotate: '28deg' }],
  },
  capsuleGlowLeft: {
    left: -54,
    bottom: 50,
    width: 86,
    height: 168,
    transform: [{ rotate: '78deg' }],
  },
  capsuleGlowBottom: {
    right: -50,
    bottom: -6,
    width: 96,
    height: 186,
    transform: [{ rotate: '-28deg' }],
  },
  heroBottle: {
    width: 270,
    height: 292,
    transform: [{ rotate: '-10deg' }],
  },
  titleRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
  },
  titleCopy: {
    flex: 1,
  },
  productTitle: {
    color: '#111111',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '600',
  },
  productSubtitle: {
    marginTop: 10,
    color: '#111111',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  quantityPill: {
    marginTop: 6,
    minWidth: 114,
    height: 30,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.78)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#CFFCCB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    minWidth: 34,
    textAlign: 'center',
    color: '#111111',
    fontSize: 16,
    fontWeight: '600',
  },
  tabShell: {
    marginTop: 28,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.58)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    fontWeight: '700',
  },
  detailText: {
    marginTop: 28,
    color: '#111111',
    fontSize: 15,
    lineHeight: 25,
    fontWeight: '500',
  },
  supportLine: {
    marginTop: 28,
    color: '#111111',
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '500',
  },
  packRow: {
    marginTop: 28,
  },
  packLabel: {
    color: '#111111',
    fontSize: 17,
    fontWeight: '700',
  },
  packOptions: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  packPill: {
    minWidth: 86,
    height: 38,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  packPillActive: {
    backgroundColor: '#137E06',
    borderColor: '#137E06',
  },
  packPillText: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '600',
  },
  packPillTextActive: {
    color: '#FFFFFF',
  },
  priceRow: {
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  priceText: {
    color: '#000000',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
  },
  mrpText: {
    color: '#111111',
    fontSize: 14,
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  discountText: {
    color: '#137E06',
    fontSize: 20,
    fontWeight: '700',
  },
  capsulePrice: {
    marginTop: 20,
    color: '#111111',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
  },
  payFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(234, 241, 242, 0.96)',
    paddingHorizontal: 22,
    paddingTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 22,
  },
  totalLabel: {
    color: '#111111',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  totalValue: {
    marginTop: 6,
    color: '#137E06',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '500',
  },
  payButton: {
    flex: 1,
    maxWidth: 210,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#138A07',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
});
