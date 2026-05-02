import { router } from "expo-router";
import Head from "expo-router/head";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Brand } from "@/utils/constants/brand";

export default function WelcomeScreen() {
  const siteUrl =
    process.env.EXPO_PUBLIC_SITE_URL ?? "https://esquei-ahorra.online";
  const title = "Esquel Ahorra | Compará precios en Esquel";
  const description =
    "Esquel Ahorra te ayuda a comparar precios en distintos comercios de Esquel para ahorrar en tus compras.";

  return (
    <ThemedView safeArea style={styles.container}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`${siteUrl}/welcome`} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <link rel="canonical" href={`${siteUrl}/welcome`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Esquel Ahorra",
              url: siteUrl,
            }),
          }}
        />
      </Head>
      <ThemedView style={styles.content}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText type="title" style={styles.title}>
          Esquel Ahorra
        </ThemedText>
        <ThemedText style={styles.subtitle}>Tu aliada en tus compras.</ThemedText>
        <ThemedText style={styles.description}>
          Te ayuda a comparar los precios en distintos comercios de Esquel.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.footer}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => router.push("/register")}
        >
          <ThemedText style={styles.registerButtonText}>
            Crear una cuenta
            </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
    backgroundColor: Brand.colors.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Brand.colors.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Brand.colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: Brand.colors.muted,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  footer: {
    paddingBottom: 40,
    backgroundColor: "transparent",
  },
  loginButton: {
    backgroundColor: Brand.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  registerButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Brand.colors.primary,
  },
  registerButtonText: {
    color: Brand.colors.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
});
