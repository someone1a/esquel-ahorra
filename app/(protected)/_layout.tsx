import { router, Tabs } from "expo-router";
import React, { useEffect } from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/store/auth-context";
import { Colors } from "@/utils/constants/theme";

export default function ProtectedLayout() {
  const { token, user, isLoading } = useAuth();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace("/login");
    }
  }, [token, isLoading]);

  if (isLoading) {
    return null; // Or a loading screen
  }

  if (!token) {
    return null; // Redirect will happen
  }

  const role = user?.rol?.toLowerCase();
  const isAdmin = role === "admin";
  const canUseSupervisor = role === "supervisor" || isAdmin;
 
   return (
     <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Buscar",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="magnifyingglass" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: "Escanear",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="qrcode" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shopping-list"
        options={{
          title: "Mi Lista",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="cart.fill" color={color} />
          ),
        }}
      />
      
      {/* Panel de Supervisor - Solo se muestra en la barra si es supervisor */}
       <Tabs.Screen
         name="supervisor/index"
         options={{
           title: "Panel",
           href: canUseSupervisor ? "/supervisor" : null,
           tabBarIcon: ({ color }) => (
             <IconSymbol size={28} name="shield.fill" color={color} />
           ),
         }}
       />
       
       {/* Panel de Admin - Solo se muestra en la barra si es admin */}
       <Tabs.Screen
         name="admin/index"
         options={{
           title: "Admin",
           href: isAdmin ? "/admin" : null,
           tabBarIcon: ({ color }) => (
             <IconSymbol size={28} name="lock.shield.fill" color={color} />
           ),
         }}
       />

       {/* Otras pantallas de supervisor siempre ocultas de la barra inferior */}
      <Tabs.Screen
        name="supervisor/pending-corrections"
        options={{
          href: null,
        }}
      />
      
      <Tabs.Screen
        name="supervisor/create-local"
        options={{
          href: null,
        }}
      />
      
      <Tabs.Screen
         name="supervisor/create-product"
         options={{
           href: null,
         }}
       />

       <Tabs.Screen
         name="admin/invite-supervisor"
         options={{
           href: null,
         }}
       />
      <Tabs.Screen
        name="product-detail"
        options={{
          href: null, // Ocultar de la barra de pestañas
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="edit-price"
        options={{
          href: null, // Ocultar de la barra de pestañas
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
