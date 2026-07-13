// src/features/staff/screens/StaffCreateScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";

// Integração das Camadas de Negócio e Infraestrutura (SOLID)
import { staffService } from '../services/staffService';
import { useToast } from '../../../shared/context/ToastContext';

// Componentes de formulário
import FormHeader from '../../../shared/components/form/FormHeader';
import FormTextInput from '../../../shared/components/form/FormTextInput';
import AvatarPicker from '../../../shared/components/pickers/AvatarPicker';
import StatusToggle from '../../../shared/components/form/StatusToggle';

// Definição estrita de tipos para a navegação do ecossistema
type RootStackParamList = {
  StaffCreate: undefined;
  StaffScreen: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'StaffCreate'>;

export default function StaffCreateScreen({ navigation }: Props) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [styles, COLORS] = useThemedStyles(getStyles);

  // Estados locais do formulário
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // Processamento e persistência das regras do domínio local
  const handleSaveStaff = async () => {
    if (!name.trim() || !role.trim() || !cpf.trim()) {
      showToast('Por favor, preencha todos os campos obrigatórios (*).', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      await staffService.createStaff({
        name,
        cpf,
        phone,
        email,
        role,
        status,
        avatarUri,
      });

      showToast('Funcionário cadastrado com sucesso!', 'success');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Erro de Validação', error.message || 'Falha ao salvar o registro no banco local.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />

      <FormHeader
        title="Novo Funcionário"
        onClose={() => navigation.goBack()}
        disabled={isSubmitting}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.formContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AvatarPicker
            avatarUri={avatarUri}
            onChange={setAvatarUri}
            disabled={isSubmitting}
          />

          <FormTextInput
            label="Nome Completo"
            required
            placeholder="Ex: João Carlos Silva"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            editable={!isSubmitting}
          />

          <FormTextInput
            label="CPF"
            required
            mask="cpf"
            placeholder="000.000.000-00"
            value={cpf}
            onChangeText={setCpf}
            editable={!isSubmitting}
          />

          <FormTextInput
            label="E-mail"
            required
            placeholder="Ex: joao@empresa.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isSubmitting}
          />

          <FormTextInput
            label="Telefone de Contato"
            mask="phone"
            placeholder="Ex: (41) 99999-0000"
            value={phone}
            onChangeText={setPhone}
            editable={!isSubmitting}
          />

          <FormTextInput
            label="Cargo / Função"
            required
            placeholder="Ex: Operador, Supervisor, Segurança"
            value={role}
            onChangeText={setRole}
            autoCapitalize="sentences"
            editable={!isSubmitting}
          />

          <StatusToggle
            status={status}
            onChange={setStatus}
            disabled={isSubmitting}
          />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, isSubmitting && { opacity: 0.7 }]}
            onPress={handleSaveStaff}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={COLORS.textDark} />
            ) : (
              <Text style={styles.saveButtonText}>Salvar Funcionário</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  footer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: '700',
  },
});