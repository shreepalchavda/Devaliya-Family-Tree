/**
 * Input sanitization and security helpers.
 * Prevents Cross-Site Scripting (XSS), script injections, and malformed inputs.
 */

/**
 * Strips HTML tags, script blocks, and suspicious protocols from user text inputs.
 * @param {string} input 
 * @param {number} maxLength 
 * @returns {string} Sanitized string
 */
export function sanitizeText(input, maxLength = 300) {
  if (input === null || input === undefined) return "";
  
  let str = String(input);

  // 1. Strip script tags and content inside them
  str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // 2. Strip all HTML tags
  str = str.replace(/<\/?[^>]+(>|$)/g, "");

  // 3. Remove dangerous protocols (javascript:, vbscript:, data:)
  str = str.replace(/(javascript|vbscript|data):/gi, "");

  // 4. Normalize multiple spaces and trim
  str = str.replace(/\s+/g, " ").trim();

  // 5. Enforce max length constraint
  if (maxLength && str.length > maxLength) {
    str = str.substring(0, maxLength);
  }

  return str;
}

/**
 * Validates and sanitizes a phone/mobile number.
 * Allows digits, plus, hyphens, and spaces only.
 * @param {string} phone 
 * @returns {string} Sanitized phone
 */
export function sanitizePhone(phone) {
  if (!phone) return "";
  // Keep only +, numbers, space, and dash
  const cleaned = String(phone).replace(/[^0-9+\- ]/g, "").trim();
  return cleaned.substring(0, 20);
}

/**
 * Validates date format (YYYY-MM-DD or standard date string).
 * @param {string} dateStr 
 * @returns {string} Clean date string
 */
export function sanitizeDate(dateStr) {
  if (!dateStr) return "";
  const cleaned = String(dateStr).trim();
  // Validates standard YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }
  return cleaned.substring(0, 30);
}
