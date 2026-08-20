import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function ThankYouScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    if (secondsLeft <= 0) {
      router.replace('/(tabs)');
      return;
    }
    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Deep dark gold-tinted background gradient */}
      <LinearGradient
        colors={['#07090E', '#0B0F19', '#07090E']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 20) + 16 },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Svg width={46} height={38} viewBox="0 0 60 50" fill="none">
              <Path
                d="M 12 40 L 24 16 L 33 28 L 45 8 M 37 8 H 45 V 16"
                stroke="#F5A623"
                strokeWidth={5.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={styles.logoText}>MyQuro</Text>
          </View>

          {/* Onboarding Complete Hero Illustration */}
          <View style={styles.illustrationWrapper}>
            <Image
              source={require('../../assets/image copy 6.png')}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>

          {/* Main Success Content Card */}
          <View style={styles.card}>
            {/* Circular Checkmark Badge */}
            <View style={styles.checkmarkBadgeWrapper}>
              <View style={styles.checkmarkBadge}>
                <Ionicons name="checkmark" size={26} color="#F5A623" />
              </View>
            </View>

            {/* Thank you titles */}
            <Text style={styles.thankYouTitle}>Thank you!</Text>
            <Text style={styles.thankYouSubtitle}>We've received your details.</Text>

            <View style={styles.horizontalDivider} />

            {/* Step/Info List */}
            {/* Info Item 1 */}
            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="people-sharp" size={18} color="#F5A623" />
              </View>
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoTitle}>
                  <Text style={styles.goldText}>MyQuro team</Text> will review and approve it.
                </Text>
                <Text style={styles.infoDescription}>
                  Our team will carefully verify your information to ensure everything is perfect.
                </Text>
              </View>
            </View>

            <View style={styles.innerDivider} />

            {/* Info Item 2 */}
            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="calendar-outline" size={18} color="#F5A623" />
              </View>
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoTitle}>
                  Your restaurant will be live in <Text style={styles.goldText}>72 hr</Text> of work days.
                </Text>
                <Text style={styles.infoDescription}>
                  Once approved, your restaurant will go live within 72 working hours.
                </Text>
              </View>
            </View>

            <View style={styles.innerDivider} />

            {/* Info Item 3 */}
            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#F5A623" />
              </View>
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoTextOnly}>
                  You will receive an email & SMS notification once your restaurant is live.
                </Text>
              </View>
            </View>

            {/* Custom Interactive Progress Redirect Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${(secondsLeft / 10) * 100}%` }]} />
              </View>
              <Text style={styles.redirectText}>
                Redirecting to dashboard in <Text style={styles.countdownNumber}>{secondsLeft}s</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Abstract gold wavy lines at the very bottom */}
      <Svg width="100%" height={90} viewBox="0 0 375 90" style={styles.bottomWaves}>
        <Path
          d="M-20 45 C 60 75, 180 15, 260 55 C 300 75, 360 65, 400 50"
          fill="none"
          stroke="#F5A623"
          strokeWidth="1.8"
          opacity="0.25"
        />
        <Path
          d="M-20 55 C 80 85, 140 25, 240 65 C 290 85, 340 55, 400 40"
          fill="none"
          stroke="#F5A623"
          strokeWidth="1.2"
          opacity="0.12"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07090E',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  logoText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 23,
    color: '#FFFFFF',
    marginTop: 2,
    letterSpacing: -0.2,
  },
  illustrationWrapper: {
    width: width * 0.85,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(15, 18, 26, 0.95)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 8,
    position: 'relative',
    marginTop: 18,
  },
  checkmarkBadgeWrapper: {
    position: 'absolute',
    top: -26,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0F121A',
    borderWidth: 2,
    borderColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
  },
  thankYouTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 28,
    color: '#F5A623',
    textAlign: 'center',
    marginTop: 4,
  },
  thankYouSubtitle: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 16.5,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 5,
    letterSpacing: 0.1,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoTitle: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  goldText: {
    color: '#F5A623',
    fontFamily: 'Urbanist-Bold',
  },
  infoDescription: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
    lineHeight: 17,
  },
  innerDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 16,
    marginLeft: 52,
  },
  infoTextOnly: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.82)',
    lineHeight: 19,
    flex: 1,
  },
  progressContainer: {
    marginTop: 26,
    alignItems: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F5A623',
    borderRadius: 2,
  },
  redirectText: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  countdownNumber: {
    color: '#F5A623',
    fontFamily: 'Urbanist-Bold',
  },
  bottomWaves: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },
});
