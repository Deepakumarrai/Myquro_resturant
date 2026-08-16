import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

// Natural image dimensions (1220 x 1289)
const IMAGE_HEIGHT = width * (1289 / 1220);

export default function OnboardingStepsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleProceedStep1 = () => {
    // Navigate to step 1 form or next flow
    router.push('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Proportional Hero Background Image */}
      <View style={styles.heroBackgroundWrapper}>
        <Image
          source={require('../../assets/image.png')}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* Multi-Stop Dark Fade Gradient for Text Readability */}
        <LinearGradient
          colors={[
            'rgba(11, 13, 18, 0.45)',
            'rgba(11, 13, 18, 0.2)',
            'rgba(11, 13, 18, 0.45)',
            'rgba(11, 13, 18, 0.78)',
            '#07090E',
          ]}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 12 },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Top Navigation Bar */}
          <View style={styles.topNav}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.backButton}
              onPress={() => router.back()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="arrow-back" size={20} color="#F5A623" />
            </TouchableOpacity>
          </View>

          {/* Hero Header Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroTextColumn}>
              <View style={styles.goldAccentLine} />
              <Text style={styles.title}>
                Let's finish{'\n'}
                <Text style={styles.titleGold}>onboarding</Text> you!
              </Text>
              <Text style={styles.subtitle}>In less than 10 minutes</Text>
            </View>
          </View>

          {/* Main Steps Container Card (Translucent Glassmorphism) */}
          <View style={styles.stepsCard}>
            {/* STEP 1 (Active) */}
            <View style={styles.stepContainer}>
              <View style={styles.timelineLeftColumn}>
                <View style={styles.activeStepBadge}>
                  <Text style={styles.activeStepText}>1</Text>
                </View>
                {/* Dotted Connecting Line */}
                <View style={styles.dottedLine} />
              </View>

              <View style={styles.stepContentColumn}>
                <Text style={styles.stepLabelActive}>STEP 1</Text>
                <Text style={styles.stepTitle}>Restaurant Information</Text>
                <Text style={styles.stepDescription}>
                  Location, Owner details, Open & Close hrs.
                </Text>

                {/* Proceed Button */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={styles.proceedButton}
                  onPress={handleProceedStep1}
                >
                  <LinearGradient
                    colors={['#FDC830', '#F39C12', '#E67E22']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.proceedGradient}
                  >
                    <Text style={styles.proceedText}>Proceed</Text>
                    <Ionicons name="chevron-forward" size={18} color="#0B0D12" />
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.stepDivider} />
              </View>
            </View>

            {/* STEP 2 */}
            <View style={styles.stepContainer}>
              <View style={styles.timelineLeftColumn}>
                <View style={styles.inactiveStepBadge}>
                  <Text style={styles.inactiveStepText}>2</Text>
                </View>
                <View style={styles.dottedLine} />
              </View>

              <View style={styles.stepContentColumn}>
                <Text style={styles.stepLabelInactive}>STEP 2</Text>
                <Text style={styles.stepTitleInactive}>Restaurant Documents</Text>
                <View style={styles.stepDivider} />
              </View>
            </View>

            {/* STEP 3 */}
            <View style={styles.stepContainer}>
              <View style={styles.timelineLeftColumn}>
                <View style={styles.inactiveStepBadge}>
                  <Text style={styles.inactiveStepText}>3</Text>
                </View>
                <View style={styles.dottedLine} />
              </View>

              <View style={styles.stepContentColumn}>
                <Text style={styles.stepLabelInactive}>STEP 3</Text>
                <Text style={styles.stepTitleInactive}>Menu Setup</Text>
                <View style={styles.stepDivider} />
              </View>
            </View>

            {/* STEP 4 */}
            <View style={[styles.stepContainer, { marginBottom: 0 }]}>
              <View style={styles.timelineLeftColumn}>
                <View style={styles.inactiveStepBadge}>
                  <Text style={styles.inactiveStepText}>4</Text>
                </View>
              </View>

              <View style={styles.stepContentColumn}>
                <Text style={styles.stepLabelInactive}>STEP 4</Text>
                <Text style={styles.stepTitleInactive}>Partner Contract</Text>
              </View>
            </View>
          </View>

          {/* Bottom Floating Help Card */}
          <View style={styles.helpCard}>
            <Ionicons name="headset-outline" size={24} color="#F5A623" />
            <View style={styles.helpVerticalDivider} />
            <Text style={styles.helpText}>
              If you need any help, check out the{' '}
              <Text style={styles.faqsLink}>FAQs</Text>
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07090E',
  },
  heroBackgroundWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Math.max(IMAGE_HEIGHT, height * 0.6),
    width: '100%',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 0.95 }],
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  /* Top Nav */
  topNav: {
    paddingTop: 24,
    marginBottom: 54,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: '#F5A623',
    backgroundColor: 'rgba(11, 13, 18, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Hero Section */
  heroSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 28,
  },
  heroTextColumn: {
    flex: 1,
    paddingRight: 8,
  },
  goldAccentLine: {
    width: 48,
    height: 3,
    backgroundColor: '#F5A623',
    borderRadius: 2,
    marginBottom: 12,
  },
  title: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 27,
    lineHeight: 33,
    letterSpacing: -0.3,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  titleGold: {
    color: '#F5A623',
  },
  subtitle: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroImageWrapper: {
    width: 135,
    height: 135,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroGraphic: {
    width: '100%',
    height: '100%',
  },

  /* Steps Card */
  stepsCard: {
    backgroundColor: 'rgba(11, 13, 18, 0.58)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 18,
    paddingVertical: 22,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 6,
  },
  stepContainer: {
    flexDirection: 'row',
  },
  timelineLeftColumn: {
    alignItems: 'center',
    width: 34,
    marginRight: 14,
  },
  activeStepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#07090E',
    borderWidth: 2,
    borderColor: '#F5A623',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 8,
    elevation: 4,
  },
  activeStepText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 14,
    color: '#F5A623',
  },
  inactiveStepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveStepText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
  },
  dottedLine: {
    flex: 1,
    width: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    borderStyle: 'dashed',
    marginVertical: 4,
    minHeight: 36,
  },
  stepContentColumn: {
    flex: 1,
  },
  stepLabelActive: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 11,
    letterSpacing: 1.2,
    color: '#F5A623',
    marginBottom: 4,
  },
  stepTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 17,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  stepDescription: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.68)',
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 17,
  },
  stepLabelInactive: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 11,
    letterSpacing: 1.2,
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 4,
  },
  stepTitleInactive: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  proceedButton: {
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 14,
  },
  proceedGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  proceedText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 15.5,
    color: '#0B0D12',
  },
  stepDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    marginVertical: 14,
  },

  /* Bottom Help Floating Card */
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 13, 18, 0.65)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  helpVerticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 14,
  },
  helpText: {
    flex: 1,
    fontFamily: 'Urbanist-Medium',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  faqsLink: {
    color: '#F5A623',
    fontFamily: 'Urbanist-Bold',
    textDecorationLine: 'underline',
  },
});
