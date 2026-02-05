import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { icon: 'home', route: '/(tabs)/dashboard' },
    { icon: 'stats-chart', route: '/stats' },
    { icon: 'information-circle', route: '/info' },
    { icon: 'person', route: '/profile' },
  ];

  return (
    <View className="absolute bottom-[70px] w-full items-center z-20">
      {/* 🌿 Extra Rounded Gradient Container */}
      <LinearGradient
        colors={['#16a34a', '#22c55e', '#4ade80']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          width: '92%',
          paddingVertical: 16,
          paddingHorizontal: 26,
          borderRadius: 999,          // 🔥 fully pill-shaped
          flexDirection: 'row',
          justifyContent: 'space-between',
          elevation: 12,
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
        }}
      >
        {tabs.map(tab => {
          const isActive = pathname === tab.route;

          return (
            <TouchableOpacity
              key={tab.route}
              onPress={() => router.replace(tab.route)}
              activeOpacity={0.85}
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,      // 🔥 round icon buttons
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isActive
                  ? 'rgba(255,255,255,0.25)'
                  : 'transparent',
              }}
            >
              <Ionicons
                name={tab.icon as any}
                size={24}
                color="#ffffff"
              />
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </View>
  );
}
