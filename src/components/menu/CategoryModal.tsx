import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../../types/menu';

const COMMON_EMOJIS = ['🍔', '🍜', '🍦', '🥤', '🍟', '🍕', '🍰', '🥗', '☕', '🍗', '🥪', '🌮', '🍣', '🍛'];

interface CategoryModalProps {
  visible: boolean;
  categoryToEdit: Category | null;
  onClose: () => void;
  onSave: (categoryData: {
    name: string;
    description: string;
    icon: string;
    isActive: boolean;
  }) => Promise<void>;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  visible,
  categoryToEdit,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🍔');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setDescription(categoryToEdit.description || '');
      setIcon(categoryToEdit.icon || '🍔');
      setIsActive(categoryToEdit.isActive);
    } else {
      setName('');
      setDescription('');
      setIcon('🍔');
      setIsActive(true);
    }
    setErrors({});
  }, [categoryToEdit, visible]);

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        icon,
        isActive,
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconCircleText}>{icon}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.modalTitle}>
                  {categoryToEdit ? 'Edit Category' : 'Add New Category'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {categoryToEdit
                    ? 'Update category settings and visibility'
                    : 'Organize your dishes under clean categories'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Quick Icon Selector */}
            <Text style={styles.fieldLabel}>Category Icon / Badge</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiRow}>
              {COMMON_EMOJIS.map((emoji) => {
                const isSelected = icon === emoji;
                return (
                  <TouchableOpacity
                    key={emoji}
                    style={[styles.emojiBtn, isSelected && styles.emojiBtnActive]}
                    onPress={() => setIcon(emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Category Name */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>
                Category Name <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="e.g. Ice Cream, Gourmet Burgers, Wood-Fired Pizzas"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={name}
                onChangeText={(val) => {
                  setName(val);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
              />
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Briefly describe what makes this category special"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Status Toggle */}
            <View style={styles.statusRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.statusTitle}>Category Status</Text>
                <Text style={styles.statusSubtitle}>
                  {isActive
                    ? 'Active — Visible on customer menu'
                    : 'Inactive — Hidden from customer menu'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.toggleTrack, isActive ? styles.toggleTrackActive : styles.toggleTrackInactive]}
                onPress={() => setIsActive(!isActive)}
                activeOpacity={0.8}
              >
                <View style={[styles.toggleThumb, isActive ? styles.toggleThumbActive : styles.toggleThumbInactive]} />
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>
                {isSaving ? 'Saving...' : categoryToEdit ? 'Save Changes' : 'Create Category'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#0F121A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.2)',
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleText: {
    fontSize: 22,
  },
  modalTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  modalSubtitle: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  fieldLabel: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 8,
  },
  requiredStar: {
    color: '#EF4444',
  },
  emojiRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  emojiBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emojiBtnActive: {
    backgroundColor: 'rgba(245, 166, 35, 0.2)',
    borderColor: '#F5A623',
    transform: [{ scale: 1.05 }],
  },
  emojiText: {
    fontSize: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Urbanist-Medium',
    fontSize: 15,
    color: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 6,
  },
  statusTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  statusSubtitle: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 3,
    justifyContent: 'center',
  },
  toggleTrackActive: {
    backgroundColor: '#2ECC71',
  },
  toggleTrackInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  toggleThumbInactive: {
    alignSelf: 'flex-start',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginRight: 10,
  },
  cancelBtnText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 13,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F5A623',
  },
  saveBtnText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 14.5,
    color: '#07090E',
  },
});
