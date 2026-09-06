import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text } from '@/components/common/Text';
import { Button } from '@/components/common/Button';
import { Screen } from '@/components/common/Screen';
import { useSession } from '@/store/session';
import { useTheme } from '@/theme';

/**
 * Email or phone, plus password — the same credentials the website uses.
 *
 * The session comes back as an HttpOnly cookie, which React Native's native
 * networking stack stores and replays on its own. There is nothing to save
 * here, which is why this screen ends at navigation.goBack().
 */
export function SignInScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const signIn = useSession(state => state.signIn);
  const isSigningIn = useSession(state => state.isSigningIn);
  const error = useSession(state => state.error);
  const clearError = useSession(state => state.clearError);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const canSubmit = identifier.trim().length > 0 && password.length > 0 && !isSigningIn;

  const onSubmit = useCallback(async () => {
    try {
      await signIn({ identifier: identifier.trim(), password });
      navigation.goBack();
    } catch {
      // The store already holds the message; nothing to add here.
    }
  }, [identifier, navigation, password, signIn]);

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.lg,
      color: theme.colors.textPrimary,
      paddingHorizontal: theme.spacing.lg,
      ...theme.typography.body,
    },
  ];

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.grow}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: theme.spacing.xl, gap: theme.spacing.md }}
          keyboardShouldPersistTaps="handled"
        >
          <Text variant="overline" tone="muted">
            Welcome back
          </Text>
          <Text variant="title1">Sign in to Pzee</Text>
          <Text variant="body" tone="secondary" style={{ marginBottom: theme.spacing.md }}>
            Use the email address or phone number you registered with.
          </Text>

          <TextInput
            value={identifier}
            onChangeText={value => {
              setIdentifier(value);
              if (error) {
                clearError();
              }
            }}
            placeholder="Email or phone"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="username"
            style={inputStyle}
          />

          <TextInput
            value={password}
            onChangeText={value => {
              setPassword(value);
              if (error) {
                clearError();
              }
            }}
            placeholder="Password"
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry
            autoCapitalize="none"
            textContentType="password"
            style={inputStyle}
          />

          {error ? (
            <Text variant="callout" tone="danger">
              {error}
            </Text>
          ) : null}

          <Button
            label="Sign in"
            size="lg"
            loading={isSigningIn}
            disabled={!canSubmit}
            onPress={() => {
              void onSubmit();
            }}
            style={{ marginTop: theme.spacing.sm }}
          />

          <View style={{ marginTop: theme.spacing.md }}>
            <Text variant="caption" tone="muted" style={styles.centered}>
              New to Pzee? Accounts are created on the website for now.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grow: { flex: 1 },
  input: { height: 52, borderWidth: StyleSheet.hairlineWidth * 2 },
  centered: { textAlign: 'center' },
});
