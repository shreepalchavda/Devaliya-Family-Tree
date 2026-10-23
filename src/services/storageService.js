import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, isFirebaseConfigured } from "./firebase";

/**
 * Validates file type and size.
 * @param {File} file
 * @throws {Error} if validation fails
 */
export function validateImageFile(file) {
  if (!file) return;

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Please select a valid image file (JPG, PNG, or WebP).');
  }

  // Max 5MB
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('Image size exceeds 5MB. Please choose a smaller image.');
  }
}

/**
 * Uploads a member profile photo.
 * @param {File} file
 * @param {string} memberId
 * @returns {Promise<string>} Download URL or Base64 data URL
 */
export async function uploadMemberPhoto(file, memberId = 'temp') {
  validateImageFile(file);

  if (isFirebaseConfigured && storage) {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `profile_photos/${memberId}_${Date.now()}.${fileExt}`;
    const storageRef = ref(storage, filePath);
    
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type
    });
    return await getDownloadURL(snapshot.ref);
  }

  // Demo / local fallback: convert to base64 Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
