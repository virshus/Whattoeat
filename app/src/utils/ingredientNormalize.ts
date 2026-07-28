/** Strip diacritics so "Limón" / "limon" match. */
export function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '');
}

/**
 * Spanish singularization for shopping-list / category keys.
 * "papas" → "papa", "tomates" → "tomate".
 * Consonant + "es" plurals ("limones") → drop "es" when the "ones/anes/…" pattern applies.
 */
function singularizeToken(token: string): string {
  if (token.length <= 3) return token;

  const irregular: Record<string, string> = {
    panes: 'pan',
    peces: 'pez',
    raices: 'raiz',
    lapices: 'lapiz',
  };
  if (irregular[token]) return irregular[token];

  if (token.endsWith('ces') && token.length > 4) {
    return `${token.slice(0, -3)}z`;
  }

  if (/(?:ones|anes|enes|ores|ares|eres|ures|ales|eles|iles|oles|ules)$/.test(token)) {
    if (/(?:entes|antes|intes|untes)$/.test(token)) {
      return token.slice(0, -1);
    }
    return token.slice(0, -2);
  }

  if (/[aeiou]s$/.test(token)) {
    return token.slice(0, -1);
  }

  return token;
}

/** Canonical ingredient key: "Papa" and "Papas" → same bucket. */
export function normalizeName(name: string): string {
  return stripAccents(name.toLowerCase().trim())
    .split(/\s+/)
    .filter(Boolean)
    .map(singularizeToken)
    .join(' ');
}
