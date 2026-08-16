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

export default function OnboardingChecklistScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBegin = () => {
    router.push('/restaurant-name');
  };

  const checklistItems = [
    {
      id: 'pan',
      icon: 'card-outline',
      title: 'PAN Number',
    },
    {
      id: 'gstin',
      icon: 'receipt-outline',
      title: 'GSTIN Number',
    },
    {
      id: 'bank',
      icon: 'business-outline',
      title: 'Bank Details (IFSC and Account Number)',
    },
    {
      id: 'fssai',
      icon: 'shield-checkmark-outline',
      title: 'FSSAI Registration Number',
    },
    {
      id: 'menu',
      icon: 'restaurant-outline',
      title: 'Your Restaurant Menu',
    },
  ];

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

        {/* Seamless Dark Vignette & Fade Gradient */}
        <LinearGradient
          colors={[
            'rgba(11, 13, 18, 0.45)',
            'rgba(11, 13, 18, 0.2)',
            'rgba(11, 13, 18, 0.4)',
            'rgba(11, 13, 18, 0.72)',
            '#0B0D12',
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

          {/* Header Title Section */}
          <View style={styles.headerSection}>
            <Text style={styles.subtitle}>Start your onboarding process</Text>
            <Text style={styles.title}>
              Make your restaurant{'\n'}delivery-ready in{' '}
              <Text style={styles.titleGold}>24hrs!</Text>
            </Text>
            <View style={styles.goldAccentLine} />
          </View>

          {/* Accelerator Promo Card */}
          <View style={styles.promoContainer}>
            <View style={styles.promoRow}>
              <View style={styles.rocketBadge}>
                <Ionicons name="rocket" size={20} color="#F5A623" />
              </View>
              <View style={styles.promoTextWrapper}>
                <Text style={styles.promoLine1}>
                  Fast track your growth with
                </Text>
                <Text style={styles.promoLine2}>
                  MyQuro Accelerator + benefits{'\n'}upto{' '}
                  <Text style={styles.promoAmount}>₹40,000</Text>
                </Text>
              </View>
            </View>

            <View style={styles.promoFooterRow}>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.knowMoreText}>Click here to know more</Text>
              </TouchableOpacity>
              <Text style={styles.termsNote}>*Subject to T&C</Text>
            </View>
          </View>

          {/* 45-50% Semi-Transparent Checklist Container Box */}
          <View style={styles.checklistCard}>
            {/* Folded Dog-Ear Top-Right Corner */}
            <View style={styles.dogEarFold} />

            {/* Card Title & Subtitle */}
            <Text style={styles.cardHeaderTitle}>
              For an easy form filling process,
            </Text>
            <Text style={styles.cardHeaderSubtitle}>
              you can keep the following handy.
            </Text>

            {/* Dashed Separator */}
            <View style={styles.dashedDivider} />

            {/* Checklist Items */}
            <View style={styles.checklistItemsWrapper}>
              {checklistItems.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.checklistItemRow,
                    index < checklistItems.length - 1 ? styles.itemBorderBottom : null,
                  ]}
                >
                  <View style={styles.itemIconBadge}>
                    <Ionicons name={item.icon as any} size={18} color="#F5A623" />
                  </View>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                </View>
              ))}
            </View>

            {/* CTA Button: Let's Begin! */}
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.ctaButton}
              onPress={handleBegin}
            >
              <LinearGradient
                colors={['#FDC830', '#F39C12', '#E67E22']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>Let's Begin!</Text>
                <Ionicons name="arrow-forward" size={19} color="#0B0D12" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Bottom Help & FAQs Link */}
          <View style={styles.helpRow}>
            <Ionicons
              name="headset-outline"
              size={18}
              color="#F5A623"
              style={styles.helpIcon}
            />
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
    backgroundColor: '#0B0D12',
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
    paddingTop: 18,
    marginBottom: 24,
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

  /* Header Section */
  headerSection: {
    marginTop: 8,
    marginBottom: 18,
  },
  subtitle: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 13.5,
    letterSpacing: 0.2,
    color: 'rgba(255, 255, 255, 0.88)',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
  goldAccentLine: {
    width: 48,
    height: 3,
    backgroundColor: '#F5A623',
    borderRadius: 2,
    marginTop: 8,
  },

  /* Promo Card */
  promoContainer: {
    marginBottom: 16,
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rocketBadge: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.28)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  promoTextWrapper: {
    flex: 1,
  },
  promoLine1: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 13,
    color: '#F5A623',
    letterSpacing: 0.1,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  promoLine2: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  promoAmount: {
    color: '#F5A623',
    fontFamily: 'Urbanist-Bold',
  },
  promoFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  knowMoreText: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 11.5,
    color: '#F5A623',
    textDecorationLine: 'underline',
  },
  termsNote: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.55)',
  },

  /* 45-50% Transparent Checklist Box */
  checklistCard: {
    position: 'relative',
    backgroundColor: 'rgba(11, 13, 18, 0.48)',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 6,
  },
  dogEarFold: {
    position: 'absolute',
    top: -1.5,
    right: -1.5,
    width: 36,
    height: 36,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 14,
    backgroundColor: 'rgba(11, 13, 18, 0.55)',
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderColor: '#D4AF37',
  },
  cardHeaderTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 15,
    letterSpacing: 0.1,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardHeaderSubtitle: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.72)',
    marginTop: 2,
    marginBottom: 12,
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.28)',
    borderStyle: 'dashed',
    marginBottom: 6,
  },
  checklistItemsWrapper: {
    marginBottom: 4,
  },
  checklistItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
  },
  itemBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  itemIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemTitle: {
    flex: 1,
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14,
    letterSpacing: 0.1,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  /* CTA Button */
  ctaButton: {
    height: 52,
    borderRadius: 14,
    marginTop: 18,
    overflow: 'hidden',
  },
  ctaGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  ctaText: {
    fontFamily: 'Urbanist-ExtraBold',
    fontSize: 16.5,
    letterSpacing: 0.2,
    color: '#0B0D12',
    marginRight: 8,
  },

  /* Bottom Help Row */
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    paddingBottom: 12,
  },
  helpIcon: {
    marginRight: 8,
  },
  helpText: {
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
