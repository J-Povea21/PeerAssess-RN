import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  Button,
  Text,
  TextInput,
  Card,
} from "react-native-paper";

import { useAuthStore } from "../useAuthStore";

export default function LoginScreen() {
  const { login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [error, setError] =
    useState("");

  async function handleLogin() {
    try {
      setError("");

      await login(email, password);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed"
      );
    }
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text
            variant="headlineMedium"
            style={styles.title}
          >
            PeerAssess
          </Text>

          <Text style={styles.subtitle}>
            Sign in to continue
          </Text>

          <TextInput
            label="Email"
            mode="outlined"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />

          <TextInput
            label="Password"
            mode="outlined"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          {error ? (
            <Text style={styles.error}>
              {error}
            </Text>
          ) : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
          >
            Sign In
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },

  card: {
    padding: 12,
    borderRadius: 16,
  },

  title: {
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    textAlign: "center",
    marginBottom: 24,
  },

  input: {
    marginTop: 12,
  },

  button: {
    marginTop: 24,
    paddingVertical: 6,
  },

  error: {
    marginTop: 16,
    textAlign: "center",
  },
});