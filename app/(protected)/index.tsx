import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BrandHeader } from "@/components/ui/brand-header";
import { BrandSearchBar } from "@/components/ui/brand-search-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { productsService } from "@/services/products";
import { Product } from "@/types/products";
import { Brand } from "@/utils/constants/brand";
import { storage } from "@/utils/storage";

const FEATURED_PRODUCT_KEY = "home.featuredProductId";

function formatMoney(value: number) {
  return `$${value.toLocaleString("es-AR")}`;
}

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredProductId, setFeaturedProductId] = useState<number | null>(null);
  const [isHydratingFeatured, setIsHydratingFeatured] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const raw = await storage.getItem(FEATURED_PRODUCT_KEY);
        const parsed = raw ? Number(raw) : null;
        if (isMounted && parsed && Number.isFinite(parsed)) {
          setFeaturedProductId(parsed);
        }
      } finally {
        if (isMounted) setIsHydratingFeatured(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const { data: locals } = useQuery({
    queryKey: ["locals"],
    queryFn: () => productsService.getLocals(0, 100),
  });

  const {
    data: featuredProduct,
    isLoading: isLoadingFeaturedProduct,
    refetch: refetchFeatured,
  } = useQuery({
    queryKey: ["product", featuredProductId],
    queryFn: () => productsService.getProduct(featuredProductId as number),
    enabled: featuredProductId !== null,
  });

  const compareModel = useMemo(() => {
    if (!featuredProduct) return null;
    const prices = featuredProduct.prices ? [...featuredProduct.prices] : [];
    prices.sort((a, b) => a.precio - b.precio);

    const min = prices[0]?.precio ?? null;
    const max = prices.length > 0 ? prices[prices.length - 1].precio : null;

    const minLocalId = prices[0]?.local_id ?? null;
    const minLocalName =
      minLocalId !== null ? locals?.find((l) => l.id === minLocalId)?.nombre : null;

    const savings = min !== null && max !== null ? Math.max(0, max - min) : null;

    const topPrices = prices.slice(0, 4).map((p) => {
      const localName = locals?.find((l) => l.id === p.local_id)?.nombre;
      return { id: p.id, localName: localName ?? `Local #${p.local_id}`, price: p.precio };
    });

    return {
      product: featuredProduct,
      topPrices,
      min,
      minLocalName,
      savings,
    };
  }, [featuredProduct, locals]);

  const handleSubmitSearch = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    router.push({ pathname: "/search", params: { q: trimmed } });
    setSearchQuery("");
  };

  const handleOpenScanner = () => {
    router.push("/scanner");
  };

  const handleOpenProfile = () => {
    router.push("/profile");
  };

  const handleOpenFeatured = async (product: Product) => {
    await storage.setItem(FEATURED_PRODUCT_KEY, String(product.id));
    setFeaturedProductId(product.id);
    router.push({ pathname: "/product-detail", params: { productId: product.id } });
  };

  const categories = [
    { label: "Lácteos", icon: "square.grid.2x2.fill" as const, query: "lácteos" },
    { label: "Bebidas", icon: "square.grid.2x2.fill" as const, query: "bebidas" },
    { label: "Limpieza", icon: "square.grid.2x2.fill" as const, query: "limpieza" },
    { label: "Almacén", icon: "square.grid.2x2.fill" as const, query: "almacén" },
  ];

  return (
    <ThemedView safeArea style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BrandHeader
          right={
            <TouchableOpacity style={styles.headerIconButton} onPress={handleOpenProfile} activeOpacity={0.85}>
              <IconSymbol name="person.fill" size={22} color={Brand.colors.white} />
            </TouchableOpacity>
          }
        >
          <BrandSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmit={handleSubmitSearch}
            onOpenScanner={handleOpenScanner}
          />
        </BrandHeader>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Compará precios</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>Mismo producto, diferentes precios</ThemedText>

          {isHydratingFeatured || isLoadingFeaturedProduct ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="small" color={Brand.colors.primary} />
            </View>
          ) : compareModel ? (
            <TouchableOpacity
              style={styles.compareCard}
              activeOpacity={0.8}
              onPress={() => handleOpenFeatured(compareModel.product)}
            >
              <View style={styles.compareTop}>
                <View style={styles.productThumb}>
                  <IconSymbol name="cart.fill" size={24} color={Brand.colors.primary} />
                </View>

                <View style={styles.compareMain}>
                  <ThemedText style={styles.compareName} numberOfLines={2}>
                    {compareModel.product.nombre}
                  </ThemedText>
                  <View style={styles.priceList}>
                    {compareModel.topPrices.length > 0 ? (
                      compareModel.topPrices.map((p) => (
                        <View key={p.id} style={styles.priceRow}>
                          <ThemedText style={styles.priceLocal} numberOfLines={1}>
                            {p.localName}
                          </ThemedText>
                          <ThemedText style={styles.priceValue}>{formatMoney(p.price)}</ThemedText>
                        </View>
                      ))
                    ) : (
                      <ThemedText style={styles.noPricesText}>Todavía no hay precios</ThemedText>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.compareBottom}>
                <View style={styles.badge}>
                  <ThemedText style={styles.badgeText}>
                    Más barato{compareModel.minLocalName ? ` • ${compareModel.minLocalName}` : ""}
                  </ThemedText>
                </View>

                {compareModel.savings && compareModel.savings > 0 ? (
                  <ThemedText style={styles.savingsText}>
                    {formatMoney(compareModel.savings)} menos
                  </ThemedText>
                ) : (
                  <ThemedText style={styles.savingsTextMuted}>Sin diferencia</ThemedText>
                )}
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.compareCard}>
              <View style={styles.emptyCompareRow}>
                <View style={styles.productThumb}>
                  <IconSymbol name="magnifyingglass" size={24} color={Brand.colors.primary} />
                </View>
                <View style={styles.emptyCompareText}>
                  <ThemedText style={styles.compareName}>Buscá un producto para comparar</ThemedText>
                  <ThemedText style={styles.sectionSubtitle}>Guardamos el último que abras</ThemedText>
                </View>
              </View>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push("/search")}
                activeOpacity={0.85}
              >
                <ThemedText style={styles.primaryButtonText}>Explorar productos</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {featuredProductId !== null && !compareModel ? (
            <TouchableOpacity style={styles.secondaryLink} onPress={() => refetchFeatured()}>
              <ThemedText style={styles.secondaryLinkText}>Reintentar</ThemedText>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <ThemedText style={styles.sectionTitle}>Categorías</ThemedText>
            <TouchableOpacity onPress={() => router.push("/search")}>
              <ThemedText style={styles.sectionLink}>Ver todas</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c.label}
                style={styles.categoryCard}
                activeOpacity={0.85}
                onPress={() => router.push({ pathname: "/search", params: { q: c.query } })}
              >
                <View style={styles.categoryIcon}>
                  <IconSymbol name={c.icon} size={22} color={Brand.colors.primary} />
                </View>
                <ThemedText style={styles.categoryLabel}>{c.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.ctaCard}>
            <View style={styles.ctaTextBlock}>
              <ThemedText style={styles.ctaTitle}>Sumá precios y ayudá{"\n"}a toda la comunidad</ThemedText>
              <ThemedText style={styles.ctaSubtitle}>
                Entre todos mantenemos los precios actualizados
              </ThemedText>
            </View>
            <TouchableOpacity style={styles.ctaButton} onPress={handleOpenScanner} activeOpacity={0.85}>
              <IconSymbol name="person.3.fill" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Brand.colors.background,
  },
  content: {
    paddingBottom: 24,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    color: Brand.colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: Brand.colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  sectionLink: {
    color: Brand.colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  compareCard: {
    marginTop: 12,
    backgroundColor: Brand.colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Brand.colors.border,
  },
  loadingCard: {
    marginTop: 12,
    backgroundColor: Brand.colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    alignItems: "center",
  },
  compareTop: {
    flexDirection: "row",
    gap: 12,
  },
  productThumb: {
    width: 62,
    height: 62,
    borderRadius: 14,
    backgroundColor: `${Brand.colors.primary}14`,
    alignItems: "center",
    justifyContent: "center",
  },
  compareMain: {
    flex: 1,
  },
  compareName: {
    color: Brand.colors.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  priceList: {
    gap: 6,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  priceLocal: {
    flex: 1,
    fontSize: 13,
    color: Brand.colors.text,
  },
  priceValue: {
    fontSize: 13,
    fontWeight: "800",
    color: Brand.colors.primary,
  },
  noPricesText: {
    color: Brand.colors.muted,
    fontSize: 13,
  },
  compareBottom: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Brand.colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  badge: {
    backgroundColor: `${Brand.colors.primary}14`,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: `${Brand.colors.primary}40`,
    maxWidth: "70%",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: Brand.colors.primary,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: "900",
    color: Brand.colors.primary,
  },
  savingsTextMuted: {
    fontSize: 12,
    fontWeight: "800",
    color: "#9CA3AF",
  },
  emptyCompareRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  emptyCompareText: {
    flex: 1,
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: Brand.colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 14,
  },
  secondaryLink: {
    marginTop: 10,
    alignSelf: "flex-start",
  },
  secondaryLinkText: {
    color: Brand.colors.primary,
    fontWeight: "800",
    fontSize: 13,
  },
  categoriesRow: {
    paddingVertical: 4,
    gap: 12,
  },
  categoryCard: {
    width: 92,
    backgroundColor: Brand.colors.card,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Brand.colors.border,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: `${Brand.colors.primary}14`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: Brand.colors.text,
  },
  ctaCard: {
    backgroundColor: Brand.colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  ctaTextBlock: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: Brand.colors.text,
    lineHeight: 18,
  },
  ctaSubtitle: {
    fontSize: 12,
    color: Brand.colors.muted,
    marginTop: 6,
    lineHeight: 16,
  },
  ctaButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Brand.colors.header,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomSpacer: {
    height: 24,
  },
});
