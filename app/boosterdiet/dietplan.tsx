import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Image,
  type ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import BottomNav from '../../components/BottomNav';
import { goBackOrReplace } from '../../services/navigation';

const medhaLogo = require('../../assets/images/medha_logo.png');
const glutathioneBottle = require('../../assets/images/GT-500 1.png');
const boronBottle = require('../../assets/images/BR-1 1.png');

type Product = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  dose: string;
  quantity: string;
  image: ImageSourcePropType;
};

const PRODUCTS: Product[] = [
  {
    id: 'detox-booster',
    title: 'Detox Booster',
    subtitle: 'Health Supplement for Adult Support to cleanse, recharge & revive health',
    description:
      "Detox Booster by Natural Immunotherapy is a scientifically balanced formula designed to cleanse, rejuvenate, and awaken the body's natural healing intelligence.",
    dose: '500mg',
    quantity: '60 capsule',
    image: glutathioneBottle,
  },
  {
    id: 'pancreas-booster',
    title: 'Pancreas Booster',
    subtitle: '60 vegetable capsules support to cleanse, recharge & revive health',
    description:
      'Pancreas Booster is a gentle daily supplement designed to support healthy pancreatic function, balanced blood sugar levels, and enhanced nutrient absorption.',
    dose: '500mg',
    quantity: '60 capsule',
    image: boronBottle,
  },
];

const LEAVES = [
  { left: -8, top: 190, size: 76, rotate: '-16deg', color: 'rgba(116, 232, 86, 0.18)' },
  { right: -12, top: 286, size: 84, rotate: '18deg', color: 'rgba(255,255,255,0.12)' },
  { left: -16, top: 586, size: 74, rotate: '-28deg', color: 'rgba(255,255,255,0.1)' },
  { right: -10, top: 840, size: 92, rotate: '24deg', color: 'rgba(110, 225, 91, 0.2)' },
];

function SelectorRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.selectorRow}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <TouchableOpacity activeOpacity={0.9} style={styles.selectorPill}>
        <Text style={styles.selectorValue}>{value}</Text>
        <Ionicons name="chevron-down" size={14} color="#E7FFE5" />
      </TouchableOpacity>
    </View>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <View style={styles.card}>
      <TouchableOpacity activeOpacity={0.9} style={styles.favoriteButton}>
        <Ionicons name="heart" size={14} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.cardTopRow}>
        <View style={styles.productImageShell}>
          <Image source={product.image} resizeMode="contain" style={styles.productImage} />
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>{product.title}</Text>
          <Text style={styles.productSubtitle}>{product.subtitle}</Text>

          <SelectorRow label="Dose" value={product.dose} />
          <SelectorRow label="Quantity" value={product.quantity} />
        </View>
      </View>

      <View style={styles.descriptionBox}>
        <Text style={styles.descriptionHeading}>Description</Text>
        <Text style={styles.descriptionText}>{product.description}</Text>
      </View>

      <TouchableOpacity activeOpacity={0.92} style={styles.orderButton}>
        <Text style={styles.orderButtonText}>Order Now</Text>
      </TouchableOpacity>
    </View>
  );
}

function DockButton({
  active = false,
  icon,
  onPress,
  badge,
}: {
  active?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  badge?: string;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.dockButton, active && styles.dockButtonActive]}
    >
      <Ionicons name={icon} size={20} color={active ? '#168019' : '#FFFFFF'} />
      {badge ? (
        <View style={styles.dockBadge}>
          <Text style={styles.dockBadgeText}>{badge}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

export default function BoosterDietScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#1FB807', '#58C93B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {LEAVES.map((leaf, index) => (
        <Ionicons
          key={`leaf-${index}`}
          name="leaf"
          size={leaf.size}
          color={leaf.color}
          style={[
            styles.backgroundLeaf,
            {
              left: leaf.left,
              right: leaf.right,
              top: leaf.top,
              transform: [{ rotate: leaf.rotate }],
            },
          ]}
        />
      ))}

      <View style={[styles.edgeShape, styles.edgeShapeLeft]} />
      <View style={[styles.edgeShape, styles.edgeShapeRight]} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          bounces={false}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: 14,
              paddingBottom: insets.bottom + 120,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => goBackOrReplace('/boosterdiet/boosters')}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={22} color="#2B8C1A" />
            </TouchableOpacity>

            <Image source={medhaLogo} resizeMode="contain" style={styles.logo} />

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.breadcrumbRow}>
            <Ionicons name="chevron-back" size={12} color="rgba(255,255,255,0.82)" />
            <Text style={styles.breadcrumbText}>Natural Supplements</Text>
          </View>

          <TouchableOpacity activeOpacity={0.9} style={styles.tagPill}>
            <Text style={styles.tagText}>Boosters</Text>
          </TouchableOpacity>

          <View style={styles.cardsColumn}>
            {PRODUCTS.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>

          <TouchableOpacity activeOpacity={0.92} style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </ScrollView>

        <BottomNav />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#22B90C',
  },
  safeArea: {
    flex: 1,
  },
  backgroundLeaf: {
    position: 'absolute',
  },
  edgeShape: {
    position: 'absolute',
    width: 84,
    height: 110,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  edgeShapeLeft: {
    left: -36,
    top: 374,
    transform: [{ rotate: '-24deg' }],
  },
  edgeShapeRight: {
    right: -30,
    top: 742,
    transform: [{ rotate: '22deg' }],
  },
  content: {
    paddingHorizontal: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0A630D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 5,
  },
  logo: {
    width: 138,
    height: 52,
  },
  headerSpacer: {
    width: 30,
  },
  breadcrumbRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbText: {
    marginLeft: 2,
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    fontWeight: '500',
  },
  tagPill: {
    marginTop: 16,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    height: 24,
    borderRadius: 999,
    backgroundColor: 'rgba(14, 117, 18, 0.85)',
    justifyContent: 'center',
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  cardsColumn: {
    marginTop: 18,
    gap: 22,
  },
  card: {
    position: 'relative',
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(18, 123, 20, 0.52)',
    shadowColor: '#0A5B0C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productImageShell: {
    width: 76,
    height: 98,
    borderRadius: 14,
    backgroundColor: '#F5FFF2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0A5B0C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  productImage: {
    width: 68,
    height: 88,
  },
  productInfo: {
    flex: 1,
    marginLeft: 14,
    paddingRight: 18,
  },
  productTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  productSubtitle: {
    marginTop: 4,
    color: 'rgba(240,255,239,0.95)',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  selectorRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorLabel: {
    color: '#E6FFE4',
    fontSize: 12,
    fontWeight: '700',
  },
  selectorPill: {
    minWidth: 122,
    height: 24,
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: '#136E12',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorValue: {
    color: '#E7FFE5',
    fontSize: 12,
    fontWeight: '600',
  },
  descriptionBox: {
    marginTop: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(9, 106, 14, 0.78)',
    padding: 10,
  },
  descriptionHeading: {
    color: '#E8FFE6',
    fontSize: 12,
    fontWeight: '700',
  },
  descriptionText: {
    marginTop: 6,
    color: 'rgba(235,255,233,0.86)',
    fontSize: 9,
    lineHeight: 14,
    fontWeight: '500',
  },
  orderButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    height: 32,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    shadowColor: '#0A5B0C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  orderButtonText: {
    color: '#1B7618',
    fontSize: 15,
    fontWeight: '700',
  },
  seeAllButton: {
    marginTop: 18,
    alignSelf: 'center',
    minWidth: 108,
    height: 30,
    borderRadius: 999,
    backgroundColor: '#18871A',
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seeAllText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dockWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dock: {
    width: '92%',
    maxWidth: 360,
    minHeight: 62,
    paddingHorizontal: 20,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#08490A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 10,
  },
  dockButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  dockBadge: {
    position: 'absolute',
    top: 7,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  dockBadgeText: {
    color: '#0E7611',
    fontSize: 9,
    fontWeight: '800',
  },
});
