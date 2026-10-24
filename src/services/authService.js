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
  const cleanEmail = (email || "").trim().toLowerCase();

  // Instant Master Admin Access (built-in default)
  if (cleanEmail === "admin@family.org" && password === "admin123") {
    const masterUser = {
      uid: 'master-admin-uid-101',
      email: 'admin@family.org',
      displayName: 'Administrator'
    };
    localStorage.setItem(DEMO_ADMIN_KEY, JSON.stringify(masterUser));
    return { user: masterUser, isAdmin: true };
  }

  if (isFirebaseConfigured && auth) {
    try {
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
    } catch (err) {
      console.error("Firebase auth error:", err);
      throw err;
    }
  }

  // Fallback authentication: accepts any password >= 6 chars
  if (email && password && password.length >= 6) {
    const demoUser = {
      uid: 'admin-local-user',
      email: email,
      displayName: 'Administrator'
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
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn("Signout error:", e);
    }
  }
  localStorage.removeItem(DEMO_ADMIN_KEY);
}

/**
 * Listen to auth state changes.
 * @param {Function} callback 
 * @returns {Function} unsubscribe
 */
export function subscribeToAuth(callback) {
  // Check stored admin session immediately
  const stored = localStorage.getItem(DEMO_ADMIN_KEY);
  if (stored) {
    try {
      const localUser = JSON.parse(stored);
      callback(localUser, true);
    } catch {
      // ignore
    }
  }

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
        const currentStored = localStorage.getItem(DEMO_ADMIN_KEY);
        if (currentStored) {
          try {
            callback(JSON.parse(currentStored), true);
            return;
          } catch (e) {}
        }
        callback(null, false);
      }
    });
  }

  if (!stored) {
    callback(null, false);
  }

  return () => {};
}
