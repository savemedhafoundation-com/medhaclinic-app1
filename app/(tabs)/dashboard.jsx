import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../../components/BottomNav';
import { useRouter } from 'expo-router';

import {
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// 🔹 ASSETS
import bg from '../../assets/images/common_bgpage.png';
import logo from '../../assets/images/medha_logo.png';

export default function InformationScreen() {
  const router = useRouter();

  return (
  <SafeAreaView style={styles.safe}>
  <ImageBackground
    source={bg}
    style={styles.background}
    resizeMode="cover"
  >

    {/* ================= MAIN CONTENT ================= */}
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >

      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <View style={styles.logoCenter}>
          <Image
            source={logo}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* ================= TITLE ================= */}
      <Text style={styles.title}>
        Welcome to{'\n'}Medha Clinic
      </Text>

      <Text style={styles.subtitle}>
        We are here to understand your body and guide recovery naturally.
      </Text>

      <Text style={styles.question}>
        What would you like to do today?
      </Text>

      {/* ================= ACTION CARDS ================= */}
      
      <ActionCard
        icon="stats-chart-outline"
        title="Start Health Assessment"
        subtitle="Tell us about your body, lifestyle, and how you're feeling."
         onPress={() => router.push('/homescreen/basicscreens')}
        
      />

      <ActionCard
        icon="cloud-upload-outline"
        title="Upload Medical Reports"
        subtitle="PDF, Image, or Photo. You may continue without reports."
      />

      <ActionCard
        icon="leaf-outline"
        title="I Want to Understand Natural Immunotherapy"
        subtitle="Learn how healing through natural immunity works."
      />

      {/* ================= HOW HELPS ================= */}
      <Text style={styles.sectionTitle}>How Medha Clinic Helps :</Text>

      <View style={styles.helpRow}>
        <HelpCard
          icon="pulse-outline"
          title="Understand What’s Happening Inside Your Body"
        />
        <HelpCard
          icon="nutrition-outline"
          title="Personalized Diet & Nutrition Guidance"
        />
      </View>

      {/* ================= DISCLAIMER ================= */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerTitle}>
          What This App Does NOT Do
        </Text>

        <View style={styles.disclaimerRow}>
          <DisclaimerItem text="Replace emergency treatment" />
          <DisclaimerItem text="Promise instant cure" />
        </View>

        <View style={styles.disclaimerRow}>
          <DisclaimerItem text="Use fear-based language" />
          <DisclaimerItem text="Fake promises" />
        </View>
      </View>

      {/* ================= START BUTTON ================= */}
      <View style={styles.startSection}>
        <Text style={styles.footerText}>
          Begin by telling us about your body.
        </Text>

        <TouchableOpacity style={styles.startButton} activeOpacity={0.85}>
          <Text style={styles.startText}>Start</Text>
          <Ionicons
            name="arrow-forward-outline"
            size={22}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      {/* 🔴 IMPORTANT SPACE so BottomNav doesn't overlap */}
      <View style={{ height: 120 }} />

    </ScrollView>

    {/* ================= BOTTOM NAV ================= */}
    <BottomNav />

  </ImageBackground>
</SafeAreaView>
  );
}

/* ================= SUB COMPONENTS ================= */

function ActionCard({ icon, title, subtitle,onPress }: any) {
  return (
    <TouchableOpacity style={styles.actionCard} activeOpacity={0.9} onPress={onPress}>
      <Ionicons name={icon} size={26} color="#FFFFFF" />
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward-outline" size={22} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

function HelpCard({ icon, title }: any) {
  return (
    <View style={styles.helpCard}>
      <Ionicons name={icon} size={28} color="#FFFFFF" />
      <Text style={styles.helpText}>{title}</Text>
    </View>      
  );
}

function DisclaimerItem({ text }: any) {
  return (
    <View style={styles.disclaimerItemRow}>
      <Ionicons name="close-circle" size={16} color="#FF5252" />
      <Text style={styles.disclaimerItemText}>{text}</Text>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0B3A6E',
  },

  background: {
    flex: 1,
  
  },

logoCenter: {
  position: 'absolute',
  left: 0,
  right: 0,
  alignItems: 'center',
},
  container: {
    padding: 20,
    paddingBottom: 60, // ensures Start button scrolls fully
  },
logoBlock: {
  alignItems: 'center',
},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 76,
    marginTop:70
  },

  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

 logo: {
  width: 254,      // ✅ Bigger logo
  height: 254,
},



  tagline: {
    color: '#CDE7FF',
    fontSize: 12,
  },

  title: {
    fontSize: 30,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 12,
  },

  subtitle: {
    color: '#E0F2FE',
    fontSize: 14,
    marginBottom: 18,
  },

  question: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },

  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E88E5',
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
  },

  actionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  actionSubtitle: {
    color: '#D0E8FF',
    fontSize: 12,
    marginTop: 4,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 18,
  },

  helpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  helpCard: {
    backgroundColor: '#1976D2',
    borderRadius: 20,
    padding: 16,
    width: '48%',
  },

  helpText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
    marginTop: 8,
  },

  disclaimer: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 18,
    padding: 16,
    marginTop: 22,
  },

  disclaimerTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 12,
  },

  disclaimerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  disclaimerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 18,
  },

  disclaimerItemText: {
    color: '#E5F0FF',
    fontSize: 12,
    marginLeft: 6,
  },

  startSection: {
    marginTop: 30,
    alignItems: 'center',
  },

  footerText: {
    textAlign: 'center',
    color: '#E0F2FE',
  },

  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#29B6F6', // sky blue
    paddingHorizontal: 42,
    paddingVertical: 14,
    borderRadius: 30,
    marginTop: 14,
    shadowColor: '#29B6F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
wrapper: {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 116,        // 👈 FIXED, NOT dynamic
  alignItems: 'center',
},
  startText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 6,
  },
});
