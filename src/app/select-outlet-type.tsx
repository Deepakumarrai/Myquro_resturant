import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SelectOutletTypeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSelectCategory = (categoryTitle: string, categoryLabel: string) => {
    // Navigate back to Restaurant Documents with selected category
    router.push({
      pathname: '/restaurant-documents',
      params: {
        outletType: `${categoryTitle}: ${categoryLabel}`,
      },
    });
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

          {/* Header Title */}
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>
              Select your <Text style={styles.headerTitleGold}>outlet type</Text>
            </Text>
            <Text style={styles.headerSubtitle}>
              Choose the outlet type that best describes your business.
            </Text>
          </View>

          {/* CARD 1: Category I */}
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.categoryCard}
            onPress={() =>
              handleSelectCategory('Category I', 'Freshly prepared food items only')
            }
          >
            <View style={styles.categoryTopRow}>
              <Text style={styles.categoryTitle}>Category I</Text>
              <View style={styles.selectButtonRow}>
                <Text style={styles.selectText}>Select</Text>
                <Ionicons name="chevron-forward" size={16} color="#F5A623" />
              </View>
            </View>

            <Text style={styles.categoryDescription}>
              Sells freshly prepared food items only.{'\n'}Does not sell any
              packed item.
            </Text>

            <View style={styles.dashedDivider} />

            <Text style={styles.categoryFooterNote}>
              <Text style={styles.footerHighlight}>MyQuro</Text> will pay the
              GST on your behalf
            </Text>
          </TouchableOpacity>

          {/* CARD 2: Category II */}
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.categoryCard}
            onPress={() =>
              handleSelectCategory('Category II', 'IceCreams, bakery & packed items')
            }
          >
            <View style={styles.categoryTopRow}>
              <Text style={styles.categoryTitle}>Category II</Text>
              <View style={styles.selectButtonRow}>
                <Text style={styles.selectText}>Select</Text>
                <Ionicons name="chevron-forward" size={16} color="#F5A623" />
              </View>
            </View>

            <Text style={styles.categoryDescription}>
              Sells IceCreams, bakery products, sweets{'\n'}or other packed
              items only.
            </Text>

            <View style={styles.dashedDivider} />

            <Text style={styles.categoryFooterNote}>
              The <Text style={styles.footerHighlight}>outlet itself</Text> will
              pay GST on these orders.
            </Text>
          </TouchableOpacity>

          {/* CARD 3: Category III */}
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.categoryCard}
            onPress={() =>
              handleSelectCategory('Category III', 'Freshly prepared & packed items')
            }
          >
            <View style={styles.categoryTopRow}>
              <Text style={styles.categoryTitle}>Category III</Text>
              <View style={styles.selectButtonRow}>
                <Text style={styles.selectText}>Select</Text>
                <Ionicons name="chevron-forward" size={16} color="#F5A623" />
              </View>
            </View>

            <Text style={styles.categoryDescription}>
              Sells both freshly prepared and{'\n'}packed food items.
            </Text>

            <View style={styles.dashedDivider} />

            <Text style={styles.categoryFooterNote}>
              <Text style={styles.footerHighlight}>MyQuro</Text> will pay GST
              only on sales of{'\n'}freshly prepared food items.
            </Text>
          </TouchableOpacity>

          {/* Bottom Help Card */}
          <View style={styles.helpCard}>
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
    marginBottom: 24,
  },
  headerTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 27,
    letterSpacing: -0.3,
    color: '#FFFFFF',
  },
  headerTitleGold: {
    color: '#F5A623',
  },
  headerSubtitle: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 6,
    lineHeight: 18,
  },

  /* Category Card */
  categoryCard: {
    backgroundColor: 'rgba(17, 20, 29, 0.94)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 22,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 6,
  },
  categoryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 19,
    color: '#FFFFFF',
  },
  selectButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 14.5,
    color: '#F5A623',
    marginRight: 4,
  },
  categoryDescription: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.72)',
    lineHeight: 20,
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.35)',
    borderStyle: 'dashed',
    marginVertical: 14,
  },
  categoryFooterNote: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 17,
  },
  footerHighlight: {
    fontFamily: 'Urbanist-Bold',
    color: '#F5A623',
  },

  /* Bottom Help Floating Card */
  helpCard: {
    backgroundColor: 'rgba(17, 20, 29, 0.75)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 8,
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
