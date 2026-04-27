import React, { useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

import LoginScreen from '@/src/features/auth/LoginScreen';
import { restoreSessionService } from '@/src/features/auth/restoreSessionService';
import { useAuthStore } from '@/src/features/auth/useAuthStore';


function StudentHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Welcome
      </Text>

      <Text style={styles.subtitle}>
        {user?.email}
      </Text>

      <Text style={styles.subtitle}>
        ID: {user?.canonicalUserId}
      </Text>

      <Text
        style={styles.logout}
        onPress={logout}
      >
        Logout
      </Text>
    </View>
  );
}

export default function AppNavigator() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const login = useAuthStore((state) => state.login);

useEffect(() => {
  const restore = async () => {
    const session =
      await restoreSessionService();

    if (session) {
      await login(session);
    } else {
      useAuthStore.setState({
        isLoading: false,
      });
    }
  };

  restore();
}, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <StudentHomeScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEBCE',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4A4A4A',
    marginBottom: 16,
  },

  subtitle: {
    fontSize: 16,
    marginBottom: 8,
    color: '#4A4A4A',
  },

  logout: {
    marginTop: 32,
    color: '#BB8588',
    fontWeight: '700',
  },
});