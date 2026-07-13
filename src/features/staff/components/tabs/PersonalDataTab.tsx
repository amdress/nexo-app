// src/features/staff/components/PersonalDataTab.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";
import { LoaderBar } from '../../../../layouts/components/LoaderBar';
import { staffService } from '../../services/staffService';

interface PersonalDataTabProps {
  staffId: string;
}

export function PersonalDataTab({ staffId }: PersonalDataTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [styles, COLORS] = useThemedStyles(getStyles);

  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const staff = await staffService.getStaffById(staffId);
        setEditName(staff.name);
        setEditRole(staff.role);
        setEditPhone(staff.phone || '');
        setEditEmail(staff.email || '');
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os dados do funcionário.');
      } finally {
        setLoading(false);
      }
    };
    fetchStaffData();
  }, [staffId]);

  const handleSave = async () => {
    if (!editName.trim() || !editRole.trim()) {
      Alert.alert('Atenção', 'Nome e cargo são obrigatórios.');
      return;
    }
    try {
      setIsSaving(true);
      await staffService.updateStaff(staffId, {
        name: editName,
        role: editRole,
        phone: editPhone,
        email: editEmail,
      });
      setIsEditing(false);
    } catch (error: any) {
      setIsSaving(false);
      Alert.alert('Erro', error.message || 'Não foi possível salvar as alterações.');
    }
  };

  const InfoRow = ({ label, value, placeholder }: { label: string; value: string; placeholder: string }) => (
    <View style={styles.infoRowContainer}>
      <Text style={styles.infoRowLabel}>{label}</Text>
      <Text style={value ? styles.infoRowValue : styles.infoRowPlaceholder}>
        {value || placeholder}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.tabContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Informações Gerais</Text>

        {!isEditing ? (
          <View style={styles.readContainer}>
            <InfoRow label="Nome Completo" value={editName} placeholder="Não informado" />
            <InfoRow label="Cargo / Função" value={editRole} placeholder="Não informado" />
            <InfoRow label="Telefone de Contato" value={editPhone} placeholder="Nenhum número cadastrado" />
            <InfoRow label="Endereço de E-mail" value={editEmail} placeholder="Nenhum e-mail cadastrado" />
          </View>
        ) : (
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome Completo</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Nome do funcionário"
                placeholderTextColor="#555"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cargo</Text>
              <TextInput
                style={styles.input}
                value={editRole}
                onChangeText={setEditRole}
                placeholder="Cargo ou função"
                placeholderTextColor="#555"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefone</Text>
              <TextInput
                style={styles.input}
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
                placeholder="Número de contato"
                placeholderTextColor="#555"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="funcionario@empresa.com"
                placeholderTextColor="#555"
              />
            </View>
          </View>
        )}

        <View style={styles.actionRow}>
          {isEditing ? (
            <>
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setIsEditing(false)}>
                <Text style={styles.btnTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSave}>
                <Text style={styles.btnTextSave}>Salvar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={[styles.btn, styles.btnEdit]} onPress={() => setIsEditing(true)}>
              <Text style={styles.btnTextEdit}>Modificar Informações</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <LoaderBar
        visible={isSaving}
        message="Sincronizando com o banco de dados..."
        onAnimationComplete={() => setIsSaving(false)}
      />
    </ScrollView>
  );
}

const getStyles = (COLORS: any) =>  StyleSheet.create({
  tabContainer: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', height: 200 },
  loadingText: { color: '#8E8E93', fontSize: 14 },
  card: {
    backgroundColor: COLORS.surface || '#1E1E1E',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  readContainer: { marginBottom: 12 },
  infoRowContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 14,
  },
  infoRowLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted || '#8E8E93',
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  infoRowValue: { fontSize: 15, color: '#FFFFFF', fontWeight: '500' },
  infoRowPlaceholder: { fontSize: 15, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' },
  formContainer: { marginBottom: 8 },
  inputGroup: { marginBottom: 18 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#FFFFFF',
  },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btn: { flex: 1, paddingVertical: 15, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnEdit: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  btnCancel: { backgroundColor: 'rgba(255, 77, 77, 0.1)' },
  btnSave: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  btnTextEdit: { color: '#4CAF50', fontWeight: '700', fontSize: 14 },
  btnTextCancel: { color: '#FF4D4D', fontWeight: '600', fontSize: 14 },
  btnTextSave: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});