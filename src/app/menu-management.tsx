import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  StatusBar,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMenuStore } from '../state/menuStore';
import { Category, Dish } from '../types/menu';
import { CategoryModal } from '../components/menu/CategoryModal';

const { width } = Dimensions.get('window');

const FILTER_OPTIONS: ('All' | 'Available' | 'Unavailable' | 'Veg' | 'Non-Veg' | 'With Variants' | 'With Add-ons')[] = [
  'All',
  'Available',
  'Unavailable',
  'Veg',
  'Non-Veg',
  'With Variants',
  'With Add-ons',
];

export default function MenuManagementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    categories,
    dishes,
    isLoading,
    loadMenu,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    toggleCategoryStatus,
    deleteDish,
    duplicateDish,
    toggleDishAvailability,
    reorderDishes,
    bulkUpdateDishStatus,
    bulkDeleteDishes,
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    selectedDishIdsForBulk,
    toggleSelectDishForBulk,
    selectAllDishesForBulk,
    clearBulkSelection,
    getMenuStats,
    getFilteredDishes,
    isDishAvailableNow,
  } = useMenuStore();

  // Category Modal State
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  // Bulk Selection Mode
  const [isBulkMode, setIsBulkMode] = useState(false);

  // Collapsed Category IDs map (Default: all expanded)
  const [collapsedCategoryIds, setCollapsedCategoryIds] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    loadMenu();
  }, []);

  const stats = getMenuStats();
  const filteredDishes = getFilteredDishes();

  // Group filtered dishes by category
  const dishesByCategoryMap = useMemo(() => {
    const map = new Map<string, Dish[]>();
    categories.forEach((cat) => {
      const catDishes = filteredDishes
        .filter((d) => d.categoryId === cat.id)
        .sort((a, b) => a.displayOrder - b.displayOrder);
      map.set(cat.id, catDishes);
    });
    return map;
  }, [categories, filteredDishes]);

  // Toggle Category Collapse
  const toggleCollapseCategory = (catId: string) => {
    setCollapsedCategoryIds((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Reorder Category (Up/Down)
  const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const ordered = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
    const temp = ordered[index];
    ordered[index] = ordered[targetIndex];
    ordered[targetIndex] = temp;

    await reorderCategories(ordered.map((c) => c.id));
  };

  // Reorder Dish (Up/Down within category)
  const handleMoveDish = async (categoryId: string, dishIndex: number, direction: 'up' | 'down') => {
    const catDishes = (dishesByCategoryMap.get(categoryId) || []).sort(
      (a, b) => a.displayOrder - b.displayOrder
    );
    const targetIndex = direction === 'up' ? dishIndex - 1 : dishIndex + 1;
    if (targetIndex < 0 || targetIndex >= catDishes.length) return;

    const ordered = [...catDishes];
    const temp = ordered[dishIndex];
    ordered[dishIndex] = ordered[targetIndex];
    ordered[targetIndex] = temp;

    await reorderDishes(categoryId, ordered.map((d) => d.id));
  };

  // Delete Category Confirmation
  const handleDeleteCategory = (cat: Category) => {
    const dishCount = dishes.filter((d) => d.categoryId === cat.id).length;
    Alert.alert(
      `Delete "${cat.name}" Category?`,
      `This category currently has ${dishCount} dish(es). Deleting it will also remove all its dishes. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCategory(cat.id),
        },
      ]
    );
  };

  // Delete Dish Confirmation
  const handleDeleteDish = (dish: Dish) => {
    Alert.alert(
      `Delete "${dish.name}"?`,
      'Are you sure you want to permanently remove this dish from your menu?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Dish',
          style: 'destructive',
          onPress: () => deleteDish(dish.id),
        },
      ]
    );
  };

  // Duplicate Dish Handler
  const handleDuplicateDish = async (dishId: string) => {
    try {
      const duplicated = await duplicateDish(dishId);
      if (duplicated) {
        Alert.alert('Dish Duplicated', `"${duplicated.name}" has been created. You can now edit its details.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Bulk Actions
  const handleBulkActivate = async () => {
    if (selectedDishIdsForBulk.length === 0) return;
    await bulkUpdateDishStatus(selectedDishIdsForBulk, true);
    setIsBulkMode(false);
  };

  const handleBulkDeactivate = async () => {
    if (selectedDishIdsForBulk.length === 0) return;
    await bulkUpdateDishStatus(selectedDishIdsForBulk, false);
    setIsBulkMode(false);
  };

  const handleBulkDelete = () => {
    if (selectedDishIdsForBulk.length === 0) return;
    Alert.alert(
      `Delete ${selectedDishIdsForBulk.length} Selected Dishes?`,
      'This will permanently delete the selected dishes from your menu.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Delete ${selectedDishIdsForBulk.length} Dishes`,
          style: 'destructive',
          onPress: async () => {
            await bulkDeleteDishes(selectedDishIdsForBulk);
            setIsBulkMode(false);
          },
        },
      ]
    );
  };

  const getDietaryBadge = (type: string) => {
    switch (type) {
      case 'veg':
        return { color: '#10B981', label: 'Veg' };
      case 'non-veg':
        return { color: '#EF4444', label: 'Non-Veg' };
      case 'egg':
        return { color: '#F59E0B', label: 'Egg' };
      case 'vegan':
        return { color: '#06B6D4', label: 'Vegan' };
      default:
        return { color: '#10B981', label: 'Veg' };
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Top Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color="#F5A623" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Menu Management</Text>
            <Text style={styles.headerSubtitle}>Category → Dishes → Variants → Add-ons</Text>
          </View>

          {/* Quick Actions (Preview Menu & Add Category) */}
          <View style={styles.headerActionBtns}>
            <TouchableOpacity
              style={styles.previewBtn}
              onPress={() => router.push('/menu-preview')}
              activeOpacity={0.8}
            >
              <Ionicons name="eye-outline" size={16} color="#F5A623" />
              <Text style={styles.previewBtnText}>Preview</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addCategoryBtn}
              onPress={() => {
                setCategoryToEdit(null);
                setIsCategoryModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color="#07090E" />
              <Text style={styles.addCategoryBtnText}>Category</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Metrics Cards */}
        <View style={styles.statsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalCategories}</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#FFFFFF' }]}>{stats.totalDishes}</Text>
              <Text style={styles.statLabel}>Total Dishes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#10B981' }]}>{stats.activeDishes}</Text>
              <Text style={styles.statLabel}>Active Online</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#EF4444' }]}>{stats.inactiveDishes}</Text>
              <Text style={styles.statLabel}>Unavailable</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#F5A623' }]}>{stats.unavailableToday}</Text>
              <Text style={styles.statLabel}>Out of Hours</Text>
            </View>
          </ScrollView>
        </View>

        {/* Search & Filter Controls */}
        <View style={styles.filterSection}>
          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.4)" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search dish, category or description..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Bulk Mode Toggle */}
            <TouchableOpacity
              style={[styles.bulkModeBtn, isBulkMode && styles.bulkModeBtnActive]}
              onPress={() => {
                const next = !isBulkMode;
                setIsBulkMode(next);
                if (!next) clearBulkSelection();
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isBulkMode ? 'checkbox' : 'checkbox-outline'}
                size={18}
                color={isBulkMode ? '#07090E' : '#F5A623'}
              />
              <Text style={[styles.bulkModeText, isBulkMode && styles.bulkModeTextActive]}>
                {isBulkMode ? 'Done' : 'Bulk'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipsRow}>
            {FILTER_OPTIONS.map((filter) => {
              const isActive = selectedFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setSelectedFilter(filter)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Bulk Action Floating Bar */}
        {isBulkMode && (
          <View style={styles.bulkActionBar}>
            <View style={styles.bulkCountRow}>
              <Text style={styles.bulkCountText}>
                {selectedDishIdsForBulk.length} Selected
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (selectedDishIdsForBulk.length === filteredDishes.length) {
                    clearBulkSelection();
                  } else {
                    selectAllDishesForBulk(filteredDishes.map((d) => d.id));
                  }
                }}
              >
                <Text style={styles.selectAllText}>
                  {selectedDishIdsForBulk.length === filteredDishes.length
                    ? 'Deselect All'
                    : 'Select All'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bulkBtnsRow}>
              <TouchableOpacity
                style={[styles.bulkActionBtn, { backgroundColor: '#10B981' }]}
                onPress={handleBulkActivate}
                disabled={selectedDishIdsForBulk.length === 0}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
                <Text style={styles.bulkBtnText}>Activate</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.bulkActionBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
                onPress={handleBulkDeactivate}
                disabled={selectedDishIdsForBulk.length === 0}
              >
                <Ionicons name="pause-circle-outline" size={16} color="#FFFFFF" />
                <Text style={styles.bulkBtnText}>Deactivate</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.bulkActionBtn, { backgroundColor: '#EF4444' }]}
                onPress={handleBulkDelete}
                disabled={selectedDishIdsForBulk.length === 0}
              >
                <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                <Text style={styles.bulkBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Categories & Dishes List */}
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {categories.length === 0 ? (
            <View style={styles.emptyCategoriesView}>
              <Ionicons name="fast-food-outline" size={48} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyCategoriesTitle}>No Categories Created</Text>
              <Text style={styles.emptyCategoriesSubtitle}>
                Get started by creating your first food category (e.g. Burgers, Ice Cream, Pizzas).
              </Text>
              <TouchableOpacity
                style={styles.createFirstCatBtn}
                onPress={() => {
                  setCategoryToEdit(null);
                  setIsCategoryModalVisible(true);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={18} color="#07090E" />
                <Text style={styles.createFirstCatBtnText}>+ Add First Category</Text>
              </TouchableOpacity>
            </View>
          ) : (
            categories
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((cat, catIndex) => {
                const catDishes = dishesByCategoryMap.get(cat.id) || [];
                const isCollapsed = !!collapsedCategoryIds[cat.id];

                return (
                  <View key={cat.id} style={styles.categoryCard}>
                    {/* Category Header Row */}
                    <View style={styles.categoryHeader}>
                      <TouchableOpacity
                        style={styles.catTitlePressable}
                        onPress={() => toggleCollapseCategory(cat.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.catEmoji}>{cat.icon || '📁'}</Text>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                          <View style={styles.catNameRow}>
                            <Text style={styles.catName}>{cat.name}</Text>
                            <View
                              style={[
                                styles.catStatusPill,
                                cat.isActive ? styles.catStatusPillActive : styles.catStatusPillInactive,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.catStatusText,
                                  cat.isActive ? styles.catStatusTextActive : styles.catStatusTextInactive,
                                ]}
                              >
                                {cat.isActive ? 'Active' : 'Inactive'}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.catDishCount}>
                            {catDishes.length} {catDishes.length === 1 ? 'Dish' : 'Dishes'}
                          </Text>
                        </View>
                        <Ionicons
                          name={isCollapsed ? 'chevron-down' : 'chevron-up'}
                          size={20}
                          color="rgba(255,255,255,0.4)"
                        />
                      </TouchableOpacity>

                      {/* Category Action Icons */}
                      <View style={styles.catActionToolsRow}>
                        {/* Move Up */}
                        <TouchableOpacity
                          style={[styles.catToolBtn, catIndex === 0 && { opacity: 0.3 }]}
                          onPress={() => handleMoveCategory(catIndex, 'up')}
                          disabled={catIndex === 0}
                        >
                          <Ionicons name="arrow-up" size={15} color="rgba(255,255,255,0.6)" />
                        </TouchableOpacity>

                        {/* Move Down */}
                        <TouchableOpacity
                          style={[
                            styles.catToolBtn,
                            catIndex === categories.length - 1 && { opacity: 0.3 },
                          ]}
                          onPress={() => handleMoveCategory(catIndex, 'down')}
                          disabled={catIndex === categories.length - 1}
                        >
                          <Ionicons name="arrow-down" size={15} color="rgba(255,255,255,0.6)" />
                        </TouchableOpacity>

                        {/* Toggle Active/Inactive */}
                        <TouchableOpacity
                          style={styles.catToolBtn}
                          onPress={() => toggleCategoryStatus(cat.id)}
                        >
                          <Ionicons
                            name={cat.isActive ? 'eye-outline' : 'eye-off-outline'}
                            size={16}
                            color={cat.isActive ? '#10B981' : '#EF4444'}
                          />
                        </TouchableOpacity>

                        {/* Edit Category */}
                        <TouchableOpacity
                          style={styles.catToolBtn}
                          onPress={() => {
                            setCategoryToEdit(cat);
                            setIsCategoryModalVisible(true);
                          }}
                        >
                          <Ionicons name="create-outline" size={16} color="#F5A623" />
                        </TouchableOpacity>

                        {/* Delete Category */}
                        <TouchableOpacity
                          style={styles.catToolBtn}
                          onPress={() => handleDeleteCategory(cat)}
                        >
                          <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        </TouchableOpacity>

                        {/* Add Dish inside this Category */}
                        <TouchableOpacity
                          style={styles.addDishSmallBtn}
                          onPress={() => router.push(`/dish-editor?categoryId=${cat.id}`)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="add" size={14} color="#07090E" />
                          <Text style={styles.addDishSmallBtnText}>Add Dish</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Category Dishes List (if expanded) */}
                    {!isCollapsed && (
                      <View style={styles.dishesListWrapper}>
                        {catDishes.length === 0 ? (
                          <View style={styles.emptyDishesBox}>
                            <Text style={styles.emptyDishesText}>No dishes added yet in {cat.name}</Text>
                            <TouchableOpacity
                              style={styles.addFirstDishBtn}
                              onPress={() => router.push(`/dish-editor?categoryId=${cat.id}`)}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="add-circle-outline" size={16} color="#F5A623" />
                              <Text style={styles.addFirstDishBtnText}>+ Add Dish to {cat.name}</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          catDishes.map((dish, dishIndex) => {
                            const isAvailableNow = isDishAvailableNow(dish);
                            const dietaryBadge = getDietaryBadge(dish.dietaryType);
                            const isBulkSelected = selectedDishIdsForBulk.includes(dish.id);

                            return (
                              <View
                                key={dish.id}
                                style={[
                                  styles.dishItemCard,
                                  !dish.isAvailable && styles.dishItemCardUnavailable,
                                  isBulkSelected && styles.dishItemCardSelected,
                                ]}
                              >
                                {/* Bulk Checkbox (if in bulk mode) */}
                                {isBulkMode && (
                                  <TouchableOpacity
                                    style={styles.bulkItemCheckbox}
                                    onPress={() => toggleSelectDishForBulk(dish.id)}
                                  >
                                    <Ionicons
                                      name={isBulkSelected ? 'checkbox' : 'square-outline'}
                                      size={20}
                                      color={isBulkSelected ? '#F5A623' : 'rgba(255,255,255,0.4)'}
                                    />
                                  </TouchableOpacity>
                                )}

                                {/* Dish Image Thumbnail */}
                                {dish.image ? (
                                  <Image
                                    source={{ uri: dish.image }}
                                    style={styles.dishThumb}
                                    resizeMode="cover"
                                  />
                                ) : (
                                  <View style={styles.dishThumbPlaceholder}>
                                    <Ionicons name="restaurant-outline" size={18} color="rgba(255,255,255,0.3)" />
                                  </View>
                                )}

                                {/* Dish Details */}
                                <View style={styles.dishDetailsColumn}>
                                  {/* Dietary Badge & Name */}
                                  <View style={styles.dishTitleRow}>
                                    <View
                                      style={[
                                        styles.dietaryMiniSquare,
                                        { borderColor: dietaryBadge.color },
                                      ]}
                                    >
                                      <View
                                        style={[
                                          styles.dietaryMiniDot,
                                          { backgroundColor: dietaryBadge.color },
                                        ]}
                                      />
                                    </View>
                                    <Text style={styles.dishItemName} numberOfLines={1}>
                                      {dish.name}
                                    </Text>
                                  </View>

                                  {/* Pricing & Badges */}
                                  <View style={styles.dishPriceBadgesRow}>
                                    <Text style={styles.dishItemPrice}>
                                      {dish.hasVariants && dish.variants.length > 0
                                        ? `From ₹${Math.min(...dish.variants.map((v) => v.price))}`
                                        : `₹${dish.basePrice}`}
                                    </Text>

                                    {dish.hasVariants && dish.variants.length > 0 && (
                                      <View style={styles.variantBadgePill}>
                                        <Text style={styles.variantBadgePillText}>
                                          {dish.variants.length} Variants
                                        </Text>
                                      </View>
                                    )}

                                    {dish.customizationGroups.length > 0 && (
                                      <View style={styles.addonBadgePill}>
                                        <Text style={styles.addonBadgePillText}>
                                          {dish.customizationGroups.reduce(
                                            (acc, g) => acc + g.addOns.length,
                                            0
                                          )}{' '}
                                          Add-ons
                                        </Text>
                                      </View>
                                    )}
                                  </View>

                                  {/* Schedule Notice if active */}
                                  {dish.hasSchedule && (
                                    <View style={styles.scheduleTagRow}>
                                      <Ionicons name="time-outline" size={11} color="#F5A623" />
                                      <Text style={styles.scheduleTagText}>
                                        {dish.scheduleStartTime} - {dish.scheduleEndTime}
                                      </Text>
                                    </View>
                                  )}
                                </View>

                                {/* Quick Availability Toggle & Dish Actions */}
                                <View style={styles.dishActionsColumn}>
                                  {/* Quick Availability Switch */}
                                  <TouchableOpacity
                                    style={[
                                      styles.quickAvailTrack,
                                      dish.isAvailable
                                        ? styles.quickAvailTrackActive
                                        : styles.quickAvailTrackInactive,
                                    ]}
                                    onPress={() => toggleDishAvailability(dish.id)}
                                    activeOpacity={0.8}
                                  >
                                    <View
                                      style={[
                                        styles.quickAvailThumb,
                                        dish.isAvailable
                                          ? styles.quickAvailThumbActive
                                          : styles.quickAvailThumbInactive,
                                      ]}
                                    />
                                  </TouchableOpacity>
                                  <Text
                                    style={[
                                      styles.quickAvailLabel,
                                      dish.isAvailable
                                        ? styles.quickAvailLabelActive
                                        : styles.quickAvailLabelInactive,
                                    ]}
                                  >
                                    {dish.isAvailable ? 'In Stock' : 'Out of Stock'}
                                  </Text>

                                  {/* Tools: Edit, Duplicate, Delete, Reorder */}
                                  <View style={styles.dishToolsGrid}>
                                    <TouchableOpacity
                                      style={styles.dishToolBtn}
                                      onPress={() =>
                                        router.push(`/dish-editor?dishId=${dish.id}&categoryId=${cat.id}`)
                                      }
                                    >
                                      <Ionicons name="create-outline" size={15} color="#F5A623" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                      style={styles.dishToolBtn}
                                      onPress={() => handleDuplicateDish(dish.id)}
                                    >
                                      <Ionicons name="copy-outline" size={15} color="#38BDF8" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                      style={styles.dishToolBtn}
                                      onPress={() => handleDeleteDish(dish)}
                                    >
                                      <Ionicons name="trash-outline" size={15} color="#EF4444" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                      style={[styles.dishToolBtn, dishIndex === 0 && { opacity: 0.3 }]}
                                      onPress={() => handleMoveDish(cat.id, dishIndex, 'up')}
                                      disabled={dishIndex === 0}
                                    >
                                      <Ionicons
                                        name="chevron-up"
                                        size={15}
                                        color="rgba(255,255,255,0.6)"
                                      />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                      style={[
                                        styles.dishToolBtn,
                                        dishIndex === catDishes.length - 1 && { opacity: 0.3 },
                                      ]}
                                      onPress={() => handleMoveDish(cat.id, dishIndex, 'down')}
                                      disabled={dishIndex === catDishes.length - 1}
                                    >
                                      <Ionicons
                                        name="chevron-down"
                                        size={15}
                                        color="rgba(255,255,255,0.6)"
                                      />
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              </View>
                            );
                          })
                        )}
                      </View>
                    )}
                  </View>
                );
              })
          )}
        </ScrollView>

        {/* Category Create / Edit Modal */}
        <CategoryModal
          visible={isCategoryModalVisible}
          categoryToEdit={categoryToEdit}
          onClose={() => setIsCategoryModalVisible(false)}
          onSave={async (categoryData) => {
            if (categoryToEdit) {
              await updateCategory(categoryToEdit.id, categoryData);
            } else {
              await addCategory(categoryData);
            }
          }}
        />
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  backBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 10,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 1,
  },
  headerActionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  previewBtnText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 12,
    color: '#F5A623',
    marginLeft: 4,
  },
  addCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5A623',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addCategoryBtnText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 12,
    color: '#07090E',
    marginLeft: 2,
  },
  statsContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statsScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 85,
  },
  statValue: {
    fontFamily: 'Urbanist-ExtraBold',
    fontSize: 18,
    color: '#F5A623',
  },
  statLabel: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Urbanist-Medium',
    fontSize: 13.5,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  bulkModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bulkModeBtnActive: {
    backgroundColor: '#F5A623',
    borderColor: '#F5A623',
  },
  bulkModeText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 12,
    color: '#F5A623',
    marginLeft: 4,
  },
  bulkModeTextActive: {
    color: '#07090E',
  },
  filterChipsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
    borderColor: '#F5A623',
  },
  filterChipText: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.65)',
  },
  filterChipTextActive: {
    fontFamily: 'Urbanist-Bold',
    color: '#F5A623',
  },
  bulkActionBar: {
    backgroundColor: '#1A1D26',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.3)',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
  },
  bulkCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bulkCountText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  selectAllText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 12,
    color: '#F5A623',
  },
  bulkBtnsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bulkActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
  },
  bulkBtnText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  mainScroll: {
    flex: 1,
    paddingTop: 10,
  },
  emptyCategoriesView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyCategoriesTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 12,
  },
  emptyCategoriesSubtitle: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  createFirstCatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5A623',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginTop: 16,
  },
  createFirstCatBtnText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 14,
    color: '#07090E',
    marginLeft: 6,
  },
  categoryCard: {
    backgroundColor: '#0F121A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 14,
    overflow: 'hidden',
  },
  categoryHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  catTitlePressable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catEmoji: {
    fontSize: 22,
  },
  catNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catName: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 15.5,
    color: '#FFFFFF',
  },
  catStatusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  catStatusPillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  catStatusPillInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  catStatusText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 10,
  },
  catStatusTextActive: {
    color: '#10B981',
  },
  catStatusTextInactive: {
    color: '#EF4444',
  },
  catDishCount: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 1,
  },
  catActionToolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 6,
  },
  catToolBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  addDishSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5A623',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginLeft: 4,
  },
  addDishSmallBtnText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 11.5,
    color: '#07090E',
    marginLeft: 2,
  },
  dishesListWrapper: {
    padding: 10,
  },
  emptyDishesBox: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyDishesText: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  addFirstDishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  addFirstDishBtnText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 12.5,
    color: '#F5A623',
    marginLeft: 4,
  },
  dishItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 10,
    marginBottom: 8,
  },
  dishItemCardUnavailable: {
    opacity: 0.6,
  },
  dishItemCardSelected: {
    borderColor: '#F5A623',
    backgroundColor: 'rgba(245, 166, 35, 0.06)',
  },
  bulkItemCheckbox: {
    paddingRight: 8,
  },
  dishThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  dishThumbPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dishDetailsColumn: {
    flex: 1,
    paddingHorizontal: 10,
  },
  dishTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dietaryMiniSquare: {
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  dietaryMiniDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dishItemName: {
    flex: 1,
    fontFamily: 'Urbanist-Bold',
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  dishPriceBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  dishItemPrice: {
    fontFamily: 'Urbanist-ExtraBold',
    fontSize: 13,
    color: '#F5A623',
  },
  variantBadgePill: {
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  variantBadgePillText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 9.5,
    color: '#F5A623',
  },
  addonBadgePill: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  addonBadgePillText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 9.5,
    color: '#38BDF8',
  },
  scheduleTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  scheduleTagText: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 10,
    color: '#F5A623',
    marginLeft: 3,
  },
  dishActionsColumn: {
    alignItems: 'flex-end',
  },
  quickAvailTrack: {
    width: 36,
    height: 20,
    borderRadius: 10,
    padding: 2,
    justifyContent: 'center',
  },
  quickAvailTrackActive: {
    backgroundColor: '#2ECC71',
  },
  quickAvailTrackInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  quickAvailThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  quickAvailThumbActive: {
    alignSelf: 'flex-end',
  },
  quickAvailThumbInactive: {
    alignSelf: 'flex-start',
  },
  quickAvailLabel: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 9,
    marginTop: 2,
    marginBottom: 4,
  },
  quickAvailLabelActive: {
    color: '#2ECC71',
  },
  quickAvailLabelInactive: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  dishToolsGrid: {
    flexDirection: 'row',
    gap: 4,
  },
  dishToolBtn: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
});
