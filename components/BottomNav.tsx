import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { icon: 'home', route: '/testscreennav' },
    { icon: 'stats-chart', route: '/stats' },
    { icon: 'information-circle', route: '/info' },
    { icon: 'person', route: '/profile' },
  ];

  return (
    <View className="absolute bottom-[70px] w-full items-center">
      <View
        className="flex-row justify-between w-[90%] bg-[rgba(20,40,90,0.85)] py-[14px] px-[22px] rounded-[40px]"
        style={{ elevation: 8 }}
      >
        {tabs.map(tab => {
          const isActive = pathname === tab.route;

          return (
            <TouchableOpacity
              key={tab.route}
              className={`w-11 h-11 rounded-full items-center justify-center ${isActive ? 'bg-[#0EA5E9]' : ''}`}
              onPress={() => router.replace(tab.route)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={tab.icon as any}
                size={22}
                color={isActive ? '#fff' : '#A0AEC0'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

