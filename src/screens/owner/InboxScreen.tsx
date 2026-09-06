import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Text } from '@/components/common/Text';
import { Button } from '@/components/common/Button';
import { Screen } from '@/components/common/Screen';
import { StateView } from '@/components/common/StateView';
import { Skeleton } from '@/components/common/Skeleton';
import { queryKeys, useVisitInbox } from '@/api/queries';
import { updateVisitStatus } from '@/api/endpoints';
import { formatDate } from '@/lib/format';
import { useTheme } from '@/theme';
import type { VisitStatus } from '@/api/types';

/**
 * The owner's reason to open the app: someone wants to see the PG, and the
 * answer is time-sensitive. Confirming is one tap, because anything more and
 * the owner phones them instead and the record here goes stale.
 */
export function InboxScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useVisitInbox(true);

  const respond = useMutation({
    mutationFn: ({ id, status }: { id: string; status: VisitStatus }) =>
      updateVisitStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.visitInbox() });
    },
  });

  const onRespond = useCallback(
    (id: string, status: VisitStatus) => respond.mutate({ id, status }),
    [respond],
  );

  return (
    <Screen>
      <View style={{ paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.md }}>
        <Text variant="overline" tone="muted">
          Your PG
        </Text>
        <Text variant="title1">Visit requests</Text>
      </View>

      {isLoading ? (
        <View style={{ padding: theme.spacing.xl, gap: theme.spacing.md }}>
          <Skeleton height={120} />
          <Skeleton height={120} />
        </View>
      ) : error ? (
        <StateView
          tone="error"
          title="Could not load requests"
          description={error instanceof Error ? error.message : 'Something went wrong.'}
        />
      ) : !data || data.length === 0 ? (
        <StateView
          title="No requests yet"
          description="When someone asks to visit your PG, it appears here with their number."
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: theme.spacing.xl, gap: theme.spacing.md }}>
          {data.map(visit => (
            <View
              key={visit.id}
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radii.lg,
                  padding: theme.spacing.lg,
                  gap: theme.spacing.xs,
                },
              ]}
            >
              <Text variant="bodyStrong">{visit.fullName}</Text>
              <Text variant="callout" tone="secondary">
                {visit.phone}
              </Text>
              <Text variant="callout" tone="muted">
                Wants to visit: {formatDate(visit.preferredDate)}
              </Text>
              {visit.message ? (
                <Text variant="callout" tone="secondary">
                  {visit.message}
                </Text>
              ) : null}

              {visit.status === 'PENDING' ? (
                <View style={[styles.actions, { marginTop: theme.spacing.sm }]}>
                  <Button
                    label="Confirm"
                    size="sm"
                    loading={respond.isPending}
                    onPress={() => onRespond(visit.id, 'CONFIRMED')}
                    style={styles.grow}
                  />
                  <Button
                    label="Decline"
                    size="sm"
                    variant="secondary"
                    loading={respond.isPending}
                    onPress={() => onRespond(visit.id, 'CANCELLED')}
                    style={styles.grow}
                  />
                </View>
              ) : (
                <Text variant="caption" tone="muted" style={{ marginTop: theme.spacing.xs }}>
                  {visit.status.toLowerCase()}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth * 2 },
  actions: { flexDirection: 'row', gap: 8 },
  grow: { flex: 1 },
});
