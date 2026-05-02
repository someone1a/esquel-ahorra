import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Head from "expo-router/head";
import React, { useEffect, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Brand } from "@/utils/constants/brand";

export default function ActivationScreen() {
  const params = useLocalSearchParams<{
    token?: string | string[];
    ref?: string | string[];
  }>();

  const normalize = (value: string | string[] | undefined) => {
    const raw = Array.isArray(value) ? value[0] : value;
    const trimmed = raw?.trim();
    return trimmed ? trimmed : undefined;
  };

  const referralCode = useMemo(
    () => normalize(params.ref) ?? normalize(params.token),
    [params.ref, params.token]
  );

  useEffect(() => {
    if (!referralCode) return;
    router.replace(`/register?ref=${encodeURIComponent(referralCode)}&rol=supervisor`);
  }, [referralCode]);

  return (
    <ThemedView safeArea style={styles.centerContainer}>
      <Head>
        <title>Invitación de supervisor | Esquel Ahorra</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <MaterialIcons name="verified-user" size={64} color={Brand.colors.primary} />
      <ThemedText type="subtitle" style={styles.title}>
        Invitación de supervisor
      </ThemedText>
      <ThemedText style={styles.text}>
        {referralCode
          ? "Redirigiendo al registro..."
          : "Este enlace no contiene un código de invitación válido."}
      </ThemedText>
      <TouchableOpacity style={styles.button} onPress={() => router.replace("/register")}>
        <Text style={styles.buttonText}>Ir a Registrarse</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace("/login")}>
        <ThemedText style={styles.link}>Ir al Login</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: Brand.colors.background,
  },
  title: {
    marginTop: 12,
    marginBottom: 8,
    color: Brand.colors.text,
    textAlign: "center",
  },
  text: {
    color: Brand.colors.muted,
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    backgroundColor: Brand.colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  link: {
    marginTop: 16,
    textAlign: "center",
    color: Brand.colors.primary,
    textDecorationLine: "underline",
  },
});
