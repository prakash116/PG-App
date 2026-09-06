import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/common/Text';
import { Button } from '@/components/common/Button';
import { Screen } from '@/components/common/Screen';
import { useSession } from '@/store/session';
import { useTheme } from '@/theme';

/**
 * Super Admins are deliberately not served by this app — moderation, listing
 * fees, payouts and platform settings all live on the website. Saying so beats
 * dropping an admin into a seeker tab bar that 403s on every request.
 */
export function AdminNoticeScreen() {
  const theme = useTheme();
  const signOut = useSession(state => state.signOut);

  const onSignOut = useCallback(() => {
    void signOut();
  }, [signOut]);

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
        <Button label="Sign out" variant="secondary" onPress={onSignOut} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centered: { textAlign: 'center' },
});
