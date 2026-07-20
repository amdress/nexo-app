// src/features/daily/hooks/useReceiptCapture.ts
import { useRef, useState } from 'react';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export function useReceiptCapture() {
  const viewRef = useRef<any>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  /** Captura o componente referenciado e retorna a URI da imagem gerada */
  const captureAsImage = async (): Promise<string | null> => {
    if (!viewRef.current) return null;

    try {
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
      return uri;
    } catch (error) {
      console.error('[RECEIPT_CAPTURE] Erro ao capturar imagem:', error);
      return null;
    }
  };

  /** Captura e abre o seletor nativo de compartilhamento (WhatsApp, etc.) */
  const captureAndShare = async () => {
    setIsCapturing(true);
    try {
      const uri = await captureAsImage();
      if (!uri) {
        Alert.alert('Erro', 'Não foi possível gerar o comprovante.');
        return;
      }

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Indisponível', 'O compartilhamento não está disponível neste dispositivo.');
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Compartilhar comprovante',
      });
    } catch (error) {
      console.error('[RECEIPT_CAPTURE] Erro ao compartilhar:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar o comprovante.');
    } finally {
      setIsCapturing(false);
    }
  };

  return { viewRef, isCapturing, captureAsImage, captureAndShare };
}