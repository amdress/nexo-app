/**
 * Utilitarios globales para la limpieza y sanitización de datos
 * antes de ser procesados por los servicios o guardados en SQLite.
 */
export const sanitizers = {
  /**
   * Elimina cualquier carácter que no sea un número.
   * Ideal para limpiar documentos como CPF, CNPJ, ZIP codes o teléfonos.
   * * @param value - El string crudo proveniente de la UI (ej: "123.456.789-00")
   * @returns Un string compuesto únicamente por dígitos numéricos (ej: "12345678900")
   */
  sanitizeDocument(value: string): string {
    if (!value) return "";
    return value.replace(/\D/g, "");
  },

  /**
   * Sanitiza y normaliza correos electrónicos eliminando espacios en blanco
   * y convirtiendo todo a minúsculas para evitar duplicados por tipeo.
   */
  sanitizeEmail(value: string): string {
    if (!value) return "";
    return value.trim().toLowerCase();
  }
};