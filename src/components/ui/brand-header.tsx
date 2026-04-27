import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Brand } from "@/utils/constants/brand";

type BrandHeaderProps = {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  children?: React.ReactNode;
};

export function BrandHeader({ title, subtitle, onBack, right, children }: BrandHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {onBack ? (
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.85}>
            <IconSymbol name="chevron.left" size={22} color={Brand.colors.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.brandRow}>
            <Image
              source={require("../../../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText style={styles.brandText}>ESQUEL{"\n"}AHORRA</ThemedText>
          </View>
        )}

        <View style={styles.right}>{right}</View>
      </View>

      {title ? <ThemedText style={styles.title}>{title}</ThemedText> : null}
      {subtitle ? <ThemedText style={styles.subtitle}>{subtitle}</ThemedText> : null}

      {children ? <View style={styles.children}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Brand.colors.header,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 14,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 40,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 34,
    height: 34,
  },
  brandText: {
    color: Brand.colors.white,
    fontSize: 14,
    lineHeight: 16,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    marginTop: 10,
    color: Brand.colors.white,
    fontSize: 18,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 4,
    color: "rgba(255,255,255,0.92)",
    fontSize: 13,
    fontWeight: "700",
  },
  children: {
    marginTop: 10,
  },
});

