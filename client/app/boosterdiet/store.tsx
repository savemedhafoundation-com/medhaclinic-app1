import { useCallback, useEffect, useState } from 'react';

import { router } from 'expo-router';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import BottomNav from '../../components/BottomNav';
import ScreenNav, {
  SCREEN_NAV_CONTENT_PADDING_TOP,
} from '../../components/ScreenNav';
import {
  mapStoreProductToBoosterProduct,
  type BoosterCategory,
  type BoosterProduct,
} from '../../constants/boosterStore';
import { useCart } from '../../providers/CartProvider';
import { getConfiguredBackendUrl } from '../../services/backend';
import { goBackOrReplace } from '../../services/navigation';
import { getStoreProducts } from '../../services/storeApi';

const storeHeroImage = require('../../assets/images/Untitled design (3) 1.png');
const storePosterBackground = require('../../assets/images/Rectangle 665.png');

type FilterTab = 'all' | BoosterCategory;

function CategoryPill({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.categoryPill, active && styles.categoryPillActive]}
    >
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.78}
        numberOfLines={1}
        style={[styles.categoryPillText, active && styles.categoryPillTextActive]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ProductCard({
  favorite,
  onBuyNow,
  onOpen,
  onToggleFavorite,
  product,
  quantity,
}: {
  favorite: boolean;
  onBuyNow: () => void;
  onOpen: () => void;
  onToggleFavorite: () => void;
  product: BoosterProduct;
  quantity: number;
}) {
  return (
    <View style={styles.productCard}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onToggleFavorite}
        style={styles.favoriteButton}
      >
        <Ionicons
          color={favorite ? '#1A880E' : '#101010'}
          name={favorite ? 'heart' : 'heart-outline'}
          size={22}
        />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onOpen}
        style={styles.productImageWrap}
      >
        <Image source={product.image} resizeMode="contain" style={styles.productImage} />
      </TouchableOpacity>

      <Text ellipsizeMode="tail" numberOfLines={2} style={styles.productTitle}>
        {product.title}
      </Text>
      <Text ellipsizeMode="tail" numberOfLines={1} style={styles.productCapacity}>
        {product.capacity}
      </Text>
      <Text ellipsizeMode="tail" numberOfLines={1} style={styles.productPrice}>
        {product.priceLabel}
      </Text>

      <Text ellipsizeMode="tail" numberOfLines={2} style={styles.productMeta}>
        {quantity > 0 ? `In cart: ${quantity}` : product.description}
      </Text>

      <TouchableOpacity activeOpacity={0.92} onPress={onBuyNow} style={styles.addButton}>
        <Text style={styles.addButtonText}>Buy Now</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function BoosterStoreScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterTab>('all');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [prioritizeFavorites, setPrioritizeFavorites] = useState(false);
  const [products, setProducts] = useState<BoosterProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const { getQuantity, itemCount } = useCart();

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    setProductsError(null);
    try {
      const storeProducts = await getStoreProducts();
      setProducts(storeProducts.map(mapStoreProductToBoosterProduct));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Could not reach the product backend.';
      console.log('Store products load error:', {
        backendUrl: getConfiguredBackendUrl(),
        error,
      });
      setProductsError(message);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredProducts = products.filter(product => {
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch =
      !normalizedSearch ||
      product.title.toLowerCase().includes(normalizedSearch) ||
      product.searchTerms.some(term => term.includes(normalizedSearch));

    return matchesCategory && matchesSearch;
  }).sort((leftProduct, rightProduct) => {
    if (!prioritizeFavorites) {
      return 0;
    }

    const leftFavorite = favoriteIds.includes(leftProduct.id);
    const rightFavorite = favoriteIds.includes(rightProduct.id);

    if (leftFavorite === rightFavorite) {
      return 0;
    }

    return leftFavorite ? -1 : 1;
  });

  const popularProducts = products.filter(product => product.popular);

  function toggleFavorite(productId: string) {
    setFavoriteIds(currentIds =>
      currentIds.includes(productId)
        ? currentIds.filter(id => id !== productId)
        : [...currentIds, productId]
    );
  }

  function openProductOrder(productId: string) {
    router.push(`/boosterdiet/ordersection?productId=${encodeURIComponent(productId)}`);
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#138A07" />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScreenNav onBackPress={() => goBackOrReplace('/(tabs)/dashboard')} />

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
          <View style={styles.searchRow}>
            <View style={styles.searchShell}>
              <Ionicons color="#6B7280" name="search" size={24} />
              <TextInput
                onChangeText={setSearchQuery}
                placeholder="Strength Support Booster"
                placeholderTextColor="#6B7280"
                style={styles.searchInput}
                value={searchQuery}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setPrioritizeFavorites(current => !current)}
              style={[
                styles.filterButton,
                prioritizeFavorites && styles.filterButtonActive,
              ]}
            >
              <Ionicons
                color="#FFFFFF"
                name="options-outline"
                size={22}
              />
            </TouchableOpacity>
          </View>

          <ImageBackground
            imageStyle={styles.heroCardBackground}
            resizeMode="cover"
            source={storePosterBackground}
            style={styles.heroCard}
          >
            <View style={styles.heroCopy}>
              <View style={styles.heroTitleStack}>
                <Text
                  adjustsFontSizeToFit
                  minimumFontScale={0.72}
                  numberOfLines={1}
                  style={styles.heroTitleLine}
                >
                  Find Your Best
                </Text>
                <Text
                  adjustsFontSizeToFit
                  minimumFontScale={0.72}
                  numberOfLines={1}
                  style={styles.heroTitleLine}
                >
                  Solution Here
                </Text>
              </View>
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.78}
                numberOfLines={1}
                style={styles.heroDiscount}
              >
                40% Discount on all products
              </Text>
            </View>

            <View style={styles.heroArt}>
              <Image
                source={storeHeroImage}
                resizeMode="contain"
                style={styles.heroStoreImage}
              />
            </View>
          </ImageBackground>

          <View style={styles.categoryRow}>
            <CategoryPill
              active={selectedCategory === 'all'}
              label="All"
              onPress={() => setSelectedCategory('all')}
            />
            <CategoryPill
              active={selectedCategory === 'boosters'}
              label="Boosters"
              onPress={() => setSelectedCategory('boosters')}
            />
            <CategoryPill
              active={selectedCategory === 'supplements'}
              label="Supplements"
              onPress={() => setSelectedCategory('supplements')}
            />
            <CategoryPill
              active={selectedCategory === 'packages'}
              label="Packages"
              onPress={() => setSelectedCategory('packages')}
            />
          </View>

          <View>
            <View style={styles.productGrid}>
              {filteredProducts.map(product => {
                const quantity = getQuantity(product.id);

                return (
                  <ProductCard
                    key={product.id}
                    favorite={favoriteIds.includes(product.id)}
                    onBuyNow={() => openProductOrder(product.id)}
                    onOpen={() => openProductOrder(product.id)}
                    onToggleFavorite={() => toggleFavorite(product.id)}
                    product={product}
                    quantity={quantity}
                  />
                );
              })}
            </View>

            {loadingProducts ? (
              <Text style={styles.emptyText}>Loading products...</Text>
            ) : productsError ? (
              <View style={styles.emptyState}>
                <Ionicons color="#1A880E" name="cloud-offline-outline" size={28} />
                <Text style={styles.emptyTitle}>Product backend unavailable</Text>
                <Text style={styles.emptyText}>{productsError}</Text>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={loadProducts}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : filteredProducts.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons color="#1A880E" name="search" size={28} />
                <Text style={styles.emptyTitle}>No products found</Text>
                <Text style={styles.emptyText}>
                  Try a different search term or switch the category filter.
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Products</Text>
            {itemCount > 0 ? (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push('/boosterdiet/cart')}
              >
                <Text style={styles.sectionAction}>Open Cart ({itemCount})</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularRow}
          >
            {popularProducts.map(product => (
              <TouchableOpacity
                key={product.id}
                activeOpacity={0.92}
                onPress={() => openProductOrder(product.id)}
                style={styles.popularCard}
              >
                <View style={styles.popularImageWrap}>
                  <Image
                    source={product.image}
                    resizeMode="contain"
                    style={styles.popularImage}
                  />
                </View>
                <Text style={styles.popularTitle}>{product.shortTitle}</Text>
                <Text style={styles.popularPrice}>{product.priceLabel}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ScrollView>

        <BottomNav />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  headerBlock: {
    backgroundColor: '#138A07',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 16,
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
    width: 164,
    height: 72,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchShell: {
    flex: 1,
    minHeight: 56,
    borderRadius: 28,
    backgroundColor: '#F1F3F5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#111827',
    fontSize: 18,
    paddingVertical: 0,
  },
  filterButton: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: '#138A07',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#0F6E05',
  },
  heroCard: {
    marginTop: 20,
    minHeight: 208,
    aspectRatio: 1.63,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    padding: 22,
  },
  heroCardBackground: {
    borderRadius: 8,
  },
  heroCopy: {
    flex: 1,
    maxWidth: '66%',
    paddingRight: 12,
    justifyContent: 'center',
    zIndex: 2,
  },
  heroTitleStack: {
    maxWidth: 330,
  },
  heroTitleLine: {
    color: '#FFFFFF',
    fontSize: 36,
    lineHeight: 48,
    fontWeight: '800',
  },
  heroDiscount: {
    marginTop: 24,
    color: '#2FE21B',
    fontSize: 22,
    fontWeight: '500',
  },
  heroButton: {
    marginTop: 36,
    alignSelf: 'flex-start',
    minWidth: 168,
    height: 58,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroButtonText: {
    color: '#111111',
    fontSize: 22,
    fontWeight: '500',
  },
  heroArt: {
    position: 'absolute',
    top: 0,
    right: 12,
    bottom: 0,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStoreImage: {
    width: '100%',
    height: '100%',
  },
  categoryRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  categoryPill: {
    flex: 1,
    minHeight: 42,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  categoryPillActive: {
    backgroundColor: '#138A07',
    borderColor: '#138A07',
  },
  categoryPillText: {
    color: '#151515',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  productGrid: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48.3%',
    height: 408,
    marginBottom: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
  },
  productImageWrap: {
    height: 158,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '82%',
    height: '82%',
  },
  productTitle: {
    marginTop: 12,
    height: 48,
    color: '#121212',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  productCapacity: {
    marginTop: 6,
    lineHeight: 21,
    color: '#151515',
    fontSize: 16,
    fontWeight: '500',
  },
  productPrice: {
    marginTop: 10,
    lineHeight: 26,
    color: '#138A07',
    fontSize: 20,
    fontWeight: '800',
  },
  productMeta: {
    marginTop: 8,
    height: 34,
    color: '#5F6673',
    fontSize: 12,
    lineHeight: 17,
  },
  addButton: {
    marginTop: 10,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#138A07',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  emptyState: {
    marginTop: 8,
    borderRadius: 20,
    backgroundColor: '#F7FAF7',
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 10,
    color: '#1C6C18',
    fontSize: 18,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 8,
    color: '#4B5563',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 14,
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: '#138A07',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  sectionHeader: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#101010',
    fontSize: 22,
    fontWeight: '800',
  },
  sectionAction: {
    color: '#138A07',
    fontSize: 14,
    fontWeight: '700',
  },
  popularRow: {
    paddingTop: 18,
    paddingRight: 10,
  },
  popularCard: {
    width: 158,
    marginRight: 14,
  },
  popularImageWrap: {
    height: 132,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularImage: {
    width: '78%',
    height: '78%',
  },
  popularTitle: {
    marginTop: 12,
    color: '#101010',
    fontSize: 16,
    fontWeight: '700',
  },
  popularPrice: {
    marginTop: 4,
    color: '#138A07',
    fontSize: 14,
    fontWeight: '700',
  },
});
