/**
 * Format a date for user-friendly display.
 * @param {string|Date|object} dateInput
 * @returns {string} Formatted date string (e.g. "15 Jan 1985") or empty string
 */
export function formatDate(dateInput) {
  if (!dateInput) return '';

  let date;
  if (typeof dateInput === 'object' && dateInput.toDate) {
    date = dateInput.toDate();
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'string') {
    const parts = dateInput.split('-');
    if (parts.length === 3) {
      date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      date = new Date(dateInput);
    }
  } else {
    return '';
  }

  if (isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}
