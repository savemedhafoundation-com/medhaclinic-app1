import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type IconName = keyof typeof Ionicons.glyphMap;

type NavItem = {
  key: 'dashboard' | 'healthalert' | 'cart' | 'profile';
  icon: IconName;
  route?: '/(tabs)/dashboard' | '/(tabs)/healthalert' | '/(tabs)/profile';
  badge?: string;
};

function getActiveTab(pathname: string) {
  if (pathname.startsWith('/(tabs)/healthalert')) return 'healthalert';
  if (pathname.startsWith('/(tabs)/profile')) return 'profile';
  return 'dashboard';
}

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const activeTab = getActiveTab(pathname);

  const tabs: NavItem[] = [
    { key: 'dashboard', icon: 'home', route: '/(tabs)/dashboard' },
    { key: 'healthalert', icon: 'bar-chart', route: '/(tabs)/healthalert' },
    { key: 'cart', icon: 'cart', badge: '2' },
    { key: 'profile', icon: 'person', route: '/(tabs)/profile' },
  ];

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom + 14 }]}>
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
              onPress={tab.route ? () => router.replace(tab.route) : undefined}
              style={[styles.tabButton, isActive && styles.activeTabButton]}
            >
              <Ionicons name={tab.icon} size={21} color={isActive ? '#168019' : '#FFFFFF'} />
              {tab.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              ) : null}
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
  tabButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
  },
  badge: {
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
  badgeText: {
    color: '#0E7611',
    fontSize: 9,
    fontWeight: '800',
  },
});
