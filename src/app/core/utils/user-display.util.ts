/** Nombre visible DLT-003: nombre y apellido con un espacio (trim en cada parte). */
export function displayNameFromParts(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}

/** Iniciales DLT-003: primera letra de nombre y apellido (tras trim). */
export function initialsFromName(firstName: string, lastName: string): string {
  const first = firstName.trim();
  const last = lastName.trim();
  if (!first || !last) {
    return '';
  }
  return first[0].toUpperCase() + last[0].toUpperCase();
}
