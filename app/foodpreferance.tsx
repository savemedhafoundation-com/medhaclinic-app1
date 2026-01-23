import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import BottomNav from '../components/BottomNav';

import {
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import bg from '../assets/images/headerbar.png';

const veg = require('../assets/images/veg.png');
const nonveg = require('../assets/images/nonveg.png');
const vegan = require('../assets/images/vegan.png');
const mixed = require('../assets/images/mixed_diet.png');

export default function FoodPreferencesScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const [other, setOther] = useState('');
  return(
      <View className="flex-1 bg-[#f5f6f8]">
    
          {/* APP BAR */}
          <ImageBackground
            source={bg}
            className="w-full h-[220px]"
            resizeMode="stretch"
          >
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 16 }}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={26} color="#fff" />
              </TouchableOpacity>
            </SafeAreaView>
          </ImageBackground>
    
          {/* SCROLLABLE CONTENT */}
    //         <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
            showsVerticalScrollIndicator={false}
          >
            {/* HEADER */}
            <View className="flex-row items-center gap-[22px]">
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={26} color="#fff" />
              </TouchableOpacity>
                    </View>

            <Text className="text-[28px] font-bold text-[#0b4ea2] mt-4">Your Food Preferences</Text>
            <Text className="text-[16px] text-[#1f3c66] mb-5">
              Please tell us about your dietary preferences
            </Text>

            <Text className="text-[18px] font-bold text-[#0b4ea2] mb-3">Your Food Preferences</Text>

            <FoodCard
              image={veg}
              title="Vegetarian"
              desc="I do not eat meat, but consume dairy, eggs, or both"
              active={selected === 'vegetarian'}
              onPress={() => setSelected('vegetarian')}
            />

            <FoodCard
              image={nonveg}
              title="Non-vegetarian"
              desc="I eat meat, poultry or fish"
              active={selected === 'nonveg'}
              onPress={() => setSelected('nonveg')}
            />

            <FoodCard
              image={vegan}
              title="Vegan"
              desc="I do not eat meat, dairy or eggs"
              active={selected === 'vegan'}
              onPress={() => setSelected('vegan')}
            />

            <FoodCard
              image={mixed}
              title="Mixed Diet"
              desc="Sometimes vegetarian, sometimes meat"
              active={selected === 'mixed'}
              onPress={() => setSelected('mixed')}
            />

            {/* OPTIONAL INPUT */}
            <TextInput
              className="bg-white rounded-[24px] px-[18px] py-3.5 mt-2.5 text-[14px]"
              placeholder="Any other dietary preferences? (Optional)"
              placeholderTextColor="#7a8fb3"
              value={other}
              onChangeText={setOther}
            />

            {/* CTA */}
            <TouchableOpacity
              className="flex-row items-center justify-center bg-[#1fa2ff] py-3.5 rounded-[30px] gap-1.5 mt-5"
              onPress={() => router.push('/assessment/next-step')}
            >
              <Text className="text-white text-[16px] font-semibold">Next</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>

            <Text className="text-center text-[12px] text-[#1f3c66] mt-3">
              Your body's needs are unique. This helps us know you better.
            </Text>
          </ScrollView>
          
            <BottomNav />

        </View>       
  )

  // return (
  //   <ImageBackground source={bg} className="flex-1" resizeMode="none">
  //     {/* <LinearGradient
  //       colors={['rgba(0,120,255,155)', 'rgba(255,225,255,50)']}
  //       style={{ flex: 1 }}
  //     > */}
  //       <SafeAreaView style={{ flex: 1 }}>
  //         <ScrollView
  //           contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
  //           showsVerticalScrollIndicator={false}
  //         >
  //           {/* HEADER */}
  //           <View className="flex-row items-center gap-[22px]">
  //             <TouchableOpacity onPress={() => router.back()}>
  //               <Ionicons name="chevron-back" size={26} color="#fff" />
  //             </TouchableOpacity>
  //                   </View>

  //           <Text className="text-[28px] font-bold text-[#0b4ea2] mt-4">Your Food Preferences</Text>
  //           <Text className="text-[16px] text-[#1f3c66] mb-5">
  //             Please tell us about your dietary preferences
  //           </Text>

  //           <Text className="text-[18px] font-bold text-[#0b4ea2] mb-3">Your Food Preferences</Text>

  //           <FoodCard
  //             image={veg}
  //             title="Vegetarian"
  //             desc="I do not eat meat, but consume dairy, eggs, or both"
  //             active={selected === 'vegetarian'}
  //             onPress={() => setSelected('vegetarian')}
  //           />

  //           <FoodCard
  //             image={nonveg}
  //             title="Non-vegetarian"
  //             desc="I eat meat, poultry or fish"
  //             active={selected === 'nonveg'}
  //             onPress={() => setSelected('nonveg')}
  //           />

  //           <FoodCard
  //             image={vegan}
  //             title="Vegan"
  //             desc="I do not eat meat, dairy or eggs"
  //             active={selected === 'vegan'}
  //             onPress={() => setSelected('vegan')}
  //           />

  //           <FoodCard
  //             image={mixed}
  //             title="Mixed Diet"
  //             desc="Sometimes vegetarian, sometimes meat"
  //             active={selected === 'mixed'}
  //             onPress={() => setSelected('mixed')}
  //           />

  //           {/* OPTIONAL INPUT */}
  //           <TextInput
  //             className="bg-white rounded-[24px] px-[18px] py-3.5 mt-2.5 text-[14px]"
  //             placeholder="Any other dietary preferences? (Optional)"
  //             placeholderTextColor="#7a8fb3"
  //             value={other}
  //             onChangeText={setOther}
  //           />

  //           {/* CTA */}
  //           <TouchableOpacity
  //             className="flex-row items-center justify-center bg-[#1fa2ff] py-3.5 rounded-[30px] gap-1.5 mt-5"
  //             onPress={() => router.push('/assessment/next-step')}
  //           >
  //             <Text className="text-white text-[16px] font-semibold">Next</Text>
  //             <Ionicons name="arrow-forward" size={18} color="#fff" />
  //           </TouchableOpacity>

  //           <Text className="text-center text-[12px] text-[#1f3c66] mt-3">
  //             Your body's needs are unique. This helps us know you better.
  //           </Text>
  //         </ScrollView>
  //       </SafeAreaView>
  //     {/* </LinearGradient> */}
  //   </ImageBackground>
  // );
}

/* ---------- FOOD CARD ---------- */

function FoodCard({
  image,
  title,
  desc,
  active,
  onPress,
}: {
  image: any;
  title: string;
  desc: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className={`flex-row bg-[#cfe9ff] rounded-[20px] p-3 mb-3.5 gap-3 ${active ? 'border-2 border-[#1fa2ff]' : ''}`}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Image source={image} className="w-[90px] h-[90px] rounded-[14px]" />
      <View style={{ flex: 1 }}>
        <Text className="text-[16px] font-bold text-[#0b4ea2]">{title}</Text>
        <Text className="text-[13px] text-[#1f3c66] mt-1">{desc}</Text>
        <TouchableOpacity className="mt-2 self-start bg-[#1fa2ff] px-3.5 py-1.5 rounded-[14px]">
          <Text className="text-white text-[12px] font-semibold">Know More</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}



