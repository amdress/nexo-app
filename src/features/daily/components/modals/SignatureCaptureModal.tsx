// src/features/daily/components/modals/StaffSignatureCaptureModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import SignatureScreen from 'react-native-signature-canvas';
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";

interface StaffSignatureCaptureModalProps {
  visible: boolean;
  staffName: string;
  onComplete: (result: { photoUri: string; signatureBase64: string }) => void;
  onCancel: () => void;
}

type CaptureStep = 'instructions' | 'countdown' | 'captured' | 'signature';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CIRCLE_SIZE = SCREEN_WIDTH * 0.72;

export default function StaffSignatureCaptureModal({
  visible,
  staffName,
  onComplete,
  onCancel,
}: StaffSignatureCaptureModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState<CaptureStep>('instructions');
  const [countdown, setCountdown] = useState(3);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);
  const [styles, COLORS] = useThemedStyles(getStyles);

  useEffect(() => {
    if (visible) {
      setStep('instructions');
      setCountdown(3);
      setPhotoUri(null);
    }
  }, [visible]);

  const handleStart = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permissão Negada', 'É necessário acesso à câmera para registrar a presença.');
        return;
      }
    }
    setStep('countdown');
  };

  useEffect(() => {
    if (step !== 'countdown') return;

    if (countdown === 0) {
      handleCapture();
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, countdown]);

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });
      setPhotoUri(photo.uri);
      setStep('captured');
      console.log('foto capturada ')
      setTimeout(() => setStep('signature'), 900);
    } catch (error) {
      Alert.alert('Erro na Câmera', 'Não foi possível capturar a foto. Tente novamente.');
      setStep('instructions');
      setCountdown(3);
    }
  };

  const handleSignatureOK = (signatureBase64: string) => {
    if (!photoUri) return;
    onComplete({ photoUri, signatureBase64 });
  };

  const handleRetry = () => {
    setStep('instructions');
    setCountdown(3);
    setPhotoUri(null);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {step !== 'signature' ? (
          <View style={styles.container}>
            <CameraView style={styles.camera} facing="front" ref={cameraRef} />

            <View style={styles.overlayFull} pointerEvents="none">
              <View style={styles.overlayTop} />
              <View style={styles.overlayMiddleRow}>
                <View style={styles.overlaySide} />
                <View style={styles.clearCircle} />
                <View style={styles.overlaySide} />
              </View>
              <View style={styles.overlayBottom} />
            </View>

            <View style={styles.interfaceWrapper}>
              <View style={styles.cardContext}>
                {step === 'instructions' && (
                  <>
                    <Text style={styles.cardTitle}>Registro de Presença</Text>
                    <Text style={styles.cardName}>{staffName}</Text>
                    <Text style={styles.cardDescription}>
                      Posicione o rosto do funcionário no círculo. A foto será capturada automaticamente após a contagem.
                    </Text>
                    <TouchableOpacity style={styles.primaryBtn} onPress={handleStart}>
                      <Text style={styles.primaryBtnText}>Iniciar Captura</Text>
                    </TouchableOpacity>
                  </>
                )}

                {step === 'countdown' && (
                  <View style={styles.countdownBox}>
                    <Text style={styles.countdownNumber}>{countdown > 0 ? countdown : '📸'}</Text>
                    <Text style={styles.countdownLabel}>Mantenha o rosto no círculo</Text>
                  </View>
                )}

                {step === 'captured' && (
                  <View style={styles.successBox}>
                    <Ionicons name="checkmark-circle" size={54} color="#1b5e20" />
                    <Text style={styles.successTitle}>Foto capturada!</Text>
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity style={styles.abortButton} onPress={onCancel}>
              <Ionicons name="close" size={26} color="#ffffff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.signatureWrapper}>
            <View style={styles.signatureHeader}>
              <Text style={styles.signatureTitle}>Assinatura</Text>
              <Text style={styles.signatureName}>{staffName}</Text>
              <Text style={styles.signatureHint}>Assine no espaço abaixo para confirmar a presença</Text>
            </View>

            <View style={styles.signatureCanvasBox}>
              <SignatureScreen
                onOK={handleSignatureOK}
                onEmpty={() => Alert.alert('Assinatura vazia', 'É necessário assinar para confirmar.')}
                descriptionText=""
                confirmText="Confirmar"
                clearText="Limpar"
                webStyle={signatureWebStyle}
              />
            </View>

            <TouchableOpacity style={styles.retryPhotoBtn} onPress={handleRetry}>
              <Ionicons name="camera-outline" size={16} color={COLORS.textMuted} />
              <Text style={styles.retryPhotoText}>Refazer foto</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const signatureWebStyle = `
  .m-signature-pad {
      position: fixed;
      inset: 0;
      box-shadow: none;
      border: none;
  }

  .m-signature-pad--body {
      border: 1px solid #ddd;
      bottom: 70px !important;
  }

  .m-signature-pad--footer {
      display: flex !important;
      position: absolute !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      height: 70px !important;
      justify-content: space-evenly !important;
      align-items: center !important;
      background: white !important;
      z-index: 99999 !important;
  }

  .button {
      display: inline-block !important;
      background: #1976d2 !important;
      color: white !important;
      border-radius: 8px !important;
      padding: 1px 20px !important;
      font-size: 16px !important;
  }

  html,
  body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: transparent;
  }
`;

const getStyles = (COLORS: any) =>  StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  camera: { ...StyleSheet.absoluteFillObject },
  abortButton: {
    position: 'absolute',
    top: 55,
    right: 22,
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: 10,
    borderRadius: 24,
  },
  overlayFull: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  overlayTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  overlayMiddleRow: { height: CIRCLE_SIZE, flexDirection: 'row' },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  clearCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 3,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  overlayBottom: { flex: 1.3, backgroundColor: 'rgba(0,0,0,0.7)' },
  interfaceWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingBottom: 44 },
  cardContext: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 10,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark, marginBottom: 4 },
  cardName: { fontSize: 14, fontWeight: '600', color: COLORS.primary, marginBottom: 8 },
  cardDescription: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  primaryBtn: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12, width: '100%', alignItems: 'center' },
  primaryBtnText: { color: COLORS.textDark, fontWeight: '700', fontSize: 15 },
  countdownBox: { alignItems: 'center', paddingVertical: 12 },
  countdownNumber: { fontSize: 48, fontWeight: '800', color: COLORS.primary },
  countdownLabel: { fontSize: 13, color: COLORS.textMuted, marginTop: 8 },
  successBox: { alignItems: 'center', paddingVertical: 12 },
  successTitle: { fontSize: 20, fontWeight: '800', color: '#1b5e20', marginTop: 10 },
  signatureWrapper: { flex: 1, backgroundColor: COLORS.background },
  signatureHeader: { padding: 20, alignItems: 'center' },
  signatureTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  signatureName: { fontSize: 14, fontWeight: '600', color: COLORS.primary, marginTop: 2 },
  signatureHint: { fontSize: 12, color: COLORS.textMuted, marginTop: 6, textAlign: 'center' },
  signatureCanvasBox: { flex: 1, minHeight: 320 },
  retryPhotoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', padding: 12 },
  retryPhotoText: { color: COLORS.textMuted, fontSize: 12 },
});