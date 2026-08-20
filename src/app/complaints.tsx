import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useComplaintStore } from '../state/complaintStore';
import { Complaint, ComplaintPriority, ComplaintStatus, ComplaintCategory } from '../types/complaint';

const { width } = Dimensions.get('window');

const STATUS_TABS: { key: 'ALL' | ComplaintStatus; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'OPEN', label: 'Open' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'AWAITING_CUSTOMER', label: 'Awaiting Customer' },
  { key: 'ESCALATED', label: 'Escalated' },
  { key: 'RESOLVED', label: 'Resolved' },
  { key: 'REOPENED', label: 'Reopened' },
];

export default function ComplaintsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    complaints,
    isLoading,
    loadComplaints,
    searchQuery,
    setSearchQuery,
    selectedStatusTab,
    setSelectedStatusTab,
    selectedPriorityFilter,
    setSelectedPriorityFilter,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    selectedDateFilter,
    setSelectedDateFilter,
    getActiveComplaintsCount,
    getFilteredComplaints,
    getComplaintStats,
  } = useComplaintStore();

  const [showFiltersModal, setShowFiltersModal] = useState(false);

  useEffect(() => {
    loadComplaints();
  }, []);

  const activeCount = getActiveComplaintsCount();
  const stats = getComplaintStats();
  const filteredList = getFilteredComplaints();

  const formatTimeAgo = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just Now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const getPriorityBadge = (priority: ComplaintPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return { label: 'CRITICAL', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', icon: 'flame' };
      case 'HIGH':
        return { label: 'HIGH', color: '#F97316', bg: 'rgba(249, 115, 22, 0.15)', icon: 'alert-circle' };
      case 'MEDIUM':
        return { label: 'MEDIUM', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', icon: 'time-outline' };
      case 'LOW':
        return { label: 'LOW', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)', icon: 'information-circle-outline' };
      default:
        return { label: 'MEDIUM', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', icon: 'time-outline' };
    }
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'OPEN':
        return { label: 'Open', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)' };
      case 'IN_PROGRESS':
        return { label: 'In Progress', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.12)' };
      case 'AWAITING_CUSTOMER':
        return { label: 'Awaiting Customer', color: '#F5A623', bg: 'rgba(245, 166, 35, 0.12)' };
      case 'ESCALATED':
        return { label: 'Escalated to Support', color: '#DC2626', bg: 'rgba(220, 38, 38, 0.18)' };
      case 'RESOLVED':
        return { label: 'Resolved', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' };
      case 'REOPENED':
        return { label: 'Reopened', color: '#EC4899', bg: 'rgba(236, 72, 153, 0.15)' };
      default:
        return { label: status, color: '#F5A623', bg: 'rgba(245, 166, 35, 0.12)' };
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Top Navigation Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color="#F5A623" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Customer Issue Resolution</Text>
            <Text style={styles.headerSubtitle}>Swiggy-class issue handling & response</Text>
          </View>

          {/* Active Complaints Counter Badge */}
          <View style={[styles.activeCounterBadge, activeCount === 0 && styles.activeCounterBadgeZero]}>
            <View style={[styles.activeDot, activeCount === 0 && styles.activeDotZero]} />
            <Text style={[styles.activeCounterText, activeCount === 0 && styles.activeCounterTextZero]}>
              {activeCount} {activeCount === 1 ? 'Active' : 'Active'}
            </Text>
          </View>
        </View>

        {/* Operational Metrics Bar */}
        <View style={styles.metricsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricsScroll}>
            <View style={[styles.metricCard, { borderColor: 'rgba(245, 166, 35, 0.3)' }]}>
              <Text style={[styles.metricValue, { color: '#F5A623' }]}>{stats.activeComplaints}</Text>
              <Text style={styles.metricLabel}>Unresolved</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: '#EF4444' }]}>{stats.openCount}</Text>
              <Text style={styles.metricLabel}>Open</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: '#38BDF8' }]}>{stats.inProgressCount}</Text>
              <Text style={styles.metricLabel}>In Progress</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: '#DC2626' }]}>{stats.escalatedCount}</Text>
              <Text style={styles.metricLabel}>Escalated</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: '#10B981' }]}>{stats.resolvedCount}</Text>
              <Text style={styles.metricLabel}>Resolved</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: '#10B981' }]}>{stats.resolutionRatePercent}%</Text>
              <Text style={styles.metricLabel}>Resolution Rate</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: '#FFFFFF' }]}>{stats.avgFirstResponseTimeMinutes}m</Text>
              <Text style={styles.metricLabel}>Avg Response</Text>
            </View>
          </ScrollView>
        </View>

        {/* Repeated Complaints Detection Banner (if any) */}
        {stats.repeatedInsights.length > 0 && (
          <View style={styles.repeatedInsightBox}>
            <Ionicons name="warning-outline" size={20} color="#F59E0B" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.repeatedInsightTitle}>Quality Insight: Repeated Issue Detected</Text>
              <Text style={styles.repeatedInsightText}>
                "{stats.repeatedInsights[0].itemName}" received multiple complaints regarding{' '}
                {stats.repeatedInsights[0].primaryReason.toLowerCase()}. Please review kitchen prep.
              </Text>
            </View>
          </View>
        )}

        {/* Search & Filter Controls */}
        <View style={styles.filterSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.4)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Complaint ID, Order #, Customer..."
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

          {/* Status Tabs Navigation */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusTabsRow}>
            {STATUS_TABS.map((tab) => {
              const isActive = selectedStatusTab === tab.key;
              const count =
                tab.key === 'ALL'
                  ? complaints.length
                  : complaints.filter((c) => c.status === tab.key).length;

              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.statusTab, isActive && styles.statusTabActive]}
                  onPress={() => setSelectedStatusTab(tab.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.statusTabText, isActive && styles.statusTabTextActive]}>
                    {tab.label} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Complaints List / Empty State */}
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          {filteredList.length === 0 ? (
            /* Clean Empty State */
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="checkmark-done-circle-outline" size={44} color="#10B981" />
              </View>
              <Text style={styles.emptyStateTitle}>You're All Clear!</Text>
              <Text style={styles.emptyStateSubtitle}>
                {selectedStatusTab === 'ALL'
                  ? 'No complaints found. All customer orders are running smoothly!'
                  : `No complaints currently in ${selectedStatusTab.replace('_', ' ')} status.`}
              </Text>
            </View>
          ) : (
            filteredList.map((complaint) => {
              const priorityBadge = getPriorityBadge(complaint.priority);
              const statusBadge = getStatusBadge(complaint.status);
              const isUnresolved = complaint.status !== 'RESOLVED';

              return (
                <TouchableOpacity
                  key={complaint.id}
                  style={[styles.complaintCard, isUnresolved && styles.complaintCardUnresolved]}
                  onPress={() => router.push(`/complaint-details?id=${complaint.id}`)}
                  activeOpacity={0.85}
                >
                  {/* Card Header: Customer & Order */}
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.customerRow}>
                      {complaint.customerAvatar ? (
                        <Image source={{ uri: complaint.customerAvatar }} style={styles.customerAvatar} />
                      ) : (
                        <View style={styles.customerAvatarPlaceholder}>
                          <Text style={styles.customerInitials}>
                            {complaint.customerName.charAt(0)}
                          </Text>
                        </View>
                      )}
                      <View style={{ marginLeft: 10 }}>
                        <Text style={styles.customerNameText}>{complaint.customerName}</Text>
                        <Text style={styles.orderNumberText}>
                          {complaint.orderNumber} • ₹{complaint.orderAmount}
                        </Text>
                      </View>
                    </View>

                    {/* Priority Badge */}
                    <View style={[styles.priorityPill, { backgroundColor: priorityBadge.bg }]}>
                      <Ionicons name={priorityBadge.icon as any} size={12} color={priorityBadge.color} />
                      <Text style={[styles.priorityPillText, { color: priorityBadge.color }]}>
                        {priorityBadge.label}
                      </Text>
                    </View>
                  </View>

                  {/* Complaint Category & Reason Banner */}
                  <View style={styles.reasonBadgeRow}>
                    <View style={styles.categoryTag}>
                      <Text style={styles.categoryTagText}>{complaint.categoryLabel}</Text>
                    </View>
                    <Text style={styles.reasonTitleText} numberOfLines={1}>
                      {complaint.reason}
                    </Text>
                  </View>

                  {/* Description Snippet */}
                  <Text style={styles.descriptionSnippet} numberOfLines={2}>
                    "{complaint.description}"
                  </Text>

                  {/* Related Item (if specified) */}
                  {complaint.relatedItem && (
                    <View style={styles.relatedItemRow}>
                      <Ionicons name="fast-food-outline" size={13} color="#F5A623" />
                      <Text style={styles.relatedItemText}>Item: {complaint.relatedItem}</Text>
                    </View>
                  )}

                  {/* Divider */}
                  <View style={styles.cardDivider} />

                  {/* Card Footer: Status, SLA & Action */}
                  <View style={styles.cardFooterRow}>
                    <View style={styles.statusWithTime}>
                      <View style={[styles.statusPill, { backgroundColor: statusBadge.bg }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusBadge.color }]} />
                        <Text style={[styles.statusPillText, { color: statusBadge.color }]}>
                          {statusBadge.label}
                        </Text>
                      </View>
                      <Text style={styles.timeAgoText}>{formatTimeAgo(complaint.createdAt)}</Text>
                    </View>

                    <View style={styles.viewActionBtn}>
                      <Text style={styles.viewActionBtnText}>Resolve</Text>
                      <Ionicons name="chevron-forward" size={14} color="#F5A623" />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
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
    fontSize: 17,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 1,
  },
  activeCounterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  activeCounterBadgeZero: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 5,
  },
  activeDotZero: {
    backgroundColor: '#10B981',
  },
  activeCounterText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 12,
    color: '#EF4444',
  },
  activeCounterTextZero: {
    color: '#10B981',
  },
  metricsContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  metricsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  metricCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  metricValue: {
    fontFamily: 'Urbanist-ExtraBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  metricLabel: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  repeatedInsightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 10,
    padding: 10,
  },
  repeatedInsightTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 12.5,
    color: '#F59E0B',
  },
  repeatedInsightText: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
    lineHeight: 16,
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Urbanist-Medium',
    fontSize: 13.5,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  statusTabsRow: {
    flexDirection: 'row',
  },
  statusTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 6,
  },
  statusTabActive: {
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
    borderColor: '#F5A623',
  },
  statusTabText: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statusTabTextActive: {
    fontFamily: 'Urbanist-Bold',
    color: '#F5A623',
  },
  mainScroll: {
    flex: 1,
    paddingTop: 10,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 19,
    color: '#FFFFFF',
  },
  emptyStateSubtitle: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  complaintCard: {
    backgroundColor: '#0F121A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    marginBottom: 12,
  },
  complaintCardUnresolved: {
    borderColor: 'rgba(245, 166, 35, 0.25)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  customerAvatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F5A623',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerInitials: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 15,
    color: '#07090E',
  },
  customerNameText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  orderNumberText: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 1,
  },
  priorityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priorityPillText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 10.5,
    marginLeft: 3,
    letterSpacing: 0.3,
  },
  reasonBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 6,
  },
  categoryTagText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.65)',
  },
  reasonTitleText: {
    flex: 1,
    fontFamily: 'Urbanist-Bold',
    fontSize: 13.5,
    color: '#F5A623',
  },
  descriptionSnippet: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 17,
  },
  relatedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  relatedItemText: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 11.5,
    color: '#F5A623',
    marginLeft: 4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 10,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusWithTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusPillText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 11,
  },
  timeAgoText: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  viewActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  viewActionBtnText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 12,
    color: '#F5A623',
    marginRight: 2,
  },
});
