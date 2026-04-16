import React from 'react';

import { LinearGradient } from 'expo-linear-gradient';
import {
  Image,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

interface Props {
  height?: number;
  logoOffsetY?: number;
  logoWidth?: number;
  logoHeight?: number;
  showLogo?: boolean;
}

function SvgHeader({
  height = 150,
  logoOffsetY = 0,
  logoWidth = 158,
  logoHeight = 84,
  showLogo = true,
}: Props) {
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.container, { width, height }]}>
      <LinearGradient
        colors={['#0D9205', '#0A8804']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.edgeGlowLeft} />
      <View style={styles.edgeGlowRight} />
      <View style={styles.bottomCurveShadow} />

      {showLogo ? (
        <View
          pointerEvents="none"
          style={[
            styles.logoWrap,
            {
              marginTop: logoOffsetY,
            },
          ]}
        >
          <Image
            source={require('../assets/images/medha_logo.png')}
            style={{ width: logoWidth, height: logoHeight }}
            resizeMode="contain"
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: '#0B8E05',
    shadowColor: '#052f03',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
  },
  logoWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  edgeGlowLeft: {
    position: 'absolute',
    left: -24,
    top: 0,
    bottom: 0,
    width: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 999,
    transform: [{ rotate: '-10deg' }],
  },
  edgeGlowRight: {
    position: 'absolute',
    right: -24,
    top: 0,
    bottom: 0,
    width: 70,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 999,
    transform: [{ rotate: '10deg' }],
  },
  bottomCurveShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 18,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
});

export default SvgHeader;
