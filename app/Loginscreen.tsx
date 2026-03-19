import {
  useEffect,
  useRef,
  useState,
} from 'react';

import { LinearGradient } from 'expo-linear-gradient';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import patternImage from '../assets/images/bg_pattern.png';
import backgroundImage from '../assets/images/common_bgpage.png';
import googleIcon from '../assets/images/google.png';
import medhaLogo from '../assets/images/medha_logo.png';
import { useAuth } from '../providers/AuthProvider';

const COLORS = {
  backgroundTop: '#2CC700',
  backgroundBottom: '#0A6800',
  card: 'rgba(8, 78, 0, 0.38)',
  cardBorder: 'rgba(255,255,255,0.5)',
  primary: '#159D00',
  primaryPressed: '#118500',
  white: '#FFFFFF',
  muted: '#E8F9E2',
  inputText: '#777777',
};

// Base design width — all fixed values are authored at this width
const BASE_W = 390;
const BASE_H = 844;
const OTP_LENGTH = 6;
const RESEND_INTERVAL_SECONDS = 60;

function s(size: number, w: number) {
  const factor = Math.min(Math.max(w / BASE_W, 0.72), 1.25);
  return Math.round(size * factor);
}

function sv(size: number, h: number) {
  const factor = Math.min(Math.max(h / BASE_H, 0.75), 1.2);
  return Math.round(size * factor);
}

function getPhoneButtonLabel(
  phoneVerificationPending: boolean,
  phoneBusy: boolean
) {
  if (phoneBusy) {
    return phoneVerificationPending ? 'Verifying OTP...' : 'Sending OTP...';
  }

  return phoneVerificationPending ? 'Verify OTP' : 'Continue with number';
}

function normalizePhoneInput(value: string) {
  const digits = value.replace(/\D/g, '');

  if (digits.length > 10 && digits.startsWith('91')) {
    return digits.slice(2, 12);
  }

  return digits.slice(0, 10);
}

function normalizeOtpInput(value: string) {
  return value.replace(/\D/g, '').slice(0, OTP_LENGTH);
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export default function LoginScreen() {
  const {
    confirmPhoneVerificationCode,
    phoneVerificationPending,
    resetPhoneVerification,
    sendPhoneVerificationCode,
    signInWithGoogle,
    signingIn,
  } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneBusy, setPhoneBusy] = useState(false);
  const phoneInputRef = useRef<TextInput>(null);
  const wasVerificationPendingRef = useRef(false);

  const { width, height } = useWindowDimensions();
  const styles = makeStyles(width, height);
  const cardWidth = Math.min(width - s(48, width), 440);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (phoneVerificationPending) {
      phoneInputRef.current?.focus();
    } else {
      setResendCountdown(0);

      if (wasVerificationPendingRef.current) {
        setVerificationCode('');
        phoneInputRef.current?.focus();
      }
    }

    wasVerificationPendingRef.current = phoneVerificationPending;
  }, [phoneVerificationPending]);

  useEffect(() => {
    if (!phoneVerificationPending || resendCountdown <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setResendCountdown(currentValue => currentValue - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [phoneVerificationPending, resendCountdown]);

  async function handleGoogleSignIn() {
    try {
      await signInWithGoogle();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to continue with Google.';

      if (message === 'Google sign-in was cancelled.') {
        return;
      }

      Alert.alert('Google Sign-In', message);
    }
  }

  async function requestOtp(isResend = false) {
    try {
      setPhoneBusy(true);
      setVerificationCode('');
      await sendPhoneVerificationCode(phoneNumber);
      setResendCountdown(RESEND_INTERVAL_SECONDS);
      Alert.alert(
        isResend ? 'OTP Resent' : 'OTP Sent',
        `We sent a verification code to +91 ${phoneNumber}.`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to send OTP right now.';
      Alert.alert('Phone Sign-In', message);
    } finally {
      setPhoneBusy(false);
    }
  }

  async function handleSendOtp() {
    await requestOtp();
  }

  async function handleVerifyOtp() {
    try {
      setPhoneBusy(true);
      await confirmPhoneVerificationCode(verificationCode);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to verify OTP right now.';
      Alert.alert('Phone Sign-In', message);
    } finally {
      setPhoneBusy(false);
    }
  }

  function handleForgotPassword() {
    Alert.alert(
      'Password Login Unavailable',
      'Use your phone number or Google to continue. This screen does not use passwords.'
    );
  }

  function handleUseDifferentNumber() {
    resetPhoneVerification();
    setVerificationCode('');
    phoneInputRef.current?.focus();
  }

  function handleSignUp() {
    if (phoneVerificationPending) {
      handleUseDifferentNumber();
      return;
    }

    phoneInputRef.current?.focus();
  }

  function handlePhoneInputChange(value: string) {
    setPhoneNumber(normalizePhoneInput(value));
  }

  function handleOtpInputChange(value: string) {
    setVerificationCode(normalizeOtpInput(value));
  }

  async function handleResendOtp() {
    if (resendCountdown > 0 || actionBusy) {
      return;
    }

    await requestOtp(true);
  }

  const primaryAction = phoneVerificationPending
    ? handleVerifyOtp
    : handleSendOtp;
  const primaryLabel = getPhoneButtonLabel(phoneVerificationPending, phoneBusy);
  const inputValue = phoneVerificationPending ? verificationCode : phoneNumber;
  const inputPlaceholder = phoneVerificationPending
    ? 'Enter OTP'
    : 'Enter mobile number';
  const inputKeyboardType = phoneVerificationPending ? 'number-pad' : 'phone-pad';
  const inputAutoComplete = phoneVerificationPending ? 'sms-otp' : 'tel';
  const inputMaxLength = phoneVerificationPending ? OTP_LENGTH : 10;
  const actionBusy = phoneBusy || signingIn;
  const phoneInputComplete = phoneNumber.length === 10;
  const otpInputComplete = verificationCode.length === OTP_LENGTH;
  const primaryDisabled =
    actionBusy ||
    (phoneVerificationPending ? !otpInputComplete : !phoneInputComplete);
  const resendDisabled = actionBusy || resendCountdown > 0;
  const resendLabel =
    resendCountdown > 0
      ? `Resend OTP in ${formatCountdown(resendCountdown)}`
      : 'Resend OTP';

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[COLORS.backgroundTop, COLORS.backgroundBottom]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <Image
        source={patternImage}
        resizeMode="cover"
        style={styles.patternOverlay}
      />
      <Image
        source={backgroundImage}
        resizeMode="cover"
        style={styles.figureOverlay}
      />
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View>
            <View style={styles.brandRow}>
              <View style={styles.brandMarkFrame}>
                <Image
                  source={medhaLogo}
                  resizeMode="contain"
                  style={styles.brandMarkImage}
                />
              </View>
            </View>

            <View style={styles.heroBlock}>
              <Text style={styles.heroLead}>Be a part of</Text>
              <Text style={styles.heroTitle}>Medha Clinic</Text>
              <Text style={styles.heroSubtitle}>
                Login to continue to MedhaClinic
              </Text>
            </View>
          </View>

          <View>
            <View style={[styles.card, { width: cardWidth }]}>
              <View pointerEvents="none" style={styles.cardShade} />

              <View
                style={[
                  styles.inputShell,
                  phoneVerificationPending && styles.inputShellOtp,
                ]}
              >
                {phoneVerificationPending ? null : (
                  <Text style={styles.countryCode}>+91</Text>
                )}

                <TextInput
                  ref={phoneInputRef}
                  autoCapitalize="none"
                  autoComplete={inputAutoComplete}
                  keyboardType={inputKeyboardType}
                  maxLength={inputMaxLength}
                  onChangeText={
                    phoneVerificationPending
                      ? handleOtpInputChange
                      : handlePhoneInputChange
                  }
                  onSubmitEditing={primaryAction}
                  placeholder={inputPlaceholder}
                  placeholderTextColor="#848484"
                  style={[
                    styles.input,
                    !phoneVerificationPending && styles.phoneInput,
                  ]}
                  value={inputValue}
                />
              </View>

              {phoneVerificationPending ? (
                <View style={styles.otpMetaBlock}>
                  <Text style={styles.otpMetaText}>
                    Enter the 6-digit OTP sent to +91 {phoneNumber}
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.86}
                    disabled={resendDisabled}
                    onPress={() => void handleResendOtp()}
                    style={styles.otpMetaAction}
                  >
                    <Text
                      style={[
                        styles.otpMetaActionText,
                        resendDisabled && styles.otpMetaActionTextDisabled,
                      ]}
                    >
                      {resendLabel}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              <TouchableOpacity
                activeOpacity={0.9}
                disabled={primaryDisabled}
                onPress={() => void primaryAction()}
                style={[
                  styles.primaryButton,
                  styles.primaryButtonAfterInput,
                  primaryDisabled && styles.disabledButton,
                ]}
              >
                <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
              </TouchableOpacity>

              <Text style={styles.orText}>Or</Text>

              <TouchableOpacity
                activeOpacity={0.9}
                disabled={actionBusy}
                onPress={handleGoogleSignIn}
                style={[
                  styles.googleButton,
                  actionBusy && styles.disabledButton,
                ]}
              >
                <View style={styles.googleButtonContent}>
                  <Image source={googleIcon} style={styles.googleIcon} />
                  <Text style={styles.googleButtonText}>
                    {signingIn ? 'Signing in with Google' : 'Sign in with Google'}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.86}
                onPress={
                  phoneVerificationPending
                    ? handleUseDifferentNumber
                    : handleForgotPassword
                }
                style={styles.footerLink}
              >
                <Text style={styles.footerLinkText}>
                  {phoneVerificationPending
                    ? 'Use a different number'
                    : 'Forget Password?'}
                </Text>
              </TouchableOpacity>

              {Platform.OS === 'web' ? (
                <View
                  nativeID="phone-recaptcha-container"
                  style={styles.hiddenRecaptcha}
                />
              ) : null}
            </View>

            <TouchableOpacity
              activeOpacity={0.86}
              onPress={handleSignUp}
              style={styles.signUpRow}
            >
              <Text style={styles.signUpText}>
                Don&apos;t have an account?{' '}
                <Text style={styles.signUpAccent}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function makeStyles(width: number, height: number) {
  const isSmall = width < 360;   // e.g. older Android budget phones (< 360 dp)
  const isLarge = width >= 412;  // e.g. Galaxy S22 Ultra, Pixel 7 Pro, iPhone 14 Pro Max
  const logoW = s(226, width);
  const logoH = s(82, width);

  return StyleSheet.create({
    flex: {
      flex: 1,
    },
    screen: {
      flex: 1,
      backgroundColor: COLORS.backgroundBottom,
    },
    patternOverlay: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
      opacity: 0.82,
    },
    figureOverlay: {
      position: 'absolute',
      left: -s(32, width),
      bottom: sv(108, height),
      width: width * 0.96,
      height: height * 0.82,
      opacity: 0.18,
    },
    topGlow: {
      position: 'absolute',
      top: sv(120, height),
      right: -s(120, width),
      width: s(300, width),
      height: s(300, width),
      borderRadius: 999,
      backgroundColor: 'rgba(157, 255, 118, 0.12)',
    },
    bottomGlow: {
      position: 'absolute',
      left: -s(150, width),
      bottom: sv(120, height),
      width: s(360, width),
      height: s(360, width),
      borderRadius: 999,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    content: {
      flexGrow: 1,
      justifyContent: 'space-between',
      paddingTop: sv(isSmall ? 36 : 52, height),
      paddingBottom: sv(24, height),
      paddingHorizontal: s(24, width),
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: s(10, width),
    },
    brandMarkFrame: {
      width: logoW,
      height: logoH,
    },
    brandMarkImage: {
      width: logoW,
      height: logoH,
    },
    heroBlock: {
      alignItems: 'center',
      marginTop: sv(isSmall ? 28 : isLarge ? 56 : 48, height),
    },
    heroLead: {
      color: COLORS.white,
      fontSize: s(isSmall ? 30 : isLarge ? 46 : 40, width),
      fontWeight: '300',
      lineHeight: s(isSmall ? 36 : isLarge ? 52 : 46, width),
      textAlign: 'center',
    },
    heroTitle: {
      color: COLORS.white,
      fontSize: s(isSmall ? 38 : isLarge ? 56 : 50, width),
      fontWeight: '800',
      lineHeight: s(isSmall ? 44 : isLarge ? 62 : 56, width),
      textAlign: 'center',
      marginTop: s(8, width),
    },
    heroSubtitle: {
      color: COLORS.white,
      fontSize: s(isSmall ? 13 : isLarge ? 19 : 16, width),
      fontWeight: '400',
      textAlign: 'center',
      marginTop: sv(isSmall ? 14 : isLarge ? 26 : 20, height),
    },
    card: {
      alignSelf: 'center',
      backgroundColor: COLORS.card,
      borderColor: COLORS.cardBorder,
      borderRadius: s(34, width),
      borderWidth: 1.25,
      paddingHorizontal: s(22, width),
      paddingTop: sv(24, height),
      paddingBottom: sv(22, height),
      shadowColor: '#032500',
      shadowOffset: { width: 0, height: s(24, width) },
      shadowOpacity: 0.42,
      shadowRadius: s(36, width),
      elevation: 16,
    },
    cardShade: {
      position: 'absolute',
      top: s(14, width),
      left: s(18, width),
      right: s(18, width),
      height: sv(90, height),
      borderRadius: s(30, width),
      backgroundColor: 'rgba(0,0,0,0.12)',
    },
    primaryButton: {
      height: sv(isSmall ? 58 : 68, height),
      borderRadius: s(24, width),
      backgroundColor: COLORS.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonAfterInput: {
      marginTop: sv(isSmall ? 14 : 20, height),
    },
    primaryButtonText: {
      color: COLORS.white,
      fontSize: s(isSmall ? 16 : 20, width),
      fontWeight: '500',
      textAlign: 'center',
    },
    inputShell: {
      height: sv(isSmall ? 58 : 68, height),
      borderRadius: s(24, width),
      backgroundColor: COLORS.white,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s(18, width),
    },
    inputShellOtp: {
      paddingHorizontal: 0,
    },
    countryCode: {
      color: COLORS.inputText,
      fontSize: s(isSmall ? 15 : 18, width),
      fontWeight: '700',
      marginRight: s(10, width),
    },
    input: {
      flex: 1,
      height: '100%',
      color: COLORS.inputText,
      fontSize: s(isSmall ? 15 : 18, width),
      fontWeight: '600',
      textAlign: 'center',
    },
    phoneInput: {
      textAlign: 'left',
    },
    orText: {
      color: COLORS.white,
      fontSize: s(isSmall ? 14 : 17, width),
      fontWeight: '400',
      textAlign: 'center',
      marginTop: sv(isSmall ? 16 : 22, height),
    },
    googleButton: {
      height: sv(isSmall ? 58 : 68, height),
      marginTop: sv(isSmall ? 16 : 22, height),
      borderRadius: s(24, width),
      backgroundColor: COLORS.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    googleButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    googleIcon: {
      width: s(isSmall ? 26 : 32, width),
      height: s(isSmall ? 26 : 32, width),
      marginRight: s(12, width),
    },
    googleButtonText: {
      color: COLORS.white,
      fontSize: s(isSmall ? 15 : 19, width),
      fontWeight: '500',
      textAlign: 'center',
    },
    footerLink: {
      marginTop: sv(isSmall ? 18 : 26, height),
      alignItems: 'center',
      justifyContent: 'center',
    },
    footerLinkText: {
      color: COLORS.white,
      fontSize: s(isSmall ? 13 : 16, width),
      fontWeight: '600',
    },
    otpMetaBlock: {
      marginTop: sv(12, height),
      alignItems: 'center',
    },
    otpMetaText: {
      color: COLORS.muted,
      fontSize: s(isSmall ? 12 : 14, width),
      fontWeight: '500',
      textAlign: 'center',
      lineHeight: s(isSmall ? 18 : 20, width),
    },
    otpMetaAction: {
      marginTop: sv(10, height),
    },
    otpMetaActionText: {
      color: COLORS.white,
      fontSize: s(isSmall ? 13 : 15, width),
      fontWeight: '700',
      textAlign: 'center',
    },
    otpMetaActionTextDisabled: {
      color: 'rgba(255,255,255,0.7)',
    },
    signUpRow: {
      alignItems: 'center',
      marginTop: sv(isSmall ? 16 : 24, height),
    },
    signUpText: {
      color: COLORS.white,
      fontSize: s(isSmall ? 13 : 16, width),
      fontWeight: '400',
      textAlign: 'center',
    },
    signUpAccent: {
      fontWeight: '800',
    },
    disabledButton: {
      opacity: 0.72,
    },
    hiddenRecaptcha: {
      width: 1,
      height: 1,
      opacity: 0,
      position: 'absolute',
      bottom: 0,
      left: 0,
    },
  });
}
