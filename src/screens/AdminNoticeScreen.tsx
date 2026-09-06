import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/common/Screen';
import { Text } from '@/components/common/Text';
import { Button } from '@/components/common/Button';
import { useSession } from '@/store/session';
import { useTheme } from '@/theme';

/**
 * Super Admins are deliberately not served by this app — moderation, payouts
 * and settings all live on the website. Showing this beats dropping an admin
 * into a seeker tab bar that silently 403s on every request.
 */
export function AdminNoticeScreen() {
  const theme = useTheme();
  const signOut = useSession(state => state.signOut);

  return (
    <Screen>
      <View style={[styles.root, { padding: theme.spacing.xxxl, gap: theme.spacing.md }]}>
        <Text variant="title1" style={styles.centered}>
          Admin tools are on the web
        </Text>
        <Text variant="body" tone="secondary" style={styles.centered}>
          Moderation, listing fees, payouts and platform settings are all on the Pzee dashboard.
          Open it in a browser to manage them.
        </Text>
        <Button label="Sign out" variant="secondary" onPress={() => {
            void signOut();
          }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centered: { textAlign: 'center' },
});
