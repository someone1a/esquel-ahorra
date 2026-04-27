import { router } from "expo-router";
import React from "react";
import {
    Alert,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BrandHeader } from "@/components/ui/brand-header";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useShoppingList } from "@/store/shopping-list-context";
import { Brand } from "@/utils/constants/brand";

export default function ShoppingListScreen() {
  const { items, removeItem, updateQuantity, clearList } = useShoppingList();

  // Agrupar por supermercado
  const groupedItems = items.reduce((acc, item) => {
    const localId = item.selectedPrice.local_id;
    if (!acc[localId]) {
      acc[localId] = {
        localId,
        items: [],
        total: 0,
      };
    }
    acc[localId].items.push(item);
    acc[localId].total += item.selectedPrice.precio * item.quantity;
    return acc;
  }, {} as Record<number, { localId: number; items: typeof items; total: number }>);

  const localGroups = Object.values(groupedItems);

  const handleClearList = () => {
    Alert.alert(
      "Limpiar lista",
      "¿Estás seguro de que quieres borrar todos los productos de tu lista?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Limpiar", style: "destructive", onPress: clearList },
      ]
    );
  };

  const renderLocalGroup = ({ item: group }: { item: typeof localGroups[0] }) => {
    // Aquí idealmente tendríamos el nombre del local, por ahora usamos el ID
    // En una app real, podrías obtener los locales del store o de una query global
    const localName = `Supermercado #${group.localId}`;

    return (
      <View style={styles.groupContainer}>
        <View style={styles.groupHeader}>
          <ThemedText type="subtitle" style={styles.groupTitle}>{localName}</ThemedText>
          <ThemedText style={styles.groupTotal}>Total: ${group.total.toLocaleString("es-AR")}</ThemedText>
        </View>

        {group.items.map((shoppingItem) => (
          <View key={`${shoppingItem.product.id}-${shoppingItem.selectedPrice.local_id}`} style={styles.itemCard}>
            <View style={styles.itemInfo}>
              <ThemedText type="defaultSemiBold" style={styles.itemName}>
                {shoppingItem.product.nombre}
              </ThemedText>
              <ThemedText style={styles.itemPrice}>
                ${shoppingItem.selectedPrice.precio.toLocaleString("es-AR")} c/u
              </ThemedText>
            </View>

            <View style={styles.quantityContainer}>
              <TouchableOpacity
                onPress={() => updateQuantity(shoppingItem.product.id, group.localId, shoppingItem.quantity - 1)}
                style={styles.quantityBtn}
              >
                <IconSymbol name="minus.circle" size={24} color={Brand.colors.primary} />
              </TouchableOpacity>
              
              <ThemedText style={styles.quantityText}>{shoppingItem.quantity}</ThemedText>
              
              <TouchableOpacity
                onPress={() => updateQuantity(shoppingItem.product.id, group.localId, shoppingItem.quantity + 1)}
                style={styles.quantityBtn}
              >
                <IconSymbol name="plus.circle" size={24} color={Brand.colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => removeItem(shoppingItem.product.id, group.localId)}
                style={styles.removeBtn}
              >
                <IconSymbol name="trash" size={20} color={Brand.colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const totalGeneral = items.reduce((sum, item) => sum + item.selectedPrice.precio * item.quantity, 0);

  return (
    <ThemedView safeArea style={styles.container}>
      <BrandHeader
        title="Mi lista"
        subtitle="Organizada por supermercado"
        right={
          items.length > 0 ? (
            <TouchableOpacity onPress={handleClearList} activeOpacity={0.85}>
              <ThemedText style={styles.clearText}>Limpiar</ThemedText>
            </TouchableOpacity>
          ) : null
        }
      />

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="cart.badge.plus" size={64} color={Brand.colors.border} />
          <ThemedText style={styles.emptyTitle}>Tu lista está vacía</ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            Escanea productos o búscalos para agregarlos aquí y ahorrar en tus compras.
          </ThemedText>
          <TouchableOpacity
            style={styles.startShoppingBtn}
            onPress={() => router.push("/")}
          >
            <ThemedText style={styles.startShoppingBtnText}>Empezar a comprar</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={localGroups}
            keyExtractor={(item) => item.localId.toString()}
            renderItem={renderLocalGroup}
            contentContainerStyle={styles.listContent}
          />
          
          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <ThemedText style={styles.totalLabel}>Total Estimado:</ThemedText>
              <ThemedText style={styles.totalValue}>${totalGeneral.toLocaleString("es-AR")}</ThemedText>
            </View>
            <ThemedText style={styles.footerSubtitle}>Organizado por supermercado para tu comodidad</ThemedText>
          </View>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.colors.background,
  },
  clearText: {
    color: Brand.colors.white,
    fontSize: 14,
    fontWeight: "900",
    backgroundColor: "rgba(0,0,0,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
  },
  groupContainer: {
    backgroundColor: Brand.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Brand.colors.border,
    paddingBottom: 10,
  },
  groupTitle: {
    fontSize: 18,
    color: Brand.colors.text,
  },
  groupTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: Brand.colors.primary,
  },
  itemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 4,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    color: Brand.colors.text,
  },
  itemPrice: {
    fontSize: 13,
    color: Brand.colors.muted,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quantityBtn: {
    padding: 2,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    minWidth: 20,
    textAlign: "center",
  },
  removeBtn: {
    marginLeft: 10,
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    color: Brand.colors.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Brand.colors.muted,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },
  startShoppingBtn: {
    marginTop: 30,
    backgroundColor: Brand.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startShoppingBtnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  footer: {
    backgroundColor: Brand.colors.card,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Brand.colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 10,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: Brand.colors.text,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: Brand.colors.primary,
  },
  footerSubtitle: {
    fontSize: 12,
    color: Brand.colors.muted,
    textAlign: "center",
    marginTop: 5,
  },
});
