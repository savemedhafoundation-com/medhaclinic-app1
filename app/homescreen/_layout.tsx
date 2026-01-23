import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';

export default function TabLayout() {
  return (
        <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="assessment" />
      <Tabs.Screen name="information" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
function CustomTabBar({ state, navigation }: any) {
  return (
    <LinearGradient
      colors={['#0d5fb8', '#083a7a']}
      style={{
        position: 'absolute',
        bottom: 58,
        left: 16,
        right: 16,
        height: 62,
        borderRadius: 36,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
      }}
    >
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;

        const icons: any = {
          dashboard: 'home',
          assessment: 'stats-chart',
          information: 'information',
          profile: 'person',
        };

        const onPress = () => {
          navigation.navigate(route.name);
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.8}
            className="flex-1 items-center"
          >
            {isFocused ? (
              <View className="w-11 h-11 rounded-[27px] items-center justify-center bg-[#1fa2ff]">
                <Ionicons
                  name={icons[route.name]}
                  size={20}
                  color="#fff"
                />
              </View>
            ) :
            
<View className="w-10 h-10 rounded-full items-center justify-center bg-[rgba(255,255,255,0.12)]">
  <Ionicons
    name={icons[route.name]}
    size={22}
    color="#ffffff"
  />
</View>
            
            }
          </TouchableOpacity>
        );
      })}
    </LinearGradient>
  );
}
