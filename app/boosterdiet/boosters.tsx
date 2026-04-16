import { useState } from 'react';

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Image,
  type ImageSourcePropType,
  ScrollView,
  type StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  type ViewStyle,
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
import { goBackOrReplace } from '../../services/navigation';

const glutathioneBottle = require('../../assets/images/GT-500 1.png');
const boronBottle = require('../../assets/images/BR-1 1.png');

const BOOSTER_IMAGE_SCALE = 2;
const BOOSTER_STAGE_HEIGHT = 650;
const BOOSTER_SHELL_MIN_HEIGHT = 660;

type ShowcaseTab = 'boosters' | 'supplements';

type ShowcaseCard = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
};

const SHOWCASES: Record<ShowcaseTab, ShowcaseCard[]> = {
  boosters: [
    {
      id: 'powerful-boosters',
      eyebrow: 'Flexible solution\nfor all people',
      title: 'Powerful\nBoosters',
      description: 'Helping humans\nbecome happier &\nhealthier!',
    },
    {
      id: 'daily-support',
      eyebrow: 'Gentle care\nfor everyday use',
      title: 'Daily\nSupport',
      description: 'Support immunity,\nenergy and digestion\nwith one routine.',
    },
  ],
  supplements: [
    {
      id: 'essential-supplements',
      eyebrow: 'Practical choices\nfor modern routines',
      title: 'Essential\nSupplements',
      description: 'Simple daily items\nthat strengthen your\nrecovery journey.',
    },
    {
      id: 'wellness-stack',
      eyebrow: 'A complete stack\nfor stronger days',
      title: 'Wellness\nStack',
      description: 'Curated supplements\nfor calmer, stronger,\nand brighter days.',
    },
  ],
};

type LeafProps = {
  color: string;
  iconSize: number;
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  rotate: string;
  opacity: number;
};

const LEAVES: LeafProps[] = [
  { color: '#3FBF23', iconSize: 42, left: 18, top: 138, rotate: '-18deg', opacity: 0.42 },
  { color: '#7EE062', iconSize: 58, right: 18, top: 98, rotate: '24deg', opacity: 0.28 },
  { color: '#65D84D', iconSize: 36, left: 54, top: 208, rotate: '16deg', opacity: 0.24 },
  { color: '#8EF172', iconSize: 32, right: 56, top: 228, rotate: '-14deg', opacity: 0.18 },
  { color: '#1A9A1A', iconSize: 46, left: 14, top: 304, rotate: '-36deg', opacity: 0.38 },
  { color: '#8FEA76', iconSize: 34, right: 28, top: 344, rotate: '12deg', opacity: 0.32 },
  { color: '#50C93A', iconSize: 44, left: 42, top: 430, rotate: '28deg', opacity: 0.22 },
  { color: '#A3F48A', iconSize: 38, right: 18, top: 468, rotate: '-20deg', opacity: 0.2 },
  { color: '#4DC533', iconSize: 30, left: 66, top: 560, rotate: '-8deg', opacity: 0.16 },
  { color: '#75E35B', iconSize: 34, right: 62, top: 604, rotate: '18deg', opacity: 0.18 },
  { color: '#219D1C', iconSize: 40, left: 12, bottom: 304, rotate: '-24deg', opacity: 0.26 },
  { color: '#91EE79', iconSize: 48, right: 12, bottom: 286, rotate: '30deg', opacity: 0.2 },
  { color: '#2AAB21', iconSize: 40, left: 22, bottom: 176, rotate: '22deg', opacity: 0.34 },
  { color: '#6FDE58', iconSize: 52, right: 8, bottom: 194, rotate: '-28deg', opacity: 0.26 },
  { color: '#7AE45F', iconSize: 28, left: 70, bottom: 96, rotate: '10deg', opacity: 0.18 },
  { color: '#51C63A', iconSize: 36, right: 54, bottom: 82, rotate: '-16deg', opacity: 0.16 },
];

function ProductImage({
  source,
  style,
}: {
  source: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.productFigure, style]}>
      <View style={styles.productAmbientShadow} />
      <Image source={source} resizeMode="contain" style={styles.productImage} />
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
      <Ionicons name={icon} size={21} color={active ? '#168019' : '#FFFFFF'} />
      {badge ? (
        <View style={styles.dockBadge}>
          <Text style={styles.dockBadgeText}>{badge}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

export default function BoostersScreen() {
  const [selectedTab, setSelectedTab] = useState<ShowcaseTab>('boosters');
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const activeCards = SHOWCASES[selectedTab];
  const activeCard = activeCards[currentIndex % activeCards.length];
  const stageWidth = Math.min(width - 56, 340);
  const heroTopPadding = height < 760 ? 12 : 26;

  function switchTab(nextTab: ShowcaseTab) {
    setSelectedTab(nextTab);
    setCurrentIndex(0);
  }

  function showPreviousCard() {
    setCurrentIndex(current => (current - 1 + activeCards.length) % activeCards.length);
  }

  function showNextCard() {
    setCurrentIndex(current => (current + 1) % activeCards.length);
  }

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#1BC107', '#4DCC33']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {LEAVES.map((leaf, index) => (
        <Ionicons
          key={`${leaf.color}-${index}`}
          name="leaf"
          size={leaf.iconSize}
          color={leaf.color}
          style={[
            styles.leaf,
            {
              left: leaf.left,
              right: leaf.right,
              top: leaf.top,
              bottom: leaf.bottom,
              opacity: leaf.opacity,
              transform: [{ rotate: leaf.rotate }],
            },
          ]}
        />
      ))}

      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScreenNav onBackPress={() => goBackOrReplace('/advice')} />

        <ScrollView
          bounces={false}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: SCREEN_NAV_CONTENT_PADDING_TOP + heroTopPadding,
              paddingBottom: insets.bottom + 120,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.segmentRow}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => switchTab('boosters')}
              style={[
                styles.segmentButton,
                selectedTab === 'boosters' && styles.segmentButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  selectedTab === 'boosters' && styles.segmentTextActive,
                ]}
              >
                Boosters
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => switchTab('supplements')}
              style={[
                styles.segmentButton,
                selectedTab === 'supplements' && styles.segmentButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  selectedTab === 'supplements' && styles.segmentTextActive,
                ]}
              >
                Supplements
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.copyBlock}>
            <Text style={styles.eyebrow}>{activeCard.eyebrow}</Text>
            <Text style={styles.heroTitle}>{activeCard.title}</Text>
          </View>

          <View pointerEvents="box-none" style={[styles.carouselShell, { width: stageWidth }]}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={showPreviousCard}
              style={[styles.arrowButton, styles.arrowButtonLeft]}
            >
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <View pointerEvents="none" style={styles.productStage}>
              <ProductImage
                source={glutathioneBottle}
                style={styles.productImageRight}
              />
              <ProductImage
                source={boronBottle}
                style={styles.productImageLeft}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={showNextCard}
              style={[styles.arrowButton, styles.arrowButtonRight]}
            >
              <Ionicons name="chevron-forward" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View pointerEvents="none" style={styles.paginationRow}>
            {activeCards.map(card => {
              const isActive = card.id === activeCard.id;

              return (
                <View
                  key={card.id}
                  style={[styles.paginationDot, isActive && styles.paginationDotActive]}
                />
              );
            })}
          </View>

          <View style={styles.footerBlock}>
            <Text style={styles.description}>{activeCard.description}</Text>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push('/boosterdiet/store')}
              style={styles.viewItemsButton}
            >
              <Text style={styles.viewItemsText}>View Items</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#FFFFFF"
                style={styles.viewItemsIcon}
              />
            </TouchableOpacity>

            <Text style={styles.helperText}>To purchase click on view items</Text>
          </View>
        </ScrollView>

        <BottomNav />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#24B90E',
  },
  safeArea: {
    flex: 1,
  },
  leaf: {
    position: 'absolute',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0C6410',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  logo: {
    width: 164,
    height: 76,
  },
  headerSpacer: {
    width: 36,
  },
  segmentRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  segmentButton: {
    minWidth: 112,
    marginHorizontal: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(12, 122, 18, 0.38)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  segmentButtonActive: {
    backgroundColor: '#236A12',
  },
  segmentText: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  copyBlock: {
    marginTop: 34,
    alignItems: 'center',
  },
  eyebrow: {
    color: '#F3FFF1',
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'Poppins-Medium',
  },
  heroTitle: {
    marginTop: 10,
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 54,
    lineHeight: 58,
    fontWeight: '800',
  },
  carouselShell: {
    alignSelf: 'center',
    marginTop: -52,
    minHeight: BOOSTER_SHELL_MIN_HEIGHT,
    justifyContent: 'center',
    zIndex: 2,
  },
  arrowButton: {
    position: 'absolute',
    top: '49%',
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#16680B',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  arrowButtonLeft: {
    left: -8,
  },
  arrowButtonRight: {
    right: -8,
  },
  productStage: {
    height: BOOSTER_STAGE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productFigure: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 3,
  },
  productAmbientShadow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 999,
    bottom: 84,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  productImage: {
    width: '100%',
    height: '100%',
    shadowColor: '#083d08',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 10,
  },
  productImageLeft: {
    left: -95,
    bottom: 28,
    width: 180 * BOOSTER_IMAGE_SCALE,
    height: 288 * BOOSTER_IMAGE_SCALE,
    transform: [{ rotate: '-2deg' }, { translateY: -180 }],
  },
  productImageRight: {
    right: -75,
    bottom: 0,
    width: 190 * BOOSTER_IMAGE_SCALE,
    height: 316 * BOOSTER_IMAGE_SCALE,
    transform: [{ rotate: '1deg' }, { translateY: -170 }],
  },
  paginationRow: {
    marginTop: -275,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    marginHorizontal: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.35)',
    transform: [{ translateY: -40 }],
  },
  paginationDotActive: {
    width: 20,
    backgroundColor: '#FFFFFF',
  },
  footerBlock: {
    marginTop: 0,
    alignItems: 'center',
    zIndex: 8,
    elevation: 8,
  },
  description: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 28,
    fontFamily: 'Poppins-Medium',
  },
  viewItemsButton: {
    position: 'relative',
    zIndex: 9,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    height: 48,
    borderRadius: 999,
    backgroundColor: '#157E13',
    shadowColor: '#0B5B0E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 8,
  },
  viewItemsText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  viewItemsIcon: {
    marginLeft: 6,
  },
  helperText: {
    marginTop: 16,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
  },
  dockWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dock: {
    width: '88%',
    maxWidth: 340,
    minHeight: 76,
    paddingHorizontal: 18,
    borderRadius: 24,
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
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  dockBadge: {
    position: 'absolute',
    top: 8,
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
