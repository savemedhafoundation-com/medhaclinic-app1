import { LinearGradient } from 'expo-linear-gradient';
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

import { Ionicons } from '@expo/vector-icons';

import BottomNav from '../../components/BottomNav';
import { goBackOrReplace } from '../../services/navigation';

const glutathioneBottle = require('../../assets/images/GT-500 1.png');
const boronBottle = require('../../assets/images/BR-1 1.png');

const STORE_ITEMS = [
  {
    id: 'gt-500',
    title: 'GT-500 Booster',
    subtitle: 'Daily antioxidant support',
    description: 'A focused booster option for immunity, recovery, and overall wellness support.',
    image: glutathioneBottle,
  },
  {
    id: 'br-1',
    title: 'BR-1 Supplement',
    subtitle: 'Mineral balance support',
    description: 'A supportive supplement to help complete your guided booster routine.',
    image: boronBottle,
  },
];

export default function BoosterStoreScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#E8F9E4', '#C7F0BE', '#F7FFF3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 120 },
          ]}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => goBackOrReplace('/boosterdiet/boosters')}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={22} color="#157312" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Booster Store</Text>

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>Shop your recommended support</Text>
            <Text style={styles.heroTitle}>Choose the boosters that match your care plan</Text>
            <Text style={styles.heroDescription}>
              Browse the current booster collection and continue your recovery with the right
              support items.
            </Text>
          </View>

          {STORE_ITEMS.map(item => (
            <View key={item.id} style={styles.productCard}>
              <View style={styles.imageWrap}>
                <Image source={item.image} resizeMode="contain" style={styles.productImage} />
              </View>

              <Text style={styles.productTitle}>{item.title}</Text>
              <Text style={styles.productSubtitle}>{item.subtitle}</Text>
              <Text style={styles.productDescription}>{item.description}</Text>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push('/advice')}
                style={styles.productButton}
              >
                <Text style={styles.productButtonText}>Talk to Support</Text>
                <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <BottomNav />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EFFBEA',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0E6B13',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 4,
  },
  headerTitle: {
    color: '#155F18',
    fontSize: 22,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 38,
  },
  heroCard: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderRadius: 28,
    backgroundColor: '#1BA91D',
    shadowColor: '#0C6B0E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },
  heroDescription: {
    marginTop: 12,
    color: 'rgba(255,255,255,0.92)',
    fontSize: 15,
    lineHeight: 23,
  },
  productCard: {
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0D6812',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  imageWrap: {
    height: 220,
    borderRadius: 22,
    backgroundColor: '#F4FFF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '78%',
    height: '78%',
  },
  productTitle: {
    marginTop: 16,
    color: '#174E1B',
    fontSize: 22,
    fontWeight: '800',
  },
  productSubtitle: {
    marginTop: 6,
    color: '#259429',
    fontSize: 15,
    fontWeight: '700',
  },
  productDescription: {
    marginTop: 10,
    color: '#516255',
    fontSize: 15,
    lineHeight: 23,
  },
  productButton: {
    marginTop: 18,
    height: 46,
    borderRadius: 999,
    backgroundColor: '#17811B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 4,
  },
});
