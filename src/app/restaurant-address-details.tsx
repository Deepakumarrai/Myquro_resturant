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
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function RestaurantAddressDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Form State
  const [fullAddress, setFullAddress] = useState('');
  const [shopPlotNumber, setShopPlotNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [pincode, setPincode] = useState('600032');
  const [landmark, setLandmark] = useState('');

  // Audio / Photo State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([]);
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);

  // Errors State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleEditMapLocation = () => {
    router.back();
  };

  const handlePincodeChange = (text: string) => {
    const numericOnly = text.replace(/[^0-9]/g, '').slice(0, 6);
    setPincode(numericOnly);
    if (errors.pincode) {
      setErrors((prev) => ({ ...prev, pincode: '' }));
    }
  };

  const handleTakePhotoFromCamera = async () => {
    setIsPhotoModalVisible(false);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera access is required to take photos of your restaurant.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAttachedPhotos([...attachedPhotos, result.assets[0].uri]);
      }
    } catch (error) {
      console.log('Error launching camera:', error);
    }
  };

  const handleUploadFromLocalFolders = async () => {
    setIsPhotoModalVisible(false);
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Gallery access is required to upload photos from your local folders.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newUris = result.assets.map((asset) => asset.uri);
        setAttachedPhotos([...attachedPhotos, ...newUris]);
      }
    } catch (error) {
      console.log('Error picking images:', error);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setAttachedPhotos(attachedPhotos.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!fullAddress.trim()) {
      newErrors.fullAddress = 'Full Address is required';
    }

    if (!shopPlotNumber.trim()) {
      newErrors.shopPlotNumber = 'Shop / Plot number is required';
    }

    if (!floor.trim()) {
      newErrors.floor = 'Floor is required';
    }

    if (!buildingName.trim()) {
      newErrors.buildingName = 'Building / Complex name is required';
    }

    if (!pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (pincode.length !== 6) {
      newErrors.pincode = 'Pincode must be exact 6 digits';
    }

    if (!landmark.trim()) {
      newErrors.landmark = 'Landmark is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAddress = () => {
    if (validateForm()) {
      // Direct redirection back to Restaurant Information with location confirmed
      router.push({
        pathname: '/restaurant-information',
        params: {
          locationAdded: 'true',
          address: `${shopPlotNumber ? shopPlotNumber + ', ' : ''}${buildingName ? buildingName + ', ' : ''}Vandi Pathai St, Chennai`,
        },
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Subtle Vector Texture Background */}
      <View style={styles.backgroundTextureWrapper}>
        <Image
          source={require('../../assets/images/user_map_texture.png')}
          style={styles.backgroundTexture}
          resizeMode="cover"
        />
        <LinearGradient
          colors={[
            'rgba(7, 9, 14, 0.92)',
            'rgba(7, 9, 14, 0.85)',
            'rgba(7, 9, 14, 0.98)',
          ]}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 20) + 20 },
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
                Add <Text style={styles.headerTitleGold}>restaurant location</Text>
              </Text>
            </View>

            {/* CARD 1: Top Embedded Map Card with Edit Button */}
            <View style={styles.topMapCard}>
              <Image
                source={require('../../assets/images/user_map_texture.png')}
                style={styles.topMapImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['rgba(7, 9, 14, 0.2)', 'rgba(7, 9, 14, 0.65)']}
                style={StyleSheet.absoluteFillObject}
                pointerEvents="none"
              />

              {/* Glowing Center Pin Marker */}
              <View style={styles.topMapPinWrapper}>
                <Ionicons name="location" size={32} color="#F5A623" />
              </View>

              {/* Edit Map Location Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.editMapButton}
                onPress={handleEditMapLocation}
              >
                <Ionicons
                  name="create-outline"
                  size={16}
                  color="#F5A623"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.editMapText}>Edit Map Location</Text>
              </TouchableOpacity>
            </View>

            {/* CARD 2: Address Details */}
            <View style={styles.card}>
              {/* Card Header: Address Details */}
              <View style={styles.cardHeaderRow}>
                <View style={styles.iconBadge}>
                  <Ionicons name="location-outline" size={20} color="#F5A623" />
                </View>
                <View style={styles.cardHeaderTextWrapper}>
                  <Text style={styles.cardTitle}>Address Details</Text>
                  <Text style={styles.cardSubtitle}>
                    Provide accurate details to ensure timely delivery{'\n'}of food
                    to your customers
                  </Text>
                </View>
              </View>

              {/* Field 1: Full Address */}
              <View
                style={[
                  styles.inputContainer,
                  errors.fullAddress ? styles.inputContainerError : null,
                ]}
              >
                <Ionicons
                  name="business-outline"
                  size={19}
                  color="#F5A623"
                  style={styles.fieldIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Full Address*"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={fullAddress}
                  onChangeText={(t) => {
                    setFullAddress(t);
                    if (errors.fullAddress)
                      setErrors((p) => ({ ...p, fullAddress: '' }));
                  }}
                  autoCapitalize="words"
                />
              </View>
              {errors.fullAddress ? (
                <Text style={styles.errorText}>{errors.fullAddress}</Text>
              ) : null}

              {/* Field 2 & 3: Shop/Plot Number & Floor */}
              <View style={styles.twoColumnRow}>
                {/* Shop/Plot Number */}
                <View style={styles.shopPlotColumn}>
                  <View
                    style={[
                      styles.inputContainer,
                      errors.shopPlotNumber ? styles.inputContainerError : null,
                    ]}
                  >
                    <Text style={styles.hashSymbol}>#</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Shop/Plot Number*"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={shopPlotNumber}
                      onChangeText={(t) => {
                        setShopPlotNumber(t);
                        if (errors.shopPlotNumber)
                          setErrors((p) => ({ ...p, shopPlotNumber: '' }));
                      }}
                    />
                  </View>
                  {errors.shopPlotNumber ? (
                    <Text style={styles.errorText}>{errors.shopPlotNumber}</Text>
                  ) : null}
                </View>

                {/* Floor */}
                <View style={styles.floorColumn}>
                  <View
                    style={[
                      styles.inputContainer,
                      errors.floor ? styles.inputContainerError : null,
                    ]}
                  >
                    <Ionicons
                      name="layers-outline"
                      size={19}
                      color="#F5A623"
                      style={styles.fieldIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Floor*"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={floor}
                      onChangeText={(t) => {
                        setFloor(t);
                        if (errors.floor)
                          setErrors((p) => ({ ...p, floor: '' }));
                      }}
                    />
                  </View>
                  {errors.floor ? (
                    <Text style={styles.errorText}>{errors.floor}</Text>
                  ) : null}
                </View>
              </View>

              {/* Field 4: Building/Mall/Complex Name */}
              <View
                style={[
                  styles.inputContainer,
                  errors.buildingName ? styles.inputContainerError : null,
                ]}
              >
                <Ionicons
                  name="business-outline"
                  size={19}
                  color="#F5A623"
                  style={styles.fieldIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Building/Mall/Complex Name*"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={buildingName}
                  onChangeText={(t) => {
                    setBuildingName(t);
                    if (errors.buildingName)
                      setErrors((p) => ({ ...p, buildingName: '' }));
                  }}
                  autoCapitalize="words"
                />
              </View>
              {errors.buildingName ? (
                <Text style={styles.errorText}>{errors.buildingName}</Text>
              ) : null}

              {/* Field 5: Pincode */}
              <View
                style={[
                  styles.inputContainer,
                  errors.pincode ? styles.inputContainerError : null,
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={19}
                  color="#F5A623"
                  style={styles.fieldIcon}
                />
                <View style={styles.pincodeContent}>
                  <Text style={styles.pincodeLabel}>Pincode*</Text>
                  <TextInput
                    style={styles.pincodeInput}
                    placeholder="600032"
                    placeholderTextColor="rgba(255, 255, 255, 0.35)"
                    value={pincode}
                    onChangeText={handlePincodeChange}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              </View>
              {errors.pincode ? (
                <Text style={styles.errorText}>{errors.pincode}</Text>
              ) : null}
            </View>

            {/* CARD 3: Additional Information */}
            <View style={styles.card}>
              {/* Card Header: Additional Information */}
              <View style={styles.cardHeaderRow}>
                <View style={styles.iconBadge}>
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#F5A623"
                  />
                </View>
                <View style={styles.cardHeaderTextWrapper}>
                  <Text style={styles.cardTitle}>Additional Information</Text>
                  <Text style={styles.cardSubtitle}>
                    To further avoid delays and cancellations help delivery{'\n'}
                    partners reach you easily with this info
                  </Text>
                </View>
              </View>

              {/* Field 1: Landmark */}
              <View
                style={[
                  styles.inputContainer,
                  errors.landmark ? styles.inputContainerError : null,
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={19}
                  color="#F5A623"
                  style={styles.fieldIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Landmark*"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={landmark}
                  onChangeText={(t) => {
                    setLandmark(t);
                    if (errors.landmark)
                      setErrors((p) => ({ ...p, landmark: '' }));
                  }}
                />
              </View>
              {errors.landmark ? (
                <Text style={styles.errorText}>{errors.landmark}</Text>
              ) : null}

              {/* Field 2: Directions to reach (Voice Recorder) Box */}
              <View style={styles.voiceRecorderBox}>
                <View style={styles.voiceHeaderRow}>
                  <View style={styles.micBadge}>
                    <Ionicons name="mic-outline" size={18} color="#F5A623" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.voiceTitle}>
                      Directions to reach (Voice Recorder)
                    </Text>
                    <Text style={styles.voiceSubtitle}>
                      (eg. take the first left next to red gate...)
                    </Text>
                  </View>
                </View>

                {/* Audio Player / Recorder Pill Bar */}
                <View style={styles.audioPlayerBar}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.playButton}
                    onPress={() => setIsPlayingAudio(!isPlayingAudio)}
                  >
                    <Ionicons
                      name={isPlayingAudio ? 'pause' : 'play'}
                      size={16}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>

                  <Text style={styles.audioTimeText}>0:00</Text>

                  {/* Audio Progress Track */}
                  <View style={styles.audioTrackContainer}>
                    <View style={styles.audioTrackActive} />
                  </View>

                  {/* Record Mic Icon */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setIsRecording(!isRecording)}
                  >
                    <Ionicons
                      name={isRecording ? 'mic' : 'mic-outline'}
                      size={20}
                      color="#F5A623"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Field 3: Add photos of restaurant front */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.addPhotosButton}
                onPress={() => setIsPhotoModalVisible(true)}
              >
                <View style={styles.addPhotosLeft}>
                  <Ionicons name="camera-outline" size={20} color="#F5A623" />
                  <Text style={styles.addPhotosText}>
                    {attachedPhotos.length > 0
                      ? `Photo attached (${attachedPhotos.length})`
                      : 'Add photos of restaurant front'}
                  </Text>
                </View>
                <Ionicons
                  name={
                    attachedPhotos.length > 0
                      ? 'checkmark-circle'
                      : 'images-outline'
                  }
                  size={20}
                  color="#F5A623"
                />
              </TouchableOpacity>

              {/* Attached Photos Thumbnails List */}
              {attachedPhotos.length > 0 && (
                <View style={styles.photoThumbnailsRow}>
                  {attachedPhotos.map((uri, index) => (
                    <View key={index} style={styles.thumbnailWrapper}>
                      <Image
                        source={{ uri }}
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.removePhotoButton}
                        onPress={() => handleRemovePhoto(index)}
                      >
                        <Ionicons name="close" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Save Address Details CTA Button */}
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.saveButton}
              onPress={handleSaveAddress}
            >
              <LinearGradient
                colors={['#FDC830', '#F39C12', '#E67E22']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveGradient}
              >
                <Text style={styles.saveText}>Save Address Details</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* PHOTO SELECTION MODAL (Camera vs Local Folders) */}
      <Modal
        visible={isPhotoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPhotoModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setIsPhotoModalVisible(false)}
        >
          <View style={styles.photoModalCard}>
            <View style={styles.modalDragHandle} />

            <Text style={styles.photoModalTitle}>Add Restaurant Photos</Text>
            <Text style={styles.photoModalSubtitle}>
              Upload photos of your storefront to help customers and riders locate you easily.
            </Text>

            {/* Option 1: Take Photo from Camera */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.photoOptionButton}
              onPress={handleTakePhotoFromCamera}
            >
              <View style={styles.photoOptionIconBadge}>
                <Ionicons name="camera" size={24} color="#F5A623" />
              </View>
              <View style={styles.photoOptionTextWrapper}>
                <Text style={styles.photoOptionTitle}>Take a photo from camera</Text>
                <Text style={styles.photoOptionDescription}>
                  Capture storefront right now using camera
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#F5A623" />
            </TouchableOpacity>

            {/* Option 2: Upload from Local Folders / Gallery */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.photoOptionButton}
              onPress={handleUploadFromLocalFolders}
            >
              <View style={styles.photoOptionIconBadge}>
                <Ionicons name="images" size={24} color="#F5A623" />
              </View>
              <View style={styles.photoOptionTextWrapper}>
                <Text style={styles.photoOptionTitle}>Upload from local folders</Text>
                <Text style={styles.photoOptionDescription}>
                  Choose photo from gallery or device files
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#F5A623" />
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.photoModalCancelButton}
              onPress={() => setIsPhotoModalVisible(false)}
            >
              <Text style={styles.photoModalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
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
  backgroundTextureWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundTexture: {
    width: '100%',
    height: '100%',
    opacity: 0.12,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
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
    backgroundColor: 'rgba(11, 13, 18, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Header Section */
  headerRow: {
    marginBottom: 18,
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

  /* Top Map Card */
  topMapCard: {
    height: 195,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    marginBottom: 16,
    position: 'relative',
    backgroundColor: '#0B0D12',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },
  topMapImage: {
    width: '100%',
    height: '100%',
  },
  topMapPinWrapper: {
    position: 'absolute',
    top: '38%',
    left: '46%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editMapButton: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: '#F5A623',
    backgroundColor: 'rgba(11, 14, 22, 0.9)',
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  editMapText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 12.5,
    color: '#F5A623',
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
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 166, 35, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderTextWrapper: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 17,
    color: '#FFFFFF',
  },
  cardSubtitle: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)',
    lineHeight: 16,
    marginTop: 2,
  },

  /* Input Container */
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: 'rgba(11, 14, 22, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 13,
    paddingHorizontal: 14,
    marginBottom: 6,
  },
  inputContainerError: {
    borderColor: '#EF4444',
  },
  fieldIcon: {
    marginRight: 10,
  },
  hashSymbol: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 18,
    color: '#F5A623',
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#FFFFFF',
    fontSize: 13.5,
    fontFamily: 'Urbanist-Medium',
    paddingVertical: 0,
  },
  errorText: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 10,
    marginLeft: 4,
  },

  /* Two Column Row */
  twoColumnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shopPlotColumn: {
    flex: 1.25,
    marginRight: 8,
  },
  floorColumn: {
    flex: 1,
  },

  /* Pincode Field */
  pincodeContent: {
    flex: 1,
    justifyContent: 'center',
  },
  pincodeLabel: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  pincodeInput: {
    height: 26,
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Urbanist-Bold',
    paddingVertical: 0,
  },

  /* Voice Recorder Box */
  voiceRecorderBox: {
    backgroundColor: 'rgba(11, 14, 22, 0.92)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 14,
    marginBottom: 12,
  },
  voiceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  micBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  voiceTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  voiceSubtitle: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.55)',
    marginTop: 2,
  },
  audioPlayerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(17, 20, 29, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
  },
  playButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioTimeText: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 8,
    marginRight: 10,
  },
  audioTrackContainer: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    marginRight: 12,
  },
  audioTrackActive: {
    width: '25%',
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#F5A623',
  },

  /* Add Photos Button */
  addPhotosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(11, 14, 22, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 14,
  },
  addPhotosLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addPhotosText: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.78)',
    marginLeft: 10,
  },

  /* Photo Thumbnails */
  photoThumbnailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  thumbnailWrapper: {
    width: 68,
    height: 68,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#F5A623',
    marginRight: 10,
    marginBottom: 10,
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Save CTA Button */
  saveButton: {
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 16,
  },
  saveGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  saveText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 16.5,
    letterSpacing: 0.2,
    color: '#0B0D12',
  },

  /* PHOTO SELECTION MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'flex-end',
  },
  photoModalCard: {
    backgroundColor: '#0F121A',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 28,
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
    backgroundColor: '#F5A623',
    alignSelf: 'center',
    marginBottom: 16,
  },
  photoModalTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  photoModalSubtitle: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.65)',
    lineHeight: 17,
    marginBottom: 20,
  },
  photoOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 20, 29, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.35)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  photoOptionIconBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  photoOptionTextWrapper: {
    flex: 1,
  },
  photoOptionTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  photoOptionDescription: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  photoModalCancelButton: {
    height: 48,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  photoModalCancelText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
