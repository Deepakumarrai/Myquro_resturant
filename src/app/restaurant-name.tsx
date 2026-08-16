import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function RestaurantNameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [restaurantName, setRestaurantName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSave = () => {
    if (!restaurantName.trim()) {
      setErrorMessage('Please enter your restaurant name');
      return;
    }
    setErrorMessage('');
    // Proceed to next step
    router.push('/onboarding-steps');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
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
              <Text style={styles.subtitle}>Before we start...</Text>
              <Text style={styles.title}>
                Let's add your{'\n'}restaurant{' '}
                <Text style={styles.titleGold}>name</Text>
              </Text>
            </View>

            {/* Main Form Container Card with Gold Outline */}
            <View style={styles.mainCard}>
              {/* Card Header Row */}
              <View style={styles.cardHeaderRow}>
                <View style={styles.storeIconBadge}>
                  <Ionicons name="storefront" size={24} color="#F5A623" />
                </View>
                <View style={styles.cardHeaderTextWrapper}>
                  <Text style={styles.cardTitle}>Enter restaurant name</Text>
                  <Text style={styles.cardSubtitle}>
                    This will be visible to your customers{'\n'}on the MyQuro app.
                  </Text>
                </View>
              </View>

              {/* Input Field */}
              <View
                style={[
                  styles.inputContainer,
                  errorMessage ? styles.inputContainerError : null,
                ]}
              >
                <Ionicons
                  name="storefront-outline"
                  size={19}
                  color="rgba(255, 255, 255, 0.45)"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter restaurant name"
                  placeholderTextColor="rgba(255, 255, 255, 0.35)"
                  value={restaurantName}
                  onChangeText={(text) => {
                    setRestaurantName(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              {/* Error Message if empty */}
              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              {/* Dashed Separator */}
              <View style={styles.dashedDivider} />

              {/* Note Section with 3D Store Illustration */}
              <View style={styles.noteRow}>
                <View style={styles.noteTextColumn}>
                  <View style={styles.noteTitleRow}>
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color="#F5A623"
                      style={styles.noteInfoIcon}
                    />
                    <Text style={styles.noteTitle}>Note:</Text>
                  </View>
                  <Text style={styles.noteDescription}>
                    This is the name customers{'\n'}will see on the MyQuro app.
                  </Text>
                </View>

                {/* 3D Restaurant Store Illustration */}
                <View style={styles.illustrationWrapper}>
                  <Image
                    source={require('../../assets/images/store_illustration_3d.png')}
                    style={styles.storeIllustration}
                    resizeMode="cover"
                  />
                </View>
              </View>

              {/* Save CTA Button */}
              <TouchableOpacity
                activeOpacity={0.88}
                style={styles.saveButton}
                onPress={handleSave}
              >
                <LinearGradient
                  colors={['#FDC830', '#F39C12', '#E67E22']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveGradient}
                >
                  <Text style={styles.saveText}>Save</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Bottom Full-Width Dashed Divider */}
            <View style={styles.bottomDashedLine} />

            {/* Bottom Help Row */}
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
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
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
    marginBottom: 24,
  },
  subtitle: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 28,
    lineHeight: 35,
    letterSpacing: -0.3,
    color: '#FFFFFF',
  },
  titleGold: {
    color: '#F5A623',
  },

  /* Main Card */
  mainCard: {
    backgroundColor: 'rgba(17, 20, 29, 0.94)',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 22,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  storeIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 166, 35, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardHeaderTextWrapper: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 16.5,
    color: '#FFFFFF',
    marginBottom: 3,
  },
  cardSubtitle: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.65)',
    lineHeight: 17,
  },

  /* Input Field */
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    backgroundColor: 'rgba(11, 14, 22, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  inputContainerError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Urbanist-Regular',
    paddingVertical: 0,
  },
  errorText: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    marginLeft: 4,
  },

  /* Dashed Divider */
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderStyle: 'dashed',
    marginVertical: 20,
  },

  /* Note Section */
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  noteTextColumn: {
    flex: 1,
    marginRight: 12,
  },
  noteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  noteInfoIcon: {
    marginRight: 6,
  },
  noteTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 14.5,
    color: '#F5A623',
  },
  noteDescription: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)',
    lineHeight: 16,
  },
  illustrationWrapper: {
    width: 104,
    height: 70,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.25)',
    backgroundColor: '#0B0D12',
  },
  storeIllustration: {
    width: '100%',
    height: '100%',
  },

  /* Save CTA Button */
  saveButton: {
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
  },
  saveGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  saveText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 17,
    letterSpacing: 0.2,
    color: '#0B0D12',
  },

  /* Bottom Help & Divider */
  bottomDashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
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
