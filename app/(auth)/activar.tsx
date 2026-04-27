import { authService } from "@/services/auth";
import { MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Brand } from "@/utils/constants/brand";

export default function ActivationScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 1. Validar el token al cargar
  const { data: validation, isLoading: isValidating, error: validationError } = useQuery({
    queryKey: ["validateToken", token],
    queryFn: () => authService.validateActivationToken(token!),
    enabled: !!token,
    retry: false,
  });

  // 2. Mutación para activar cuenta
  const activateMutation = useMutation({
    mutationFn: authService.activateAccount,
    onSuccess: () => {
      setIsSuccess(true);
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "No se pudo activar la cuenta");
    },
  });

  const handleActivate = () => {
    // Validaciones
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    activateMutation.mutate({
      token: token!,
      password: password,
      confirm_password: confirmPassword,
    });
  };

  if (!token) {
    return (
      <ThemedView safeArea style={styles.centerContainer}>
        <MaterialIcons name="error-outline" size={64} color={Brand.colors.danger} />
        <ThemedText type="subtitle" style={styles.errorTitle}>
          Enlace inválido
        </ThemedText>
        <ThemedText style={styles.errorText}>
          No se encontró un token de activación en el enlace.
        </ThemedText>
        <TouchableOpacity style={styles.button} onPress={() => router.replace("/login")}>
          <Text style={styles.buttonText}>Ir al Login</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (isValidating) {
    return (
      <ThemedView safeArea style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Brand.colors.primary} />
        <ThemedText style={styles.loadingText}>Validando invitación...</ThemedText>
      </ThemedView>
    );
  }

  if (validationError || (validation && !validation.valid)) {
    return (
      <ThemedView safeArea style={styles.centerContainer}>
        <MaterialIcons name="error-outline" size={64} color={Brand.colors.danger} />
        <ThemedText type="subtitle" style={styles.errorTitle}>
          {validation?.message || "Este enlace no es válido"}
        </ThemedText>
        <ThemedText style={styles.errorText}>
          El enlace de invitación puede haber vencido o ya fue utilizado.
        </ThemedText>
        <TouchableOpacity style={styles.button} onPress={() => router.replace("/login")}>
          <Text style={styles.buttonText}>Ir al Login</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (isSuccess) {
    return (
      <ThemedView safeArea style={styles.centerContainer}>
        <MaterialIcons name="check-circle-outline" size={64} color={Brand.colors.primary} />
        <ThemedText type="subtitle" style={styles.successTitle}>
          ¡Cuenta activada!
        </ThemedText>
        <ThemedText style={styles.successText}>
          Tu cuenta fue activada correctamente. Ya podés iniciar sesión con tu nueva contraseña.
        </ThemedText>
        <TouchableOpacity style={styles.button} onPress={() => router.replace("/login")}>
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedView safeArea style={styles.container}>
          <View style={styles.header}>
            <MaterialIcons name="verified-user" size={48} color={Brand.colors.primary} />
            <ThemedText style={styles.title}>Activá tu cuenta</ThemedText>
            <ThemedText style={styles.subtitle}>
              Fuiste invitada/o a formar parte de Esquel Ahorra como supervisora/or.
            </ThemedText>
            
            {validation?.email && (
              <View style={styles.emailBadge}>
                <ThemedText style={styles.emailLabel}>Activando cuenta para:</ThemedText>
                <ThemedText style={styles.emailValue}>{validation.email}</ThemedText>
              </View>
            )}

            <ThemedText style={styles.instruction}>
              Para continuar, elegí tu contraseña.
            </ThemedText>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Nueva contraseña</ThemedText>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={24}
                    color={Brand.colors.muted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Confirmar contraseña</ThemedText>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Repetí tu contraseña"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <MaterialIcons
                    name={showConfirmPassword ? "visibility" : "visibility-off"}
                    size={24}
                    color={Brand.colors.muted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {password !== "" && confirmPassword !== "" && password !== confirmPassword && (
              <Text style={styles.errorHint}>Las contraseñas no coinciden</Text>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                (activateMutation.isPending || !password || !confirmPassword) && styles.buttonDisabled,
              ]}
              onPress={handleActivate}
              disabled={activateMutation.isPending || !password || !confirmPassword}
            >
              {activateMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Activar Cuenta</Text>
              )}
            </TouchableOpacity>

            {validation?.expires_at && (
              <ThemedText style={styles.expiresInfo}>
                Este enlace expira: {new Date(validation.expires_at).toLocaleString()}
              </ThemedText>
            )}
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: Brand.colors.background,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: Brand.colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Brand.colors.muted,
    textAlign: "center",
    marginBottom: 12,
  },
  instruction: {
    fontSize: 14,
    color: Brand.colors.muted,
    textAlign: "center",
    fontWeight: "500",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Brand.colors.text,
    marginBottom: 8,
  },
  passwordWrapper: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Brand.colors.border,
    borderRadius: 12,
    padding: 14,
    paddingRight: 50,
    backgroundColor: Brand.colors.card,
    fontSize: 16,
    color: Brand.colors.text,
  },
  eyeIcon: {
    position: "absolute",
    right: 14,
    padding: 4,
  },
  button: {
    backgroundColor: Brand.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    shadowColor: Brand.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Brand.colors.muted,
  },
  errorTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: Brand.colors.danger,
  },
  errorText: {
    textAlign: "center",
    color: Brand.colors.muted,
    marginBottom: 24,
    fontSize: 15,
  },
  successTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: Brand.colors.primary,
  },
  successText: {
    textAlign: "center",
    color: Brand.colors.muted,
    marginBottom: 24,
    fontSize: 15,
  },
  errorHint: {
    color: Brand.colors.danger,
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 4,
  },
  emailBadge: {
    backgroundColor: `${Brand.colors.primary}20`,
    padding: 12,
    borderRadius: 8,
    width: "100%",
    marginBottom: 20,
    alignItems: "center",
  },
  emailLabel: {
    fontSize: 12,
    color: Brand.colors.primary,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  emailValue: {
    fontSize: 16,
    color: Brand.colors.text,
    fontWeight: "bold",
  },
  expiresInfo: {
    fontSize: 12,
    color: Brand.colors.muted,
    marginTop: 20,
    textAlign: "center",
  },
});
