import React, { type ReactNode } from 'react';

import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SvgHeader from './Clipperbg';
import HeaderBackButton from './HeaderBackButton';

const SCREEN_NAV_BASE_HEIGHT = 150;
const SCREEN_NAV_BASE_CONTENT_PADDING_TOP = 200;
const SCREEN_NAV_BASE_LOGO_WIDTH = 158;
const SCREEN_NAV_BASE_LOGO_HEIGHT = 84;
const SCREEN_NAV_HEIGHT_SCALE = 0.7;

export const SCREEN_NAV_HEIGHT = Math.round(
  SCREEN_NAV_BASE_HEIGHT * SCREEN_NAV_HEIGHT_SCALE
);
export const SCREEN_NAV_CONTENT_PADDING_TOP = Math.round(
  SCREEN_NAV_BASE_CONTENT_PADDING_TOP * SCREEN_NAV_HEIGHT_SCALE
);
const SCREEN_NAV_LOGO_WIDTH = Math.round(
  SCREEN_NAV_BASE_LOGO_WIDTH * SCREEN_NAV_HEIGHT_SCALE
);
const SCREEN_NAV_LOGO_HEIGHT = Math.round(
  SCREEN_NAV_BASE_LOGO_HEIGHT * SCREEN_NAV_HEIGHT_SCALE
);

type ScreenNavProps = {
  onBackPress?: () => void;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
  subtitle?: string;
  title?: string;
};

export default function ScreenNav({
  onBackPress,
  right,
  style,
  subtitle,
  title,
}: ScreenNavProps) {
  const hasTitle = Boolean(title || subtitle);

  return (
    <View style={[styles.wrapper, style]}>
      <SvgHeader
        height={SCREEN_NAV_HEIGHT}
        logoHeight={SCREEN_NAV_LOGO_HEIGHT}
        logoWidth={SCREEN_NAV_LOGO_WIDTH}
        showLogo={!hasTitle}
      />

      <SafeAreaView pointerEvents="box-none" style={styles.safeArea}>
        <View style={styles.controlsRow}>
          {onBackPress ? (
            <HeaderBackButton onPress={onBackPress} />
          ) : (
            <View style={styles.sideSlot} />
          )}

          {hasTitle ? (
            <View style={styles.titleBlock}>
              {title ? (
                <Text
                  adjustsFontSizeToFit
                  minimumFontScale={0.78}
                  numberOfLines={1}
                  style={styles.title}
                >
                  {title}
                </Text>
              ) : null}
              {subtitle ? (
                <Text
                  adjustsFontSizeToFit
                  minimumFontScale={0.78}
                  numberOfLines={1}
                  style={styles.subtitle}
                >
                  {subtitle}
                </Text>
              ) : null}
            </View>
          ) : (
            <View style={styles.titleBlock} />
          )}

          {right ?? <View style={styles.sideSlot} />}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_NAV_HEIGHT,
    zIndex: 10,
  },
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  controlsRow: {
    minHeight: 48,
    marginTop: 0,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideSlot: {
    width: 38,
    height: 38,
  },
  titleBlock: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
