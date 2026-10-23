/**
 * Calculate age in completed years from a birth date.
 * @param {string|Date|object} dob - Date of birth (string 'YYYY-MM-DD', Date object, or Firestore Timestamp)
 * @returns {number|null} Age in years or null if invalid
 */
export function calculateAge(dob) {
  if (!dob) return null;

  let birthDate;
  if (typeof dob === 'object' && dob.toDate) {
    // Firestore Timestamp
    birthDate = dob.toDate();
  } else if (dob instanceof Date) {
    birthDate = dob;
  } else if (typeof dob === 'string') {
    // Expected 'YYYY-MM-DD'
    const parts = dob.split('-');
    if (parts.length === 3) {
      birthDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      birthDate = new Date(dob);
    }
  } else {
    return null;
  }

  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= 0 ? age : 0;
}
