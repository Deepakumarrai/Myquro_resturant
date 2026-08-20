import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useOrderStore, Order } from '../state/orderStore';

const { width } = Dimensions.get('window');

export default function OrderSectionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { orders, isLoading, loadOrders, acceptOrder, markReady, markPickedUp, rejectOrder } = useOrderStore();
  
  const [activeFilter, setActiveFilter] = useState<'All' | 'New' | 'Preparing' | 'Ready'>('All');

  // Load orders on mount
  useEffect(() => {
    loadOrders();
  }, []);

  const getFilteredOrders = () => {
    // Only display active (non-completed, non-rejected) orders
    const activeOrders = orders.filter(o => o.status !== 'Picked up' && o.status !== 'Rejected');
    if (activeFilter === 'All') return activeOrders;
    return activeOrders.filter(o => o.status === activeFilter);
  };

  const getWaitingTime = (timestamp: string) => {
    const elapsedMs = new Date().getTime() - new Date(timestamp).getTime();
    const mins = Math.floor(elapsedMs / (60 * 1000));
    if (mins < 1) return 'Just Now';
    return `${mins}m ago`;
  };

  const isDelayed = (timestamp: string, status: string) => {
    const elapsedMs = new Date().getTime() - new Date(timestamp).getTime();
    const mins = Math.floor(elapsedMs / (60 * 1000));
    // If waiting in New status > 5 mins, or in Preparing > 20 mins, flag as warning
    if (status === 'New' && mins >= 5) return true;
    if (status === 'Preparing' && mins >= 20) return true;
    return false;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#F5A623" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Order Section</Text>
            <Text style={styles.headerSubtitle}>
              Live Kitchen Display Screen (KDS) & Prep Management
            </Text>
          </View>
        </View>

        {/* Tab Filters */}
        <View style={styles.filterTabsRow}>
          {(['All', 'New', 'Preparing', 'Ready'] as const).map((tab) => {
            const isActive = activeFilter === tab;
            // Get count of orders in this category
            const count = tab === 'All' 
              ? orders.filter(o => o.status !== 'Picked up' && o.status !== 'Rejected').length
              : orders.filter(o => o.status === tab).length;

            return (
              <TouchableOpacity
                key={tab}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setActiveFilter(tab)}
              >
                <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                  {tab} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Live Orders Grid/Scroll */}
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          {getFilteredOrders().length > 0 ? (
            <View style={styles.gridContainer}>
              {getFilteredOrders().map((order) => {
                const delayed = isDelayed(order.timestamp, order.status);
                return (
                  <View key={order.id} style={[styles.orderCard, delayed && styles.orderCardWarning]}>
                    {/* Header Row */}
                    <View style={styles.cardHeader}>
                      <View>
                        <Text style={styles.orderIdText}>{order.id}</Text>
                        <Text style={styles.customerName}>{order.customer}</Text>
                      </View>
                      <View style={styles.timeBadgeContainer}>
                        {delayed && <Ionicons name="alert-circle" size={16} color="#E74C3C" style={{ marginRight: 4 }} />}
                        <Text style={[styles.timeText, delayed && styles.timeTextWarning]}>
                          {getWaitingTime(order.timestamp)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Items List */}
                    <View style={styles.itemsBox}>
                      {order.items.map((item, idx) => (
                        <View key={idx} style={styles.itemRow}>
                          <Text style={styles.itemQty}>{item.qty}x</Text>
                          <Text style={styles.itemName}>{item.name}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.divider} />

                    {/* Actions and Status Row */}
                    <View style={styles.footerRow}>
                      <View style={styles.statusIndicator}>
                        <View style={[styles.statusDot, { backgroundColor: order.status === 'New' ? '#F5A623' : order.status === 'Preparing' ? '#3498DB' : '#2ECC71' }]} />
                        <Text style={styles.statusLabelText}>{order.status}</Text>
                      </View>

                      <View style={styles.actionsGroup}>
                        {order.status === 'New' && (
                          <>
                            <TouchableOpacity
                              activeOpacity={0.7}
                              style={styles.actionDeclineBtn}
                              onPress={() => rejectOrder(order.id, 'Kitchen busy')}
                            >
                              <Text style={styles.declineBtnText}>Reject</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              activeOpacity={0.7}
                              style={styles.actionAcceptBtn}
                              onPress={() => acceptOrder(order.id)}
                            >
                              <Text style={styles.acceptBtnText}>Accept</Text>
                            </TouchableOpacity>
                          </>
                        )}

                        {order.status === 'Preparing' && (
                          <TouchableOpacity
                            activeOpacity={0.7}
                            style={styles.actionPrepareBtn}
                            onPress={() => markReady(order.id)}
                          >
                            <Text style={styles.prepareBtnText}>Ready to Dispatch</Text>
                          </TouchableOpacity>
                        )}

                        {order.status === 'Ready' && (
                          <TouchableOpacity
                            activeOpacity={0.7}
                            style={styles.actionDeliverBtn}
                            onPress={() => markPickedUp(order.id)}
                          >
                            <Text style={styles.deliverBtnText}>Hand Over</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyView}>
              <Ionicons name="restaurant-outline" size={48} color="rgba(255,255,255,0.15)" />
              <Text style={styles.emptyTitle}>No Live Orders</Text>
              <Text style={styles.emptySubtitle}>
                No orders are active in this status. New customer orders will show up here in real time.
              </Text>
            </View>
          )}
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 18.5,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 1,
  },

  /* Filter Tabs */
  filterTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  filterTabActive: {
    borderColor: '#F5A623',
    backgroundColor: 'rgba(245, 166, 35, 0.08)',
  },
  filterTabText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  filterTabTextActive: {
    color: '#F5A623',
  },

  /* Main Scroll */
  mainScroll: {
    flex: 1,
    marginTop: 10,
  },
  gridContainer: {
    paddingTop: 6,
  },
  orderCard: {
    backgroundColor: '#0F121A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 14,
    marginBottom: 12,
  },
  orderCardWarning: {
    borderColor: 'rgba(231, 76, 60, 0.35)',
    backgroundColor: 'rgba(231, 76, 60, 0.03)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderIdText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 15,
    color: '#F5A623',
    letterSpacing: 0.3,
  },
  customerName: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 13,
    color: '#FFFFFF',
    marginTop: 2,
  },
  timeBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  timeText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
  },
  timeTextWarning: {
    color: '#E74C3C',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 10,
  },
  itemsBox: {
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
    width: 22,
  },
  itemName: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.75)',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusLabelText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
  },
  actionsGroup: {
    flexDirection: 'row',
  },
  actionDeclineBtn: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginRight: 6,
  },
  declineBtnText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.6)',
  },
  actionAcceptBtn: {
    backgroundColor: '#F5A623',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  acceptBtnText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 11.5,
    color: '#07090E',
  },
  actionPrepareBtn: {
    backgroundColor: '#3498DB',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  prepareBtnText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 11.5,
    color: '#FFFFFF',
  },
  actionDeliverBtn: {
    backgroundColor: '#2ECC71',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  deliverBtnText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 11.5,
    color: '#FFFFFF',
  },

  /* Empty State */
  emptyView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 12,
  },
  emptySubtitle: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    maxWidth: 240,
    marginTop: 6,
    lineHeight: 16,
  },
});
