import { Ionicons } from '@expo/vector-icons';
import {
  type Href,
  usePathname,
  useRouter,
} from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCart } from '../providers/CartProvider';

type IconName = keyof typeof Ionicons.glyphMap;

type NavItem = {
  key: 'dashboard' | 'healthalert' | 'cart' | 'store' | 'profile';
  icon: IconName;
  route: Href;
};

export const BOTTOM_NAV_HEIGHT = 82;
export const BOTTOM_NAV_BOTTOM_OFFSET = 14;
const BOTTOM_NAV_BUTTON_SIZE = 54;

function getActiveTab(pathname: string) {
  if (pathname.includes('/boosterdiet/cart')) return 'cart';
  if (pathname.includes('/boosterdiet/checkout')) return 'cart';
  if (pathname.includes('/boosterdiet/confirmation')) return 'cart';
  if (pathname.includes('/boosterdiet/ordersection')) return 'store';
  if (pathname.includes('/boosterdiet/store')) return 'store';
  if (pathname.includes('/healthalert')) return 'healthalert';
  if (pathname.includes('/privacy-policy')) return 'profile';
  if (pathname.includes('/profile')) return 'profile';
  return 'dashboard';
}

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { itemCount } = useCart();
  const activeTab = getActiveTab(pathname);

  const tabs: NavItem[] = [
    { key: 'dashboard', icon: 'home', route: '/(tabs)/dashboard' },
    { key: 'healthalert', icon: 'stats-chart', route: '/(tabs)/healthalert' },
    { key: 'store', icon: 'bag-handle', route: '/boosterdiet/store' },
    { key: 'profile', icon: 'person', route: '/(tabs)/profile' },
  ];

  if (itemCount > 0) {
    tabs.splice(2, 0, {
      key: 'cart',
      icon: 'cart',
      route: '/boosterdiet/cart',
    });
  }

  return (
    <View
      style={[styles.wrapper, { bottom: insets.bottom + BOTTOM_NAV_BOTTOM_OFFSET }]}
    >
      <LinearGradient
        colors={['#0C8B18', '#137E15']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.shell}
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;

          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.9}
              onPress={() => router.replace(tab.route)}
              style={[styles.tabButton, isActive && styles.activeTabButton]}
            >
              <Ionicons
                name={tab.icon}
                size={isActive ? 27 : 24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  shell: {
    width: '90%',
    maxWidth: 420,
    height: BOTTOM_NAV_HEIGHT,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0A530D',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 20,
    elevation: 12,
  },
  tabButton: {
    width: BOTTOM_NAV_BUTTON_SIZE,
    height: BOTTOM_NAV_BUTTON_SIZE,
    borderRadius: BOTTOM_NAV_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: '#20BC09',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    shadowColor: '#042D06',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 6,
  },
});
