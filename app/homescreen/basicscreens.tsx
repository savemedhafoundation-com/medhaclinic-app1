//updated

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import bg from '../../assets/images/headerbar.png';
// import logo from '../../assets/images/medha_logo.png';

export default function BasicDetailsScreen() {
  return (
        <View style={styles.root}>
             <View style={styles.appBarContainer}>
        <ImageBackground
          source={bg}
          style={styles.appBar}
          imageStyle={styles.appBarImage}
          resizeMode="cover"
        >
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.back}>←</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>

{/* <ImageBackground
  source={bg}
  style={styles.appBar}
  imageStyle={styles.appBarImage}
      resizeMode="cover"   // 🔥 NOT contain
  // 🔥 IMPORTANT
>
  <SafeAreaView edges={[]}>
    <View style={styles.headerRow}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <View style={{ width: 24 }} />
    </View>
  </SafeAreaView>
</ImageBackground> */}
     
   <View style={styles.scrollContainer}>
     <ScrollView contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
     
     >
          {/* <Image source={logo} style={styles.logo} resizeMode="contain" /> */}

          <Text style={styles.heading}>Let’s Get started</Text>
          <Text style={styles.subheading}>
            Please tell us a bit about yourself so we can guide your health journey.
          </Text>

          <Text style={styles.step}>Step 1 of 2</Text>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>

          {/* Cards */}
                    <InfoCard icon="person" title="Basic Details" desc="Know your Health abilities"
                      route="/healthassessment"

                    />


       <InfoCard
  icon="restaurant"
  title="Diet & Lifestyle"
  desc="Eating habits & daily activity"
  route="/dietscreen"
/>

<InfoCard
  icon="nutrition"
  title="Your Food Preferences"
  desc="Vegetarian, non-vegetarian or mixed"
  route="/healthassessment/food-preferences"
/>

<InfoCard
  icon="medkit"
  title="Medical History"
  desc="Existing medical conditions"
  route="/healthassessment/medical-history"
/>

{/* <InfoCard
  icon="accessibility"
  title="Current Symptoms"
  desc="Symptoms you are facing now"
  route="/healthassessment/current-symptoms"
/> */}

          <Text style={styles.note}>
            All fields are optional, but more information means better care for you.
            Your details will remain confidential.
          </Text>

          <TouchableOpacity>
            <Text style={styles.skip}>Skip for now</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cta}>
            <Text style={styles.ctaText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>


    
  );
}

function InfoCard({ icon, title, desc, route }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={() => router.push(route)}
    >
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={22} color="#0b4ea2" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{desc}</Text>
      </View>

      <View style={styles.knowMore}>
        <Text style={styles.knowText}>Know More</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 2 },
  overlay: { flex: 1 },
  container: { padding:30, paddingBottom: 170 },

  logo: { width: 220, height: 80, alignSelf: 'center', marginBottom: 20 },
 header: {
    height: 150,
    justifyContent: 'flex-end',
  },

  headerImage: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  headerRow: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingBottom: 20,
  justifyContent: 'space-between',
  },
  heading: { fontSize: 32, fontWeight: '700', color: '#0b4ea2', marginTop: 16,},
  subheading: { fontSize: 16, color: '#1f3c66', marginTop: 14, marginBottom: 20 },

  step: { fontSize: 14, color: '#0b4ea2', marginBottom: 6 },
  progressBar: { height: 6, backgroundColor: '#d6e6ff', borderRadius: 3, marginBottom: 24 },
  progressFill: { width: '50%', height: 6, backgroundColor: '#0b4ea2', borderRadius: 3 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0b4ea2',
    borderRadius: 26,
    padding: 16,
    marginBottom: 14,
  },

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cardDesc: { color: '#d6ecff', fontSize: 13, marginTop: 4 },

appBar: {
  width: '100%',
  height: 220,              // 🔥 slightly taller
  justifyContent: 'flex-end',
},

  // appBarImage: {
  //   borderBottomLeftRadius: 28,
  //   borderBottomRightRadius: 28,
  // },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',

    justifyContent: 'space-between',
  },
  knowMore: {
    backgroundColor: '#1fa2ff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    marginLeft: 10,
  },
  knowText: { color: '#fff', fontSize: 12 },

  note: { textAlign: 'center', fontSize: 13, color: '#1f3c66', marginTop: 20 },
  skip: { textAlign: 'center', color: '#0b4ea2', marginTop: 8 },
root: {
  flex: 1,
  backgroundColor: '#f5f6f8',
},

appBarContainer: {
  height: 220,   // fixed header height
},

scrollContainer: {
  flex: 1,       // 🔥 REQUIRED for scrolling
},
  cta: {
    marginTop: 20,
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: '#1fa2ff',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
