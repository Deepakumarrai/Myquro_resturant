import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Modal,
  Alert,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useComplaintStore } from '../state/complaintStore';
import { Complaint, Message, ResolutionType, ComplaintStatus } from '../types/complaint';

const { width } = Dimensions.get('window');

const QUICK_REPLIES = [
  'We sincerely apologize for this experience and are investigating immediately.',
  'We have verified with our dispatch station and are processing your resolution.',
  'Thank you for bringing this to our attention. Our head chef is reviewing the batch.',
  'We have initiated an immediate refund for the affected item.',
];

export default function ComplaintDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();

  const {
    complaints,
    sendMessage,
    proposeResolution,
    acceptResolution,
    rejectResolution,
    escalateComplaint,
  } = useComplaintStore();

  const complaint = complaints.find((c) => c.id === params.id);

  // Chat message input
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Resolution Modal State
  const [isResolutionModalVisible, setIsResolutionModalVisible] = useState(false);
  const [resolutionType, setResolutionType] = useState<ResolutionType>('REFUND');
  const [refundAmount, setRefundAmount] = useState('');
  const [compensationCode, setCompensationCode] = useState('MYQURO100OFF');
  const [resolutionNote, setResolutionNote] = useState('');
  const [directResolve, setDirectResolve] = useState(false);
  const [resolutionError, setResolutionError] = useState('');

  // Escalation Modal State
  const [isEscalateModalVisible, setIsEscalateModalVisible] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');

  // Evidence Image Zoom Modal
  const [zoomedImageUri, setZoomedImageUri] = useState<string | null>(null);

  // Audit Log expanded accordion
  const [showAuditLogs, setShowAuditLogs] = useState(false);

  if (!complaint) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#F5A623" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Complaint Not Found</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Handle Sending Restaurant Response
  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setIsSending(true);
    try {
      await sendMessage(
        complaint.id,
        'RESTAURANT',
        'Restaurant Support (MyQuro Bistro)',
        replyText.trim()
      );
      setReplyText('');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  // Handle Proposing / Executing Resolution
  const handleSubmitResolution = async () => {
    setResolutionError('');

    if (!resolutionNote.trim()) {
      setResolutionError('Please provide a resolution note or explanation');
      return;
    }

    const numRefund = Number(refundAmount);
    if (resolutionType === 'REFUND') {
      if (isNaN(numRefund) || numRefund <= 0) {
        setResolutionError('Please enter a valid refund amount > ₹0');
        return;
      }
      if (numRefund > complaint.orderAmount) {
        setResolutionError(
          `Refund (₹${numRefund}) cannot exceed order total (₹${complaint.orderAmount})`
        );
        return;
      }
    }

    let actionTaken = 'Apology & Explanation';
    if (resolutionType === 'REFUND') {
      actionTaken = `₹${numRefund} ${numRefund === complaint.orderAmount ? 'Full' : 'Partial'} Refund`;
    } else if (resolutionType === 'REPLACEMENT') {
      actionTaken = 'Replacement Item Dispatched';
    } else if (resolutionType === 'COMPENSATION') {
      actionTaken = `Courtesy Coupon: ${compensationCode}`;
    } else if (resolutionType === 'INVESTIGATION') {
      actionTaken = 'Internal Kitchen & Quality Audit';
    }

    const result = await proposeResolution(
      complaint.id,
      {
        resolutionType,
        refundAmount: resolutionType === 'REFUND' ? numRefund : undefined,
        compensationCode: resolutionType === 'COMPENSATION' ? compensationCode : undefined,
        actionTaken,
        note: resolutionNote.trim(),
        resolvedBy: 'Restaurant Manager',
      },
      directResolve
    );

    if (result.success) {
      setIsResolutionModalVisible(false);
      Alert.alert(
        directResolve ? 'Complaint Resolved' : 'Resolution Proposed',
        directResolve
          ? 'Complaint has been marked as resolved.'
          : 'Resolution has been sent to the customer for review.'
      );
    } else {
      setResolutionError(result.error || 'Failed to submit resolution');
    }
  };

  // Handle Escalating Complaint
  const handleConfirmEscalate = async () => {
    if (!escalateReason.trim()) {
      Alert.alert('Required', 'Please enter a reason for escalation.');
      return;
    }
    await escalateComplaint(complaint.id, escalateReason.trim(), 'Restaurant Manager');
    setIsEscalateModalVisible(false);
    Alert.alert('Escalated', 'Ticket has been escalated to MyQuro Central Trust & Safety Team.');
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color="#F5A623" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{complaint.id}</Text>
            <Text style={styles.headerSubtitle}>Order {complaint.orderNumber}</Text>
          </View>

          {/* Status Badge */}
          <View
            style={[
              styles.statusHeaderPill,
              complaint.status === 'RESOLVED'
                ? styles.statusPillResolved
                : complaint.status === 'ESCALATED'
                ? styles.statusPillEscalated
                : styles.statusPillActive,
            ]}
          >
            <Text style={styles.statusHeaderPillText}>{complaint.status.replace('_', ' ')}</Text>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={styles.mainScroll}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Customer & Order Context Card */}
            <View style={styles.contextCard}>
              <View style={styles.contextHeaderRow}>
                <View style={styles.customerAvatarLarge}>
                  <Text style={styles.avatarInitials}>{complaint.customerName.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.customerNameLarge}>{complaint.customerName}</Text>
                  <Text style={styles.customerMetaText}>
                    {complaint.customerPhone || '+91 98XXX XXXXX'} • {complaint.customerPastOrdersCount || 12} Orders placed
                  </Text>
                </View>
                <View style={styles.orderAmountBox}>
                  <Text style={styles.orderAmountValue}>₹{complaint.orderAmount}</Text>
                  <Text style={styles.orderAmountLabel}>Order Total</Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              {/* Order Info Row */}
              <View style={styles.orderInfoGrid}>
                <View style={styles.orderInfoCol}>
                  <Text style={styles.orderInfoLabel}>ORDER NUMBER</Text>
                  <Text style={styles.orderInfoValue}>{complaint.orderNumber}</Text>
                </View>
                <View style={styles.orderInfoCol}>
                  <Text style={styles.orderInfoLabel}>OUTLET</Text>
                  <Text style={styles.orderInfoValue}>{complaint.outletName}</Text>
                </View>
                <View style={styles.orderInfoCol}>
                  <Text style={styles.orderInfoLabel}>PRIORITY</Text>
                  <Text style={[styles.orderInfoValue, { color: '#F5A623' }]}>
                    {complaint.priority}
                  </Text>
                </View>
              </View>
            </View>

            {/* 2. Issue Description & Evidence */}
            <View style={styles.issueCard}>
              <View style={styles.issueHeaderRow}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{complaint.categoryLabel}</Text>
                </View>
                <Text style={styles.issueReasonText}>{complaint.reason}</Text>
              </View>

              <Text style={styles.issueDescriptionText}>"{complaint.description}"</Text>

              {complaint.relatedItem && (
                <View style={styles.affectedItemRow}>
                  <Ionicons name="restaurant" size={14} color="#F5A623" />
                  <Text style={styles.affectedItemText}>Affected Item: {complaint.relatedItem}</Text>
                </View>
              )}

              {/* Customer Photo Evidence Gallery */}
              {complaint.evidence && complaint.evidence.length > 0 && (
                <View style={styles.evidenceSection}>
                  <Text style={styles.evidenceHeaderLabel}>Customer Uploaded Photo Evidence:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.evidenceRow}>
                    {complaint.evidence.map((uri, i) => (
                      <TouchableOpacity
                        key={i}
                        onPress={() => setZoomedImageUri(uri)}
                        activeOpacity={0.8}
                      >
                        <Image source={{ uri }} style={styles.evidenceThumbnail} />
                        <View style={styles.zoomIconOverlay}>
                          <Ionicons name="expand-outline" size={14} color="#FFFFFF" />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* 3. Resolution Summary (if resolved or proposed) */}
            {complaint.resolution && (
              <View style={styles.resolutionSummaryCard}>
                <View style={styles.resolutionSummaryHeader}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.resolutionSummaryTitle}>Resolution Record</Text>
                  <Text style={styles.resolutionActionBadge}>
                    {complaint.resolution.actionTaken}
                  </Text>
                </View>
                <Text style={styles.resolutionNoteText}>"{complaint.resolution.note}"</Text>
                {complaint.resolution.refundAmount ? (
                  <View style={styles.refundAmountRow}>
                    <Text style={styles.refundAmountText}>
                      Refund Amount: ₹{complaint.resolution.refundAmount} (Status: {complaint.refundStatus})
                    </Text>
                  </View>
                ) : null}
                <Text style={styles.resolvedByText}>
                  Handled by {complaint.resolution.resolvedBy} •{' '}
                  {new Date(complaint.resolution.resolvedAt).toLocaleDateString()}
                </Text>
              </View>
            )}

            {/* 4. Live Conversation Thread */}
            <View style={styles.chatSectionCard}>
              <View style={styles.chatHeaderRow}>
                <Ionicons name="chatbubbles-outline" size={18} color="#F5A623" />
                <Text style={styles.chatHeaderTitle}>Customer Communication Thread</Text>
                <Text style={styles.chatMessagesCount}>{complaint.messages.length} Messages</Text>
              </View>

              <View style={styles.chatMessagesList}>
                {complaint.messages.map((msg) => {
                  const isCustomer = msg.senderType === 'CUSTOMER';
                  const isSupport = msg.senderType === 'MYQURO_SUPPORT';

                  if (isSupport) {
                    return (
                      <View key={msg.id} style={styles.supportMessageBubble}>
                        <Ionicons name="shield-checkmark" size={16} color="#38BDF8" />
                        <Text style={styles.supportMessageText}>{msg.message}</Text>
                        <Text style={styles.messageTimeText}>{formatTimestamp(msg.timestamp)}</Text>
                      </View>
                    );
                  }

                  return (
                    <View
                      key={msg.id}
                      style={[
                        styles.chatBubbleRow,
                        isCustomer ? styles.chatBubbleRowLeft : styles.chatBubbleRowRight,
                      ]}
                    >
                      <View
                        style={[
                          styles.chatBubble,
                          isCustomer ? styles.customerBubble : styles.restaurantBubble,
                        ]}
                      >
                        <Text style={[styles.senderNameLabel, !isCustomer && { color: '#07090E' }]}>
                          {msg.senderName}
                        </Text>
                        <Text style={[styles.chatBubbleText, !isCustomer && styles.chatBubbleTextDark]}>
                          {msg.message}
                        </Text>
                        <Text
                          style={[
                            styles.messageTimeText,
                            !isCustomer && { color: 'rgba(0,0,0,0.5)', alignSelf: 'flex-end' },
                          ]}
                        >
                          {formatTimestamp(msg.timestamp)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Quick Canned Replies */}
              {complaint.status !== 'RESOLVED' && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.quickRepliesScroll}
                >
                  {QUICK_REPLIES.map((canned, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.quickReplyChip}
                      onPress={() => setReplyText(canned)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.quickReplyChipText} numberOfLines={1}>
                        {canned}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Reply Input Box */}
              {complaint.status !== 'RESOLVED' ? (
                <View style={styles.replyComposerBox}>
                  <TextInput
                    style={styles.replyInput}
                    placeholder="Type your response to the customer..."
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={replyText}
                    onChangeText={setReplyText}
                    multiline
                  />
                  <TouchableOpacity
                    style={[styles.sendBtn, !replyText.trim() && { opacity: 0.5 }]}
                    onPress={handleSendReply}
                    disabled={isSending || !replyText.trim()}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="send" size={18} color="#07090E" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.resolvedBannerBox}>
                  <Ionicons name="lock-closed-outline" size={16} color="#10B981" />
                  <Text style={styles.resolvedBannerText}>
                    This complaint is marked resolved. Closed tickets cannot receive new messages.
                  </Text>
                </View>
              )}
            </View>

            {/* 5. Resolution & Escalation Action Buttons */}
            {complaint.status !== 'RESOLVED' && (
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={styles.resolvePrimaryBtn}
                  onPress={() => setIsResolutionModalVisible(true)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="checkmark-done" size={18} color="#07090E" />
                  <Text style={styles.resolvePrimaryBtnText}>Propose / Execute Resolution</Text>
                </TouchableOpacity>

                <View style={styles.secondaryActionsRow}>
                  <TouchableOpacity
                    style={styles.escalateBtn}
                    onPress={() => setIsEscalateModalVisible(true)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="warning-outline" size={16} color="#EF4444" />
                    <Text style={styles.escalateBtnText}>Escalate to MyQuro Support</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* 6. Interactive Customer Simulation Section (Swiggy-level interactive test) */}
            <View style={styles.simulationCard}>
              <View style={styles.simulationHeader}>
                <Ionicons name="flask-outline" size={16} color="#38BDF8" />
                <Text style={styles.simulationTitle}>Interactive Testing: Simulate Customer Action</Text>
              </View>
              <Text style={styles.simulationSubtitle}>
                Test how the platform handles customer acceptance or dispute requests:
              </Text>
              <View style={styles.simulationButtonsRow}>
                <TouchableOpacity
                  style={styles.simBtnAccept}
                  onPress={async () => {
                    await acceptResolution(complaint.id, 'Great service, happy with the quick response!');
                    Alert.alert('Customer Accepted', 'Simulated customer acceptance. Ticket moved to RESOLVED.');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.simBtnAcceptText}>Simulate: Customer Accepts (Resolve)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.simBtnReject}
                  onPress={async () => {
                    await rejectResolution(
                      complaint.id,
                      'The proposed refund does not cover the food waste.'
                    );
                    Alert.alert('Customer Disputed', 'Simulated customer dispute. Ticket moved to REOPENED.');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.simBtnRejectText}>Simulate: Customer Reopens Ticket</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 7. Collapsible Audit Log Timeline */}
            <View style={styles.auditSection}>
              <TouchableOpacity
                style={styles.auditHeaderRow}
                onPress={() => setShowAuditLogs(!showAuditLogs)}
                activeOpacity={0.8}
              >
                <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.6)" />
                <Text style={styles.auditTitle}>Audit Log & Timeline ({complaint.auditLogs.length})</Text>
                <Ionicons
                  name={showAuditLogs ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="rgba(255,255,255,0.5)"
                />
              </TouchableOpacity>

              {showAuditLogs && (
                <View style={styles.auditTimelineList}>
                  {complaint.auditLogs.map((log, i) => (
                    <View key={log.id || i} style={styles.auditItem}>
                      <View style={styles.auditDot} />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.auditActionText}>{log.action}</Text>
                        <Text style={styles.auditUserText}>
                          By {log.user} • {new Date(log.timestamp).toLocaleString()}
                        </Text>
                        {log.notes ? <Text style={styles.auditNotesText}>"{log.notes}"</Text> : null}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Modal: Resolution Builder */}
        <Modal
          visible={isResolutionModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setIsResolutionModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.resolutionSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Select Resolution Action</Text>
                <TouchableOpacity onPress={() => setIsResolutionModalVisible(false)}>
                  <Ionicons name="close" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ paddingHorizontal: 20, paddingTop: 14 }}>
                {/* Resolution Types Selection */}
                <Text style={styles.fieldLabel}>Resolution Type</Text>
                <View style={styles.resolutionTypeGrid}>
                  {(
                    [
                      { type: 'REFUND', label: 'Refund', icon: 'cash-outline' },
                      { type: 'REPLACEMENT', label: 'Replacement', icon: 'refresh-outline' },
                      { type: 'COMPENSATION', label: 'Courtesy Coupon', icon: 'gift-outline' },
                      { type: 'APOLOGY_EXPLANATION', label: 'Apology / Note', icon: 'mail-outline' },
                      { type: 'INVESTIGATION', label: 'Kitchen Audit', icon: 'search-outline' },
                    ] as const
                  ).map((item) => {
                    const isSelected = resolutionType === item.type;
                    return (
                      <TouchableOpacity
                        key={item.type}
                        style={[
                          styles.resolutionTypeBtn,
                          isSelected && styles.resolutionTypeBtnActive,
                        ]}
                        onPress={() => setResolutionType(item.type)}
                      >
                        <Ionicons
                          name={item.icon as any}
                          size={18}
                          color={isSelected ? '#F5A623' : 'rgba(255,255,255,0.6)'}
                        />
                        <Text
                          style={[
                            styles.resolutionTypeBtnText,
                            isSelected && styles.resolutionTypeBtnTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Conditional Inputs based on Resolution Type */}
                {resolutionType === 'REFUND' && (
                  <View style={styles.formGroup}>
                    <Text style={styles.fieldLabel}>
                      Refund Amount (₹) — Max: ₹{complaint.orderAmount}
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder={`Enter amount (up to ₹${complaint.orderAmount})`}
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      keyboardType="numeric"
                      value={refundAmount}
                      onChangeText={setRefundAmount}
                    />
                    <View style={styles.quickRefundChips}>
                      <TouchableOpacity
                        style={styles.quickRefundChip}
                        onPress={() => setRefundAmount(String(complaint.orderAmount))}
                      >
                        <Text style={styles.quickRefundChipText}>Full Refund (₹{complaint.orderAmount})</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.quickRefundChip}
                        onPress={() => setRefundAmount(String(Math.round(complaint.orderAmount / 2)))}
                      >
                        <Text style={styles.quickRefundChipText}>50% Refund (₹{Math.round(complaint.orderAmount / 2)})</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {resolutionType === 'COMPENSATION' && (
                  <View style={styles.formGroup}>
                    <Text style={styles.fieldLabel}>Courtesy Coupon / Promo Code</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. MYQURO100FREE"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={compensationCode}
                      onChangeText={setCompensationCode}
                    />
                  </View>
                )}

                {/* Resolution Note (Mandatory) */}
                <View style={styles.formGroup}>
                  <Text style={styles.fieldLabel}>Resolution Note / Explanation *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Explain the resolution decision and quality steps taken..."
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={resolutionNote}
                    onChangeText={setResolutionNote}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Direct Resolve Toggle */}
                <TouchableOpacity
                  style={styles.directResolveRow}
                  onPress={() => setDirectResolve(!directResolve)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={directResolve ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={directResolve ? '#10B981' : 'rgba(255,255,255,0.4)'}
                  />
                  <Text style={styles.directResolveText}>
                    Mark as Resolved immediately (skip customer approval wait)
                  </Text>
                </TouchableOpacity>

                {resolutionError ? (
                  <Text style={styles.resolutionErrorText}>{resolutionError}</Text>
                ) : null}
              </ScrollView>

              <View style={styles.sheetFooter}>
                <TouchableOpacity
                  style={styles.sheetSubmitBtn}
                  onPress={handleSubmitResolution}
                  activeOpacity={0.85}
                >
                  <Text style={styles.sheetSubmitBtnText}>
                    {directResolve ? 'Resolve Complaint Now' : 'Send Resolution to Customer'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal: Escalate Ticket */}
        <Modal
          visible={isEscalateModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setIsEscalateModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.resolutionSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
              <View style={styles.sheetHeader}>
                <Text style={[styles.sheetTitle, { color: '#EF4444' }]}>Escalate to Central Support</Text>
                <TouchableOpacity onPress={() => setIsEscalateModalVisible(false)}>
                  <Ionicons name="close" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
                <Text style={styles.fieldLabel}>Reason for Escalation *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="e.g. Critical food safety dispute, abusive customer behavior, payment mismatch..."
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={escalateReason}
                  onChangeText={setEscalateReason}
                  multiline
                  numberOfLines={3}
                />

                <TouchableOpacity
                  style={[styles.sheetSubmitBtn, { backgroundColor: '#EF4444', marginTop: 16 }]}
                  onPress={handleConfirmEscalate}
                >
                  <Text style={[styles.sheetSubmitBtnText, { color: '#FFFFFF' }]}>
                    Confirm Escalation
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal: Evidence Zoom */}
        <Modal visible={!!zoomedImageUri} transparent animationType="fade">
          <View style={styles.zoomBackdrop}>
            <TouchableOpacity
              style={styles.closeZoomBtn}
              onPress={() => setZoomedImageUri(null)}
            >
              <Ionicons name="close-circle" size={32} color="#FFFFFF" />
            </TouchableOpacity>
            {zoomedImageUri && (
              <Image source={{ uri: zoomedImageUri }} style={styles.zoomedImage} resizeMode="contain" />
            )}
          </View>
        </Modal>
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
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  statusHeaderPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPillActive: {
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
  },
  statusPillResolved: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusPillEscalated: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusHeaderPillText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 11,
    color: '#F5A623',
    textTransform: 'uppercase',
  },
  mainScroll: {
    flex: 1,
    paddingTop: 12,
  },
  contextCard: {
    backgroundColor: '#0F121A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    marginBottom: 12,
  },
  contextHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatarLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5A623',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 18,
    color: '#07090E',
  },
  customerNameLarge: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  customerMetaText: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  orderAmountBox: {
    alignItems: 'flex-end',
  },
  orderAmountValue: {
    fontFamily: 'Urbanist-ExtraBold',
    fontSize: 16,
    color: '#F5A623',
  },
  orderAmountLabel: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 12,
  },
  orderInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderInfoCol: {
    flex: 1,
  },
  orderInfoLabel: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 9.5,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 0.5,
  },
  orderInfoValue: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 12.5,
    color: '#FFFFFF',
    marginTop: 2,
  },
  issueCard: {
    backgroundColor: '#0F121A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    marginBottom: 12,
  },
  issueHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  categoryBadgeText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 10.5,
    color: '#F5A623',
  },
  issueReasonText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  issueDescriptionText: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 19,
  },
  affectedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  affectedItemText: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    color: '#F5A623',
    marginLeft: 6,
  },
  evidenceSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  evidenceHeaderLabel: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  evidenceRow: {
    flexDirection: 'row',
  },
  evidenceThumbnail: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 8,
  },
  zoomIconOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
    padding: 3,
  },
  resolutionSummaryCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    padding: 14,
    marginBottom: 12,
  },
  resolutionSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resolutionSummaryTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 14.5,
    color: '#10B981',
    marginLeft: 6,
    flex: 1,
  },
  resolutionActionBadge: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 11,
    color: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  resolutionNoteText: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 13,
    color: '#FFFFFF',
    marginTop: 8,
    lineHeight: 18,
  },
  refundAmountRow: {
    marginTop: 6,
  },
  refundAmountText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 12.5,
    color: '#10B981',
  },
  resolvedByText: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 6,
  },
  chatSectionCard: {
    backgroundColor: '#0F121A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    marginBottom: 12,
  },
  chatHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingBottom: 8,
  },
  chatHeaderTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
    flex: 1,
  },
  chatMessagesCount: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  chatMessagesList: {
    gap: 10,
    marginBottom: 12,
  },
  chatBubbleRow: {
    flexDirection: 'row',
  },
  chatBubbleRowLeft: {
    justifyContent: 'flex-start',
  },
  chatBubbleRowRight: {
    justifyContent: 'flex-end',
  },
  chatBubble: {
    maxWidth: '82%',
    borderRadius: 12,
    padding: 10,
  },
  customerBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderTopLeftRadius: 2,
  },
  restaurantBubble: {
    backgroundColor: '#F5A623',
    borderTopRightRadius: 2,
  },
  senderNameLabel: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 11,
    color: '#F5A623',
    marginBottom: 2,
  },
  chatBubbleText: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 18,
  },
  chatBubbleTextDark: {
    color: '#07090E',
    fontFamily: 'Urbanist-Medium',
  },
  messageTimeText: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 9.5,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 4,
  },
  supportMessageBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderRadius: 8,
    padding: 8,
  },
  supportMessageText: {
    flex: 1,
    fontFamily: 'Urbanist-Medium',
    fontSize: 11.5,
    color: '#38BDF8',
    marginLeft: 6,
  },
  quickRepliesScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  quickReplyChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
    maxWidth: 220,
  },
  quickReplyChipText: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  replyComposerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  replyInput: {
    flex: 1,
    fontFamily: 'Urbanist-Medium',
    fontSize: 13.5,
    color: '#FFFFFF',
    maxHeight: 70,
  },
  sendBtn: {
    backgroundColor: '#F5A623',
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
  },
  resolvedBannerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 8,
    padding: 10,
  },
  resolvedBannerText: {
    flex: 1,
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    color: '#10B981',
    marginLeft: 6,
  },
  actionButtonsContainer: {
    marginBottom: 12,
    gap: 8,
  },
  resolvePrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5A623',
    borderRadius: 12,
    paddingVertical: 13,
  },
  resolvePrimaryBtnText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 14.5,
    color: '#07090E',
    marginLeft: 6,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
  },
  escalateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 10,
    paddingVertical: 10,
  },
  escalateBtnText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 12.5,
    color: '#EF4444',
    marginLeft: 6,
  },
  simulationCard: {
    backgroundColor: 'rgba(56, 189, 248, 0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    padding: 12,
    marginBottom: 12,
  },
  simulationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  simulationTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 12.5,
    color: '#38BDF8',
    marginLeft: 6,
  },
  simulationSubtitle: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 8,
  },
  simulationButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  simBtnAccept: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  simBtnAcceptText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 10.5,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  simBtnReject: {
    flex: 1,
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    borderWidth: 1,
    borderColor: '#EC4899',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  simBtnRejectText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 10.5,
    color: '#EC4899',
    textAlign: 'center',
  },
  auditSection: {
    backgroundColor: '#0F121A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
    marginBottom: 12,
  },
  auditHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  auditTitle: {
    flex: 1,
    fontFamily: 'Urbanist-Bold',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },
  auditTimelineList: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  auditItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  auditDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F5A623',
    marginTop: 4,
  },
  auditActionText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 12.5,
    color: '#FFFFFF',
  },
  auditUserText: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 1,
  },
  auditNotesText: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 11.5,
    color: 'rgba(245, 166, 35, 0.8)',
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  resolutionSheet: {
    backgroundColor: '#0F121A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.2)',
    maxHeight: '85%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sheetTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 17,
    color: '#FFFFFF',
  },
  fieldLabel: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 8,
  },
  resolutionTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  resolutionTypeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  resolutionTypeBtnActive: {
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
    borderColor: '#F5A623',
  },
  resolutionTypeBtnText: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 6,
  },
  resolutionTypeBtnTextActive: {
    fontFamily: 'Urbanist-Bold',
    color: '#F5A623',
  },
  formGroup: {
    marginBottom: 14,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'Urbanist-Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  quickRefundChips: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  quickRefundChip: {
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quickRefundChipText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 11,
    color: '#F5A623',
  },
  directResolveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  directResolveText: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
    flex: 1,
  },
  resolutionErrorText: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 8,
  },
  sheetFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sheetSubmitBtn: {
    backgroundColor: '#F5A623',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  sheetSubmitBtnText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 14.5,
    color: '#07090E',
  },
  zoomBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeZoomBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  zoomedImage: {
    width: width * 0.95,
    height: '75%',
  },
});
