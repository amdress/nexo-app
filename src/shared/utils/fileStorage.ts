// src/shared/utils/fileStorage.ts
import * as FileSystem from 'expo-file-system/legacy';

const SIGNATURES_DIR = `${FileSystem.documentDirectory}signatures/`;
const PHOTOS_DIR = `${FileSystem.documentDirectory}staff_photos/`;
const COMPANY_DIR = `${FileSystem.documentDirectory}company/`;
const CLIENTS_DIR = `${FileSystem.documentDirectory}clients/`;

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

/** Salva o logo da empresa contratista, copiando da galeria para um local persistente */
export async function saveCompanyLogo(temporaryUri: string): Promise<string> {
  await ensureDirExists(COMPANY_DIR);

  // Nome fixo: sempre existe UM único logo da empresa, então sobrescreve sempre que trocar
  const fileUri = `${COMPANY_DIR}logo.jpg`;

  await FileSystem.copyAsync({
    from: temporaryUri,
    to: fileUri,
  });

  return fileUri;
}

/** Salva o logo de uma empresa contratante, copiando da galeria para um local persistente */
export async function saveClientLogo(clientName: string, temporaryUri: string): Promise<string> {
  await ensureDirExists(CLIENTS_DIR);

  // Sanitiza o nome para um identificador de arquivo seguro
  const safeSlug = clientName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9]+/g, '_')
    .slice(0, 40);

  const fileUri = `${CLIENTS_DIR}${safeSlug}_${Date.now()}.jpg`;

  await FileSystem.copyAsync({
    from: temporaryUri,
    to: fileUri,
  });

  return fileUri;
}
