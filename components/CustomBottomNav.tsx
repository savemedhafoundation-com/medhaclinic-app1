import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { TouchableOpacity, View } from 'react-native';

type Props = {
  active: 'home' | 'assessment' | 'healthalert' | 'profile';
  onChange: (tab: Props['active']) => void;
};

export default function BottomNav({ active, onChange }: Props) {
  return (
    <View className="absolute bottom-5 w-full items-center">
      <BlurView
        intensity={40}
        tint="dark"
        style={{
          flexDirection: 'row',
          gap: 24,
          paddingHorizontal: 26,
          paddingVertical: 14,
          borderRadius: 30,
          backgroundColor: 'rgba(0,60,120,0.35)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.15)',
        }}
      >
        <NavItem
          icon="home"
          active={active === 'home'}
          onPress={() => onChange('home')}
        />
        <NavItem
          icon="bar-chart"
          active={active === 'assessment'}
          onPress={() => onChange('assessment')}
        />
        <NavItem
          icon="document-text"
          active={active === 'healthalert'}
          onPress={() => onChange('healthalert')}
        />
        <NavItem
          icon="person"
          active={active === 'profile'}
          onPress={() => onChange('profile')}
        />
      </BlurView>
    </View>
  );
}

function NavItem({ icon, active, onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View
        className={`w-11 h-11 rounded-full items-center justify-center ${active ? 'bg-[#1DA1F2]' : ''}`}
        style={
          active
            ? {
                shadowColor: '#1DA1F2',
                shadowOpacity: 0.5,
                shadowRadius: 6,
              }
            : undefined
        }
      >
        <Ionicons
          name={icon}
          size={22}
          color={active ? '#FFFFFF' : '#CDE4FF'}
        />
      </View>
    </TouchableOpacity>
  );
}
