import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PartnerContractScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 11;
  const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleDownload = () => {
    Alert.alert(
      'Download Contract',
      'Letter of Understanding (LOU) contract PDF will be saved to your device.'
    );
  };

  const showCommissionInfo = () => {
    Alert.alert(
      'Commission Structure',
      'The 15% platform commission covers delivery logistics, live order tracking, customer support, and merchant app services.'
    );
  };

  const showOnboardingFeeInfo = () => {
    Alert.alert(
      'Onboarding Fee',
      'One-time onboarding fee of ₹949 covers menu digitisation, restaurant kit, verified listing verification, and initial promotion.'
    );
  };

  const handleFinalProceed = () => {
    setIsTermsModalVisible(false);
    // User accepted terms and contract
    Alert.alert(
      'Contract Accepted',
      'Congratulations! Your partner agreement has been recorded successfully.',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/'),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 20) + 16 },
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

          {/* Header Row with Title & 3D Contract Document */}
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>
              Partner <Text style={styles.headerTitleGold}>Contract</Text>
            </Text>
            <Image
              source={require('../../assets/image copy 5.png')}
              style={styles.contractIllustration}
              resizeMode="contain"
            />
          </View>

          {/* CARD 1: Overview */}
          <View style={styles.card}>
            <Text style={styles.cardTitleOverview}>Overview</Text>

            {/* Row 1: MyQuro Commission */}
            <View style={styles.overviewRow}>
              <View style={styles.overviewLeft}>
                <View style={styles.iconBadge}>
                  <Text style={styles.badgePercentText}>%</Text>
                </View>
                <Text style={styles.overviewLabel}>MyQuro Commission</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={showCommissionInfo}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color="#F5A623"
                    style={{ marginLeft: 6 }}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.overviewValue}>15%</Text>
            </View>

            <View style={styles.overviewDivider} />

            {/* Row 2: Onboarding Fee */}
            <View style={styles.overviewRow}>
              <View style={styles.overviewLeft}>
                <View style={styles.iconBadge}>
                  <Text style={styles.badgeRupeeText}>₹</Text>
                </View>
                <Text style={styles.overviewLabel}>Onboarding fee</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={showOnboardingFeeInfo}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color="#F5A623"
                    style={{ marginLeft: 6 }}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.overviewValue}>₹949</Text>
            </View>
          </View>

          {/* CARD 2: Contract Document Viewer */}
          <View style={styles.card}>
            {/* Top Pagination & Download Bar */}
            <View style={styles.documentTopBar}>
              <View style={styles.paginationControls}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.pageNavButton,
                    currentPage === 1 ? styles.pageNavButtonDisabled : null,
                  ]}
                  onPress={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <Ionicons
                    name="chevron-back"
                    size={18}
                    color={currentPage === 1 ? 'rgba(255, 255, 255, 0.3)' : '#F5A623'}
                  />
                </TouchableOpacity>

                <Text style={styles.pageIndicatorText}>
                  Page: <Text style={styles.pageIndicatorGold}>{currentPage}</Text> /{' '}
                  {totalPages}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.pageNavButton,
                    currentPage === totalPages ? styles.pageNavButtonDisabled : null,
                  ]}
                  onPress={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={
                      currentPage === totalPages
                        ? 'rgba(255, 255, 255, 0.3)'
                        : '#F5A623'
                    }
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.downloadButton}
                onPress={handleDownload}
              >
                <Ionicons name="download-outline" size={24} color="#F5A623" />
              </TouchableOpacity>
            </View>

            {/* Document Content Viewport */}
            <View style={styles.documentViewport}>
              <Text style={styles.documentHeaderHeading}>
                LETTER OF UNDERSTANDING
              </Text>

              <Text style={styles.documentBodyParagraph}>
                This Letter of Understanding ("<Text style={styles.boldText}>LOU</Text>")
                is made on <Text style={styles.boldText}>Date 26-07-2025</Text> (the
                "<Text style={styles.boldText}>Effective Date</Text>") by and between:
              </Text>

              <Text style={styles.documentBodyParagraph}>
                <Text style={styles.boldText}>
                  MyQuro Limited (formerly known as Bundl Technologies Private Limited)
                </Text>
                , a company registered under the Companies Act, 2013, having its
                registered office at 3rd Floor, International Geostate at No. 55 Sy No
                8 To 14, 14 / Block, Ground Floor, Embassy Tech Village, Outer Ring
                Road, Devarabeesanahalli, Varthur, Bengaluru – 560103 ("
                <Text style={styles.boldText}>MyQuro</Text>") AND
              </Text>

              <Text style={styles.documentBodyParagraph}>
                <Text style={styles.boldText}>Rs cafe</Text> a company/ partnership/
                firm/ proprietary firm, having its corporate office at{' '}
                <Text style={styles.boldText}>
                  Vetrivel residency ekkathangal
                </Text>{' '}
                ("<Text style={styles.boldText}>Restaurant Participant Merchant</Text>
                ").
              </Text>

              <Text style={styles.documentBodyParagraph}>
                <Text style={styles.boldText}>MyQuro</Text> and the Restaurant
                Participant Merchant are hereinafter jointly referred to as the "
                <Text style={styles.boldText}>Parties</Text>" and, individually, a "
                <Text style={styles.boldText}>Party</Text>", as the context may so
                require.
              </Text>

              <Text style={styles.documentSectionTitle}>
                NOW THEREFORE, THE PARTIES HEREBY AGREE AND CONTRACT AS FOLLOWS:
              </Text>

              <Text style={styles.documentBodyParagraph}>
                Capitalized terms used but not defined herein shall have the meaning
                assigned to them under the Merchant Terms of Use available at
                https://partner.myquro.com/seller/tnc [
                <Text style={styles.boldText}>"Merchant Terms"</Text>].
              </Text>

              <Text style={styles.documentBodyParagraph}>
                1. Merchant understands that MyQuro is engaged in the business of
                inter alia operating an online platform under the "MyQuro", through its{' '}
                <Text style={styles.boldText}>Platform</Text>, which lets Restaurant
                Merchants and Buyers connect to place food and beverages orders. The
                Platform is utilized by Buyers to choose and place{' '}
                <Text style={styles.boldText}>Orders</Text> from a variety of prepared
                food products listed and offered for sale by{' '}
                <Text style={styles.boldText}>Merchants</Text> on the Platform, pursuant
                to which MyQuro facilitates delivery of such Order(s) through the
                independent pick-up and delivery partner engaged on principal to
                principal basis in select serviceable geographical area of the cities in
                India.
              </Text>
            </View>
          </View>

          {/* Main Proceed CTA Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.proceedButton}
            onPress={() => setIsTermsModalVisible(true)}
          >
            <LinearGradient
              colors={['#FDC830', '#F39C12', '#E67E22']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.proceedGradient}
            >
              <Text style={styles.proceedTextActive}>Review & Accept</Text>
              <Ionicons name="chevron-forward" size={18} color="#0B0D12" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Bottom Help Floating Card */}
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

      {/* TERMS AND CONDITIONS BOTTOM SHEET MODAL */}
      <Modal
        visible={isTermsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsTermsModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setIsTermsModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.termsModalCard}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalDragHandle} />

            {/* Modal Header */}
            <View style={styles.termsModalHeaderRow}>
              <Text style={styles.termsModalTitle}>
                Terms and <Text style={styles.termsModalTitleGold}>Conditions</Text>
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.modalCloseButton}
                onPress={() => setIsTermsModalVisible(false)}
              >
                <Ionicons name="close" size={20} color="#F5A623" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Terms Bullets */}
            <ScrollView
              style={styles.termsScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Bullet 1 */}
              <View style={styles.termsBulletItem}>
                <Text style={styles.bulletDotGold}>•</Text>
                <Text style={styles.termsBulletText}>
                  This construct is for new brands/ partners who have never been on{' '}
                  <Text style={styles.boldGold}>MyQuro</Text> so far. Existing
                  outlets of new brands or new brands of existing partners will not
                  qualify for this.
                </Text>
              </View>

              {/* Bullet 2 */}
              <View style={styles.termsBulletItem}>
                <Text style={styles.bulletDotGold}>•</Text>
                <Text style={styles.termsBulletText}>
                  <Text style={styles.boldWhite}>0% Commission</Text> will be
                  applicable for first 30 days or first 100 completed orders or
                  ₹10,000 worth of commission rebate (whichever occurs earlier)
                </Text>
              </View>

              {/* Bullet 3 */}
              <View style={styles.termsBulletItem}>
                <Text style={styles.bulletDotGold}>•</Text>
                <Text style={styles.termsBulletText}>
                  Post first 30 days or first 100 completed orders or ₹10,000
                  worth of commission rebate (whichever occurs earlier), the partner
                  will automatically be charged{' '}
                  <Text style={styles.boldWhite}>% 15 commission</Text>
                </Text>
              </View>

              {/* Bullet 4 */}
              <View style={styles.termsBulletItem}>
                <Text style={styles.bulletDotGold}>•</Text>
                <Text style={styles.termsBulletText}>
                  This will come with a nominal one-time onboarding fee of{' '}
                  <Text style={styles.boldGold}>₹949</Text>, charged for system &
                  admin costs incurred during the onboarding process. The Onboarding
                  Fee is non-refundable
                </Text>
              </View>

              {/* Bullet 5 */}
              <View style={styles.termsBulletItem}>
                <Text style={styles.bulletDotGold}>•</Text>
                <Text style={styles.termsBulletText}>
                  Out of this, <Text style={styles.boldGold}>₹ 943</Text> will be
                  collected upfront during onboarding process and the remaining{' '}
                  <Text style={styles.boldGold}>₹ 826</Text> will be adjusted from
                  the weekly payouts
                </Text>
              </View>

              {/* Bullet 6 */}
              <View style={styles.termsBulletItem}>
                <Text style={styles.bulletDotGold}>•</Text>
                <Text style={styles.termsBulletText}>
                  After the restaurant is live, commissions will be deducted @ % 15
                  on all orders, excluding taxes and delivery fees (if applicable).
                </Text>
              </View>
            </ScrollView>

            {/* Modal Proceed CTA Button */}
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.modalProceedButton}
              onPress={handleFinalProceed}
            >
              <LinearGradient
                colors={['#FDC830', '#F39C12', '#E67E22']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.proceedGradient}
              >
                <Text style={styles.proceedTextActive}>Proceed</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Bottom Support inside Modal */}
            <View style={styles.modalHelpRow}>
              <Ionicons
                name="headset-outline"
                size={20}
                color="#F5A623"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.modalHelpText}>
                If you need any help, check out the{' '}
                <Text style={styles.faqsLink}>FAQs</Text>
              </Text>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  },

  /* Top Nav */
  topNav: {
    paddingTop: 18,
    marginBottom: 16,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 27,
    letterSpacing: -0.3,
    color: '#FFFFFF',
    flex: 1,
  },
  headerTitleGold: {
    color: '#F5A623',
  },
  contractIllustration: {
    width: 78,
    height: 78,
    borderRadius: 14,
    marginLeft: 8,
  },

  /* Card */
  card: {
    backgroundColor: 'rgba(17, 20, 29, 0.94)',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 6,
  },
  cardTitleOverview: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 16,
  },

  /* Overview Rows */
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  overviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 166, 35, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgePercentText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 16,
    color: '#F5A623',
  },
  badgeRupeeText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 18,
    color: '#F5A623',
  },
  overviewLabel: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  overviewValue: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 18,
    color: '#F5A623',
    marginLeft: 8,
  },
  overviewDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 12,
  },

  /* Document Top Bar */
  documentTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 166, 35, 0.5)',
    backgroundColor: 'rgba(11, 14, 22, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageNavButtonDisabled: {
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(11, 14, 22, 0.5)',
  },
  pageIndicatorText: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14.5,
    color: '#FFFFFF',
    marginHorizontal: 14,
  },
  pageIndicatorGold: {
    color: '#F5A623',
    fontFamily: 'Urbanist-Bold',
  },
  downloadButton: {
    padding: 6,
  },

  /* Document Viewport */
  documentViewport: {
    backgroundColor: 'rgba(11, 14, 22, 0.92)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
  },
  documentHeaderHeading: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  documentBodyParagraph: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.72)',
    lineHeight: 16.5,
    marginBottom: 10,
  },
  documentSectionTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 11.5,
    color: '#FFFFFF',
    marginTop: 4,
    marginBottom: 8,
    lineHeight: 15,
  },
  boldText: {
    fontFamily: 'Urbanist-Bold',
    color: '#FFFFFF',
  },

  /* Proceed CTA Button */
  proceedButton: {
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 18,
  },
  proceedGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  proceedTextActive: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 16.5,
    letterSpacing: 0.2,
    color: '#0B0D12',
    marginRight: 4,
  },

  /* Bottom Help Floating Card */
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 20, 29, 0.94)',
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

  /* TERMS MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'flex-end',
  },
  termsModalCard: {
    maxHeight: '86%',
    backgroundColor: '#0F121A',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  modalDragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  termsModalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  termsModalTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 22,
    color: '#FFFFFF',
  },
  termsModalTitleGold: {
    color: '#F5A623',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#F5A623',
    backgroundColor: 'rgba(11, 13, 18, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsScroll: {
    maxHeight: 380,
    marginBottom: 18,
  },
  termsBulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  bulletDotGold: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 16,
    color: '#F5A623',
    marginRight: 10,
    lineHeight: 20,
  },
  termsBulletText: {
    flex: 1,
    fontFamily: 'Urbanist-Regular',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.78)',
    lineHeight: 19,
  },
  boldGold: {
    fontFamily: 'Urbanist-Bold',
    color: '#F5A623',
  },
  boldWhite: {
    fontFamily: 'Urbanist-Bold',
    color: '#FFFFFF',
  },
  modalProceedButton: {
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
  },
  modalHelpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  modalHelpText: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.75)',
  },
});
