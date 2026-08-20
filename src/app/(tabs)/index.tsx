import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useOrderStore, Order } from '../../state/orderStore';
import { useComplaintStore } from '../../state/complaintStore';

const { width } = Dimensions.get('window');

export default function RestaurantDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'New' | 'Preparing' | 'Ready' | 'Picked up'>('New');
  const [activeBottomTab, setActiveBottomTab] = useState<'Orders' | 'Menu' | 'Business' | 'Complaints' | 'More'>('Orders');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const {
    orders,
    loadOrders,
    addSimulatedOrder,
    acceptOrder,
    markReady,
    markPickedUp,
    rejectOrder,
  } = useOrderStore();

  const { complaints, loadComplaints, getActiveComplaintsCount } = useComplaintStore();

  // Load orders and complaints on mount
  useEffect(() => {
    loadOrders();
    loadComplaints();
  }, []);

  const activeComplaintsCount = getActiveComplaintsCount();

  // Automatically generate new orders every 15 seconds (only when online)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isOnline) {
        addSimulatedOrder(isOnline);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [isOnline, addSimulatedOrder]);

  // Prevent going offline if there are active accepted orders in preparation or ready
  const handleToggleOnline = () => {
    if (isOnline) {
      const hasActiveOrders = orders.some(o => o.status === 'Preparing' || o.status === 'Ready');
      if (hasActiveOrders) {
        Alert.alert(
          'Active Orders In Progress',
          'You cannot go offline while you have active orders being prepared or waiting for delivery. Please complete all accepted orders first.',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    setIsOnline(!isOnline);
  };

  const subTabs: ('New' | 'Preparing' | 'Ready' | 'Picked up')[] = ['New', 'Preparing', 'Ready', 'Picked up'];

  // Handle transitioning order statuses
  const updateOrderStatus = (orderId: string, nextStatus: 'Preparing' | 'Ready' | 'Picked up' | 'Rejected') => {
    if (nextStatus === 'Rejected') {
      rejectOrder(orderId, 'Kitchen busy');
    } else if (nextStatus === 'Preparing') {
      acceptOrder(orderId);
      setActiveSubTab(nextStatus);
    } else if (nextStatus === 'Ready') {
      markReady(orderId);
      setActiveSubTab(nextStatus);
    } else if (nextStatus === 'Picked up') {
      markPickedUp(orderId);
      setActiveSubTab(nextStatus);
    }
  };

  const getFilteredOrders = () => {
    return orders.filter(o => o.status === activeSubTab);
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = new Date().getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (60 * 1000));
      
      if (diffMins < 1) return 'Just Now';
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const hours = date.getHours();
      const mins = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedMins = mins < 10 ? `0${mins}` : mins;
      
      return `${formattedHours}:${formattedMins} ${ampm}`;
    } catch (e) {
      return 'Just Now';
    }
  };

  const getEmptyStateMessage = () => {
    switch (activeSubTab) {
      case 'New':
        return 'New orders will appear here';
      case 'Preparing':
        return 'Orders that are getting prepared will be shown here';
      case 'Ready':
        return 'Orders that are ready for pickup will be shown here';
      case 'Picked up':
        return 'Orders that have been picked up will be shown here';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Main Content Scroll View */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        
        {/* Top Header Section */}
        <View style={styles.headerRow}>
          {/* MyQuro Gold Logo */}
          <View style={styles.logoWrapper}>
            <Svg width={26} height={22} viewBox="0 0 60 50" fill="none">
              <Path
                d="M 12 40 L 24 16 L 33 28 L 45 8 M 37 8 H 45 V 16"
                stroke="#F5A623"
                strokeWidth={6.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          
          <View style={styles.headerTitleColumn}>
            <Text style={styles.headerTitle}>MyQuro Restaurant</Text>
            
            {/* Status Row */}
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: isOnline ? '#2ECC71' : '#E74C3C' }]} />
              <Text style={[styles.statusTextGreen, { color: isOnline ? '#2ECC71' : '#E74C3C' }]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
              <Text style={styles.statusSeparator}>•</Text>
              <Text style={styles.statusTextGray}>Closes at 12:00 am, Tomorrow</Text>
            </View>
          </View>

          {/* Header Controls (Sliding Switch + QR Scanner + Search Icons) */}
          <View style={styles.headerControls}>
            {/* Custom Sliding Toggle Switch */}
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={handleToggleOnline} 
              style={[
                styles.switchContainer, 
                { 
                  backgroundColor: isOnline ? '#2ECC71' : 'rgba(255, 255, 255, 0.12)',
                  justifyContent: isOnline ? 'flex-end' : 'flex-start'
                }
              ]}
            >
              <View style={styles.switchCircle} />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7} style={styles.headerIconBtn}>
              <Ionicons name="scan-outline" size={19} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} style={styles.headerIconBtn}>
              <Ionicons name="search-outline" size={19} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* You Are Online / Offline Banner */}
        <View style={[styles.onlineBanner, !isOnline && styles.offlineBanner]}>
          <Text style={[styles.onlineBannerLeftText, !isOnline && styles.offlineBannerLeftText]}>
            {isOnline ? 'You are online' : 'You are offline'}
          </Text>
          <TouchableOpacity activeOpacity={0.75} style={styles.bannerBtn}>
            <Text style={styles.bannerBtnText}>CHECK ON MYQURO</Text>
            <Ionicons name="open-outline" size={13} color="#F5A623" style={styles.bannerBtnIcon} />
          </TouchableOpacity>
        </View>

        {/* Horizontal Sub-Tabs Container */}
        <View style={styles.tabBar}>
          {subTabs.map((tab) => {
            const isTabActive = activeSubTab === tab;
            // Get count of orders in this sub-tab
            const count = isOnline ? orders.filter(o => o.status === tab).length : 0;
            
            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.75}
                style={[styles.tabItem, isTabActive && styles.tabItemActive]}
                onPress={() => setActiveSubTab(tab)}
              >
                <View style={styles.tabLabelWrapper}>
                  <Text style={[styles.tabText, isTabActive && styles.tabTextActive]}>
                    {tab}
                  </Text>
                  {count > 0 && (
                    <View style={[styles.tabCountBadge, isTabActive && styles.tabCountBadgeActive]}>
                      <Text style={[styles.tabCountText, isTabActive && styles.tabCountTextActive]}>{count}</Text>
                    </View>
                  )}
                </View>
                {isTabActive && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Live Orders List / Empty State */}
        {(isOnline && getFilteredOrders().length > 0) ? (
          <View style={styles.ordersListContainer}>
            {getFilteredOrders().map((order) => (
              <View key={order.id} style={styles.orderCard}>
                
                {/* Order Top info */}
                <View style={styles.orderCardHeader}>
                  <View>
                    <Text style={styles.orderId}>{order.id}</Text>
                    <Text style={styles.customerName}>{order.customer}</Text>
                  </View>
                  <Text style={styles.orderTime}>{formatTime(order.timestamp)}</Text>
                </View>

                {/* Items Separator */}
                <View style={styles.cardSeparator} />

                {/* Items List */}
                <View style={styles.itemsList}>
                  {order.items.map((item, idx) => (
                    <View key={idx} style={styles.itemRow}>
                      <Text style={styles.itemQty}>{item.qty}x</Text>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemPrice}>₹{item.price * item.qty}</Text>
                    </View>
                  ))}
                </View>

                {/* Card Separator */}
                <View style={styles.cardSeparator} />

                {/* Total Row */}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Grand Total</Text>
                  <Text style={styles.totalPrice}>₹{order.total}</Text>
                </View>

                {/* Actions Button */}
                <View style={styles.actionsRow}>
                  {order.status === 'New' && (
                    <>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.rejectBtn}
                        onPress={() => updateOrderStatus(order.id, 'Rejected')}
                      >
                        <Text style={styles.rejectBtnText}>Decline</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.acceptBtn}
                        onPress={() => updateOrderStatus(order.id, 'Preparing')}
                      >
                        <Text style={styles.acceptBtnText}>Accept Order</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {order.status === 'Preparing' && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.prepareBtn}
                      onPress={() => updateOrderStatus(order.id, 'Ready')}
                    >
                      <Text style={styles.prepareBtnText}>Mark as Ready</Text>
                    </TouchableOpacity>
                  )}

                  {order.status === 'Ready' && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.readyBtn}
                      onPress={() => updateOrderStatus(order.id, 'Picked up')}
                    >
                      <Text style={styles.readyBtnText}>Complete Delivery</Text>
                    </TouchableOpacity>
                  )}

                  {order.status === 'Picked up' && (
                    <View style={styles.completedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#2ECC71" />
                      <Text style={styles.completedBadgeText}>Delivered & Completed</Text>
                    </View>
                  )}
                </View>

              </View>
            ))}
          </View>
        ) : (
          /* Center Illustration Empty State */
          <View style={styles.emptyView}>
            <View style={styles.illustrationWrapper}>
              <Image
                source={require('../../../assets/image copy 8.png')}
                style={styles.heroImage}
                resizeMode="contain"
              />
            </View>

            {/* Heading */}
            <Text style={styles.emptyTitle}>No Orders!</Text>

            {/* Subheading */}
            <Text style={styles.emptySubtitle}>{getEmptyStateMessage()}</Text>
          </View>
        )}

      </ScrollView>

      {/* Custom Floating Bottom Tab Bar */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        
        {/* Orders Tab */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.bottomTabItem}
          onPress={() => {
            setActiveBottomTab('Orders');
            setShowMoreMenu(false);
          }}
        >
          <Ionicons
            name={activeBottomTab === 'Orders' && !showMoreMenu ? 'home' : 'home-outline'}
            size={22}
            color={activeBottomTab === 'Orders' && !showMoreMenu ? '#F5A623' : 'rgba(255, 255, 255, 0.4)'}
          />
          <Text style={[styles.bottomTabLabel, activeBottomTab === 'Orders' && !showMoreMenu && styles.bottomTabLabelActive]}>
            Orders
          </Text>
        </TouchableOpacity>

        {/* Menu Tab */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.bottomTabItem}
          onPress={() => {
            setShowMoreMenu(false);
            router.push('/menu-management');
          }}
        >
          <Ionicons
            name="book-outline"
            size={22}
            color="rgba(255, 255, 255, 0.4)"
          />
          <Text style={styles.bottomTabLabel}>
            Menu
          </Text>
        </TouchableOpacity>

        {/* Business Tab (Raised Center Circle Icon) */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.raisedTabItem}
          onPress={() => {
            setActiveBottomTab('Business');
            setShowMoreMenu(false);
          }}
        >
          <View style={[styles.raisedCircle, activeBottomTab === 'Business' && !showMoreMenu && styles.raisedCircleActive]}>
            <Ionicons
              name="bar-chart"
              size={20}
              color="#F5A623"
            />
          </View>
          {/* Gold marker line below the circle if active */}
          <View style={[styles.raisedUnderline, activeBottomTab === 'Business' && !showMoreMenu && styles.raisedUnderlineActive]} />
          <Text style={[styles.bottomTabLabel, activeBottomTab === 'Business' && !showMoreMenu && styles.bottomTabLabelActive, { marginTop: 2 }]}>
            Business
          </Text>
        </TouchableOpacity>

        {/* Complaints Tab */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.bottomTabItem}
          onPress={() => {
            setShowMoreMenu(false);
            router.push('/complaints');
          }}
        >
          <View style={{ position: 'relative' }}>
            <Ionicons
              name="warning-outline"
              size={22}
              color="rgba(255, 255, 255, 0.4)"
            />
            {activeComplaintsCount > 0 && (
              <View style={styles.complaintsTabBadge}>
                <Text style={styles.complaintsTabBadgeText}>{activeComplaintsCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.bottomTabLabel}>
            Complaints
          </Text>
        </TouchableOpacity>

        {/* More Tab */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.bottomTabItem}
          onPress={() => setShowMoreMenu(true)}
        >
          <Ionicons
            name="menu-outline"
            size={22}
            color={showMoreMenu ? '#F5A623' : 'rgba(255, 255, 255, 0.4)'}
          />
          <Text style={[styles.bottomTabLabel, showMoreMenu && styles.bottomTabLabelActive]}>
            More
          </Text>
        </TouchableOpacity>

      </View>

      {/* More Options Menu Modal Overlay */}
      <Modal
        visible={showMoreMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMoreMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={() => setShowMoreMenu(false)}
        >
          <View style={styles.modalContentContainer}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>More Options</Text>
              <TouchableOpacity onPress={() => setShowMoreMenu(false)}>
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalDivider} />

            {/* Menu Items */}
            <TouchableOpacity 
              style={styles.modalMenuItem} 
              onPress={() => {
                setShowMoreMenu(false);
                router.push('/complaints');
              }}
            >
              <Ionicons name="warning-outline" size={20} color="#F5A623" style={styles.modalMenuIcon} />
              <Text style={styles.modalMenuText}>Customer Complaints & Issues ({activeComplaintsCount})</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalMenuItem} 
              onPress={() => {
                setShowMoreMenu(false);
                router.push('/menu-management');
              }}
            >
              <Ionicons name="restaurant-outline" size={20} color="#F5A623" style={styles.modalMenuIcon} />
              <Text style={styles.modalMenuText}>Menu Management (Categories & Dishes)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalMenuItem} 
              onPress={() => {
                setShowMoreMenu(false);
                router.push('/menu-preview');
              }}
            >
              <Ionicons name="eye-outline" size={20} color="#F5A623" style={styles.modalMenuIcon} />
              <Text style={styles.modalMenuText}>Preview Customer Menu</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalMenuItem} 
              onPress={() => {
                setShowMoreMenu(false);
                router.push('/past-orders');
              }}
            >
              <Ionicons name="receipt-outline" size={20} color="#F5A623" style={styles.modalMenuIcon} />
              <Text style={styles.modalMenuText}>Past Orders / Order History</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalMenuItem} 
              onPress={() => {
                setShowMoreMenu(false);
                router.push('/order-section');
              }}
            >
              <Ionicons name="clipboard-outline" size={20} color="#F5A623" style={styles.modalMenuIcon} />
              <Text style={styles.modalMenuText}>Order Section</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalMenuItem} 
              onPress={() => {
                setShowMoreMenu(false);
                router.push('/ratings');
              }}
            >
              <Ionicons name="star-outline" size={20} color="#F5A623" style={styles.modalMenuIcon} />
              <Text style={styles.modalMenuText}>Ratings & Reviews</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalMenuItem} 
              onPress={() => {
                setShowMoreMenu(false);
                Alert.alert('Outlet Settings', 'Settings page is coming soon.');
              }}
            >
              <Ionicons name="cog-outline" size={20} color="rgba(255,255,255,0.6)" style={styles.modalMenuIcon} />
              <Text style={styles.modalMenuText}>Outlet Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalMenuItem} 
              onPress={() => {
                setShowMoreMenu(false);
                Alert.alert('Help & Support', 'Support number: (080) 1234 5678');
              }}
            >
              <Ionicons name="help-circle-outline" size={20} color="rgba(255,255,255,0.6)" style={styles.modalMenuIcon} />
              <Text style={styles.modalMenuText}>Help & Support</Text>
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
  scrollContent: {
    paddingHorizontal: 20,
  },

  /* Header Section */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  logoWrapper: {
    marginRight: 10,
  },
  headerTitleColumn: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 20,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  statusTextGreen: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 12,
  },
  statusSeparator: {
    color: 'rgba(255, 255, 255, 0.25)',
    marginHorizontal: 6,
    fontSize: 11,
  },
  statusTextGray: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.55)',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  /* Custom Sliding Toggle Switch */
  switchContainer: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
  },
  switchCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },

  /* Online Banner */
  onlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(245, 166, 35, 0.04)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 166, 35, 0.22)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  offlineBanner: {
    backgroundColor: 'rgba(231, 76, 60, 0.04)',
    borderColor: 'rgba(231, 76, 60, 0.22)',
  },
  onlineBannerLeftText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  offlineBannerLeftText: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  bannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerBtnText: {
    fontFamily: 'Urbanist-ExtraBold',
    fontSize: 12,
    color: '#F5A623',
    letterSpacing: 0.2,
  },
  bannerBtnIcon: {
    marginLeft: 6,
  },

  /* Horizontal Sub-Tabs */
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 24,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    position: 'relative',
  },
  tabItemActive: {},
  tabLabelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  tabTextActive: {
    color: '#F5A623',
  },
  tabCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 4,
  },
  tabCountBadgeActive: {
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
  },
  tabCountText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 9.5,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  tabCountTextActive: {
    color: '#F5A623',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: '#F5A623',
    borderRadius: 2.5,
  },

  /* Live Orders List Cards */
  ordersListContainer: {
    marginVertical: 4,
  },
  orderCard: {
    backgroundColor: '#0F121A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 15.5,
    color: '#F5A623',
    letterSpacing: 0.3,
  },
  customerName: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 2,
  },
  orderTime: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  cardSeparator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 12,
  },
  itemsList: {
    marginVertical: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  itemQty: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 13,
    color: '#F5A623',
    width: 24,
  },
  itemName: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.75)',
    flex: 1,
  },
  itemPrice: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  totalLabel: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  totalPrice: {
    fontFamily: 'Urbanist-ExtraBold',
    fontSize: 15.5,
    color: '#FFFFFF',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  rejectBtnText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.65)',
  },
  acceptBtn: {
    flex: 2,
    backgroundColor: '#F5A623',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  acceptBtnText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 12.5,
    color: '#07090E',
  },
  prepareBtn: {
    flex: 1,
    backgroundColor: '#3498DB',
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
  },
  prepareBtnText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 12.5,
    color: '#FFFFFF',
  },
  readyBtn: {
    flex: 1,
    backgroundColor: '#2ECC71',
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
  },
  readyBtnText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 12.5,
    color: '#FFFFFF',
  },
  completedBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(46, 204, 113, 0.06)',
    borderRadius: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.25)',
  },
  completedBadgeText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 12,
    color: '#2ECC71',
    marginLeft: 6,
  },

  /* Empty State */
  emptyView: {
    alignItems: 'center',
    marginTop: 80,
  },
  illustrationWrapper: {
    width: width * 0.8,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  emptyTitle: {
    fontFamily: 'Urbanist-ExtraBold',
    fontSize: 26,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.55)',
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 270,
    lineHeight: 20,
  },

  /* Custom Floating Bottom Tab Bar */
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0F121A',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  bottomTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomTabLabel: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 4,
  },
  bottomTabLabelActive: {
    color: '#F5A623',
  },
  raisedTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    top: -15, // Raise the center item slightly
  },
  raisedCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: '#0F121A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  raisedCircleActive: {
    borderColor: '#F5A623',
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  raisedUnderline: {
    width: 14,
    height: 2,
    backgroundColor: 'transparent',
    borderRadius: 1,
    marginTop: 3,
  },
  raisedUnderlineActive: {
    backgroundColor: '#F5A623',
  },
  complaintsTabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  complaintsTabBadgeText: {
    fontFamily: 'Urbanist-ExtraBold',
    fontSize: 9.5,
    color: '#FFFFFF',
  },

  /* More Modal Styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContentContainer: {
    backgroundColor: '#0F121A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 166, 35, 0.15)',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 16.5,
    color: '#F5A623',
    letterSpacing: 0.2,
  },
  modalDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 14,
  },
  modalMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  modalMenuIcon: {
    marginRight: 12,
  },
  modalMenuText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 14.5,
    color: '#FFFFFF',
  },
});
