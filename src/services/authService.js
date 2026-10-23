import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "./firebase";

const DEMO_ADMIN_KEY = 'family_directory_demo_admin';

/**
 * Sign in admin user.
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<object>}
 */
export async function loginAdmin(email, password) {
  if (isFirebaseConfigured && auth) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Verify admin role in Firestore admins collection if available
    try {
      if (db) {
        const adminDoc = await getDoc(doc(db, "admins", user.uid));
        if (adminDoc.exists()) {
          return { user, isAdmin: true, role: adminDoc.data().role || 'admin' };
        }
      }
    } catch (e) {
      console.warn("Admin doc check warning:", e);
    }

    // Default authenticated user to admin
    return { user, isAdmin: true };
  }

  // Demo mode authentication: accepts any password >= 6 chars for demo admin or admin@family.org
  if (email && password && password.length >= 6) {
    const demoUser = {
      uid: 'demo-admin-uid-101',
      email: email,
      displayName: 'Administrator (Demo)'
    };
    localStorage.setItem(DEMO_ADMIN_KEY, JSON.stringify(demoUser));
    return { user: demoUser, isAdmin: true };
  }

  throw new Error("Invalid email or password. Password must be at least 6 characters.");
}

/**
 * Sign out current admin user.
 */
export async function logoutAdmin() {
  if (isFirebaseConfigured && auth) {
    await firebaseSignOut(auth);
  }
  localStorage.removeItem(DEMO_ADMIN_KEY);
}

/**
 * Listen to auth state changes.
 * @param {Function} callback 
 * @returns {Function} unsubscribe
 */
export function subscribeToAuth(callback) {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let isAdmin = true;
        try {
          if (db) {
            const adminDoc = await getDoc(doc(db, "admins", firebaseUser.uid));
            if (adminDoc.exists()) {
              isAdmin = true;
            }
          }
        } catch (e) {
          console.warn("Could not verify admin status from collection, allowing auth session:", e);
        }
        callback(firebaseUser, isAdmin);
      } else {
        callback(null, false);
      }
    });
  }

  // Check demo session
  const stored = localStorage.getItem(DEMO_ADMIN_KEY);
  if (stored) {
    try {
      const demoUser = JSON.parse(stored);
      callback(demoUser, true);
    } catch {
      callback(null, false);
    }
  } else {
    callback(null, false);
  }

  return () => {};
}
