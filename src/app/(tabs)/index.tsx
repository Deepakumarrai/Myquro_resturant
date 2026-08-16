import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadii } from '../../constants/theme';

export default function RestaurantDashboard() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Restaurant Dashboard</Text>
          <Text style={styles.subGreeting}>Manage your restaurant orders & menu</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: Colors.primary.main }]}>
            <Text style={styles.statNumber}>18</Text>
            <Text style={styles.statLabel}>Active Orders</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: Colors.accent.green }]}>
            <Text style={styles.statNumber}>$1,240</Text>
            <Text style={styles.statLabel}>Today's Revenue</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: Typography.sizes.heading,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral.textDark,
  },
  subGreeting: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral.textMedium,
    marginTop: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    padding: Spacing.md,
    borderRadius: BorderRadii.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
  },
  statNumber: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral.textDark,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.neutral.textMedium,
    marginTop: Spacing.xs,
  },
});
