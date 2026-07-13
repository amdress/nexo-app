// src/shared/utils/fileStorage.ts
import * as FileSystem from 'expo-file-system/legacy';

const SIGNATURES_DIR = `${FileSystem.documentDirectory}signatures/`;
const PHOTOS_DIR = `${FileSystem.documentDirectory}staff_photos/`;

async function ensureDirExists(dirUri: string): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(dirUri);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
  }
}

/** Salva uma assinatura (base64 PNG) no filesystem local e retorna a URI persistente */
export async function saveSignatureFile(
  dailyId: string,
  staffId: string,
  base64Png: string
): Promise<string> {
  await ensureDirExists(SIGNATURES_DIR);

  // O base64 vindo do signature-canvas costuma vir com o prefixo "data:image/png;base64,"
  const cleanBase64 = base64Png.replace(/^data:image\/\w+;base64,/, '');

  const fileUri = `${SIGNATURES_DIR}${dailyId}_${staffId}.png`;

  await FileSystem.writeAsStringAsync(fileUri, cleanBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return fileUri;
}

/** Copia a foto tirada pelo image-picker (URI temporária) para um local persistente */
export async function savePhotoFile(
  dailyId: string,
  staffId: string,
  temporaryUri: string
): Promise<string> {
  await ensureDirExists(PHOTOS_DIR);

  const fileUri = `${PHOTOS_DIR}${dailyId}_${staffId}.jpg`;

  await FileSystem.copyAsync({
    from: temporaryUri,
    to: fileUri,
  });

  return fileUri;
}