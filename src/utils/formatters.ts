// Función helper para formatear números de teléfono
export function formatPhone(phone: string): string {
  // Eliminar cualquier carácter que no sea número
  const cleaned = phone.replace(/\D/g, '');
  // Formatear como: (261) 663-9266
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  // Si tiene menos de 10 dígitos, formatear como: 395-0626
  if (cleaned.length === 7) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }
  return phone;
}