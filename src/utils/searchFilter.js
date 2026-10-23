/**
 * Normalizes a string for search comparisons (lowercase, trimmed).
 */
export function normalizeSearchText(text) {
  if (!text) return '';
  return String(text).toLowerCase().trim();
}

/**
 * Checks whether any of the member's or family's search fields match the query term.
 * Searches across:
 * - Member full name
 * - Family head's name
 * - Family original village
 * - Maternal family surname
 * - Maternal family village
 * - Occupation or business
 * - Education
 */
export function matchesMemberSearch(member, family, query) {
  const q = normalizeSearchText(query);
  if (!q) return true;

  const fieldsToSearch = [
    member.fullName,
    member.relationshipToHead,
    member.occupation,
    member.education,
    member.maternalSurname,
    member.maternalVillage,
    family?.headFullName,
    family?.originalVillage,
    family?.matajiMadhSthal
  ];

  return fieldsToSearch.some(field => {
    if (!field) return false;
    return normalizeSearchText(field).includes(q);
  });
}

/**
 * Checks whether a family matches a search query.
 */
export function matchesFamilySearch(family, query) {
  const q = normalizeSearchText(query);
  if (!q) return true;

  const fieldsToSearch = [
    family.headFullName,
    family.originalVillage,
    family.matajiMadhSthal
  ];

  return fieldsToSearch.some(field => {
    if (!field) return false;
    return normalizeSearchText(field).includes(q);
  });
}
