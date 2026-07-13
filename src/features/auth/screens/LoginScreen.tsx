// src/features/auth/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";
import { useAuth } from "@/shared/context/AuthContext";
import { UserRole } from "../interfaces/auth";
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [styles, COLORS] = useThemedStyles(getStyles);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(
        t('auth.error_title', 'Atenção'), 
        t('auth.empty_fields', 'Por favor, preencha todos os campos.')
      );
      return;
    }

    setIsSubmitting(true);
    const success = await login(email, password, role);
    setIsSubmitting(false);

    if (!success) {
      Alert.alert(
        t('auth.error_title', 'Erro de Acesso'), 
        t('auth.invalid_credentials', 'Credenciais inválidas. Verifique seu e-mail e senha.')
      );
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.innerContainer}>
        {/* LOGO / CABECERA */}
        <View style={styles.header}>
          <Ionicons name="cube-outline" size={64} color={COLORS.primary} />
          <Text style={styles.title}>KUBIX SyS</Text>
          <Text style={styles.subtitle}>
            {t('auth.welcome_back', 'Acesse sua conta para continuar')}
          </Text>
        </View>

        {/* SELETOR DE PERFIL (ROLE) */}
        <View style={styles.roleContainer}>
          <Text style={styles.inputLabel}>{t('auth.role_label', 'Perfil de Acesso')}</Text>
          <View style={styles.roleSelector}>
            <TouchableOpacity 
              style={[
                styles.roleOption, 
                role === 'staff' && styles.roleOptionActive
              ]} 
              onPress={() => setRole('staff')}
              activeOpacity={0.8}
            >
              <Ionicons 
                name="people-outline" 
                size={18} 
                color={role === 'staff' ? '#121214' : COLORS.textMuted} 
                style={styles.roleIcon}
              />
              <Text style={[
                styles.roleText, 
                role === 'staff' && styles.roleTextActive
              ]}>
                {t('auth.role_staff', 'Colaborador')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.roleOption, 
                role === 'admin' && styles.roleOptionActive
              ]} 
              onPress={() => setRole('admin')}
              activeOpacity={0.8}
            >
              <Ionicons 
                name="shield-checkmark-outline" 
                size={18} 
                color={role === 'admin' ? '#121214' : COLORS.textMuted} 
                style={styles.roleIcon}
              />
              <Text style={[
                styles.roleText, 
                role === 'admin' && styles.roleTextActive
              ]}>
                {t('auth.role_admin', 'Gestor')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FORMULARIO */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('auth.email_label', 'E-mail')}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="exemplo@kubix.com"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('auth.password_label', 'Senha')}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity 
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={COLORS.textMuted} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* BOTÃO DE LOGIN */}
          <TouchableOpacity 
            style={[styles.button, isSubmitting && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#121214" />
            ) : (
              <Text style={styles.buttonText}>
                {t('auth.login_btn', 'Entrar')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },
  roleContainer: {
    marginBottom: 24,
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 4,
    height: 48,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  roleOptionActive: {
    backgroundColor: COLORS.primary,
  },
  roleIcon: {
    marginRight: 6,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  roleTextActive: {
    color: '#121214',
    fontWeight: '700',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    height: '100%',
  },
  eyeIcon: {
    padding: 4,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#121214',
    fontSize: 16,
    fontWeight: '700',
  },
});