import React from "react";
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { router } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useShoppingList } from "@/store/shopping-list-context";

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
                <IconSymbol name="minus.circle" size={24} color="#2563EB" />
              </TouchableOpacity>
              
              <ThemedText style={styles.quantityText}>{shoppingItem.quantity}</ThemedText>
              
              <TouchableOpacity
                onPress={() => updateQuantity(shoppingItem.product.id, group.localId, shoppingItem.quantity + 1)}
                style={styles.quantityBtn}
              >
                <IconSymbol name="plus.circle" size={24} color="#2563EB" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => removeItem(shoppingItem.product.id, group.localId)}
                style={styles.removeBtn}
              >
                <IconSymbol name="trash" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const totalGeneral = items.reduce((sum, item) => sum + item.selectedPrice.precio * item.quantity, 0);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Mi Lista</ThemedText>
        {items.length > 0 && (
          <TouchableOpacity onPress={handleClearList}>
            <ThemedText style={styles.clearText}>Limpiar</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="cart.badge.plus" size={64} color="#D1D5DB" />
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
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  clearText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  groupContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    borderBottomColor: "#F3F4F6",
    paddingBottom: 10,
  },
  groupTitle: {
    fontSize: 18,
    color: "#2563EB",
  },
  groupTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#059669",
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
    color: "#111827",
  },
  itemPrice: {
    fontSize: 13,
    color: "#6B7280",
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
    color: "#374151",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },
  startShoppingBtn: {
    marginTop: 30,
    backgroundColor: "#2563EB",
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
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
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
    color: "#111827",
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#059669",
  },
  footerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 5,
  },
});
