import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function RestaurantLocationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [address, setAddress] = useState(
    'Vandi Pathai Street Extension\nJyothi Nagar, Ekkatuthangal,\nChennai, Tamil Nadu 600032,\nIndia 600032'
  );

  const handleConfirmLocation = () => {
    // Navigate to Add Restaurant Location (Address Details)
    router.push('/restaurant-address-details');
  };

  const handleLocateMe = () => {
    // Trigger GPS locate action
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Map Background Texture */}
      <View style={styles.mapBackgroundWrapper}>
        <Image
          source={require('../../assets/images/user_map_texture.png')}
          style={styles.mapImage}
          resizeMode="cover"
        />

        {/* Ambient Dark Gradient Overlays for Readability */}
        <LinearGradient
          colors={[
            'rgba(7, 9, 14, 0.7)',
            'rgba(7, 9, 14, 0.2)',
            'rgba(7, 9, 14, 0.45)',
            'rgba(7, 9, 14, 0.92)',
          ]}
          locations={[0, 0.25, 0.65, 1]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
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

        {/* Center Section: Callout & Pin Graphic from assets/image copy 2.png */}
        <View style={styles.mapCenterContainer}>
          <View style={styles.centerCalloutImageWrapper}>
            <Image
              source={require('../../assets/image copy 2.png')}
              style={styles.centerCalloutImage}
              resizeMode="contain"
            />
          </View>

          {/* LOCATE ME Pill Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.locateMeButton}
            onPress={handleLocateMe}
          >
            <Ionicons
              name="locate"
              size={16}
              color="#F5A623"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.locateMeText}>LOCATE ME</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Location Confirmation Card / Sheet */}
        <View
          style={[
            styles.bottomSheetCard,
            { paddingBottom: Math.max(insets.bottom, 16) + 10 },
          ]}
        >
          {/* Top Gold Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Sheet Title */}
          <Text style={styles.sheetTitle}>
            Choose location <Text style={styles.sheetTitleGold}>on map</Text>
          </Text>

          {/* Dashed Separator */}
          <View style={styles.dashedDivider} />

          {/* Address Row with 3D Restaurant Thumbnail */}
          <View style={styles.addressRow}>
            {/* Left Column: Navigation Icon + Address */}
            <View style={styles.addressLeftColumn}>
              <View style={styles.navIconBadge}>
                <Ionicons name="navigate" size={17} color="#F5A623" />
              </View>
              <Text style={styles.addressText}>{address}</Text>
            </View>

            {/* Right Column: 3D Restaurant Thumbnail */}
            <View style={styles.storeImageWrapper}>
              <Image
                source={require('../../assets/image copy.png')}
                style={styles.storeImage}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* CTA Button: Yes, this is my Restaurant */}
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.confirmButton}
            onPress={handleConfirmLocation}
          >
            <LinearGradient
              colors={['#FDC830', '#F39C12', '#E67E22']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.confirmGradient}
            >
              <Text style={styles.confirmText}>
                Yes, this is my Restaurant
              </Text>
              <Ionicons name="arrow-forward" size={19} color="#0B0D12" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07090E',
  },
  mapBackgroundWrapper: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },

  /* Top Nav */
  topNav: {
    paddingTop: 18,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: '#F5A623',
    backgroundColor: 'rgba(11, 13, 18, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Map Center Pin & Callout Graphic */
  mapCenterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -10,
  },
  centerCalloutImageWrapper: {
    width: 220,
    height: 236,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCalloutImage: {
    width: '100%',
    height: '100%',
  },

  /* Locate Me Button */
  locateMeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: '#F5A623',
    backgroundColor: 'rgba(11, 14, 22, 0.92)',
    paddingHorizontal: 16,
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  locateMeText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 12,
    letterSpacing: 1.2,
    color: '#F5A623',
  },

  /* Bottom Sheet Card */
  bottomSheetCard: {
    backgroundColor: 'rgba(12, 15, 23, 0.98)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 12,
  },
  dragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F5A623',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 21,
    letterSpacing: -0.2,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  sheetTitleGold: {
    color: '#F5A623',
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  addressLeftColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginRight: 14,
  },
  navIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  addressText: {
    flex: 1,
    fontFamily: 'Urbanist-Medium',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.82)',
    lineHeight: 18,
  },
  storeImageWrapper: {
    width: 92,
    height: 62,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.35)',
    backgroundColor: '#0B0D12',
  },
  storeImage: {
    width: '100%',
    height: '100%',
  },

  /* Confirm Button */
  confirmButton: {
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
  },
  confirmGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  confirmText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 16.5,
    letterSpacing: 0.2,
    color: '#0B0D12',
    marginRight: 8,
  },
});
