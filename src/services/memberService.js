import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  increment,
  serverTimestamp 
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { 
  getLocalMembers, 
  saveLocalMembers, 
  getLocalFamilies, 
  saveLocalFamilies 
} from "./localStore";
import { matchesMemberSearch } from "../utils/searchFilter";

const MEMBERS_COLLECTION = "members";
const FAMILIES_COLLECTION = "families";

/**
 * Get all members belonging to a family.
 * Head is placed first, followed by other members.
 */
export async function getMembersByFamilyId(familyId) {
  let members = [];

  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, MEMBERS_COLLECTION),
        where("familyId", "==", familyId)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(docSnap => {
        members.push({ id: docSnap.id, ...docSnap.data() });
      });
    } catch (err) {
      console.warn("Firestore getMembersByFamilyId error, falling back to local store:", err);
      members = [];
    }
  }

  if (members.length === 0) {
    const allLocal = getLocalMembers();
    members = allLocal.filter(m => m.familyId === familyId);
  }

  // Sort so that the family head is at the top
  members.sort((a, b) => {
    const aIsHead = (a.relationshipToHead || '').toLowerCase().includes('head') || (a.relationshipToHead || '').includes('વડા');
    const bIsHead = (b.relationshipToHead || '').toLowerCase().includes('head') || (b.relationshipToHead || '').includes('વડા');
    if (aIsHead && !bIsHead) return -1;
    if (!aIsHead && bIsHead) return 1;
    return (a.fullName || '').localeCompare(b.fullName || '');
  });

  return members;
}

/**
 * Get a member by memberId.
 */
export async function getMemberById(memberId) {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, MEMBERS_COLLECTION, memberId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
    } catch (err) {
      console.warn("Firestore getMemberById error, falling back to local store:", err);
    }
  }

  const members = getLocalMembers();
  return members.find(m => m.id === memberId || m.memberId === memberId) || null;
}

/**
 * Add a new member to an existing family.
 */
export async function createMember(familyId, memberData) {
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, MEMBERS_COLLECTION), {
        ...memberData,
        familyId,
        isPublic: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Increment family member count
      const familyRef = doc(db, FAMILIES_COLLECTION, familyId);
      await updateDoc(familyRef, {
        memberCount: increment(1),
        updatedAt: serverTimestamp()
      });

      return { id: docRef.id, memberId: docRef.id, ...memberData, familyId };
    } catch (err) {
      console.warn("Firestore createMember error, falling back to local store:", err);
    }
  }

  // Local store
  const members = getLocalMembers();
  const families = getLocalFamilies();

  const newId = "mem-" + Date.now();
  const newMember = {
    id: newId,
    memberId: newId,
    familyId,
    ...memberData,
    isPublic: true,
    createdAt: now,
    updatedAt: now
  };

  members.push(newMember);
  saveLocalMembers(members);

  // Update family member count
  const familyIndex = families.findIndex(f => f.id === familyId || f.familyId === familyId);
  if (familyIndex !== -1) {
    families[familyIndex] = {
      ...families[familyIndex],
      memberCount: (families[familyIndex].memberCount || 0) + 1,
      updatedAt: now
    };
    saveLocalFamilies(families);
  }

  return newMember;
}

/**
 * Update an existing member.
 */
export async function updateMember(memberId, updateData) {
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    try {
      const memberRef = doc(db, MEMBERS_COLLECTION, memberId);
      await updateDoc(memberRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      // If updating head's name, update in family too
      if (updateData.familyId && updateData.isHead) {
        const familyRef = doc(db, FAMILIES_COLLECTION, updateData.familyId);
        await updateDoc(familyRef, {
          headFullName: updateData.fullName,
          updatedAt: serverTimestamp()
        });
      }

      return { id: memberId, ...updateData };
    } catch (err) {
      console.warn("Firestore updateMember error, falling back to local store:", err);
    }
  }

  const members = getLocalMembers();
  const families = getLocalFamilies();

  const index = members.findIndex(m => m.id === memberId || m.memberId === memberId);
  if (index === -1) throw new Error("Member not found");

  const existing = members[index];
  const updatedMember = {
    ...existing,
    ...updateData,
    updatedAt: now
  };

  members[index] = updatedMember;
  saveLocalMembers(members);

  // Update family head name if applicable
  const isHead = (existing.relationshipToHead || '').toLowerCase().includes('head') || (existing.relationshipToHead || '').includes('વડા');
  if (isHead && updateData.fullName && existing.familyId) {
    const familyIndex = families.findIndex(f => f.id === existing.familyId || f.familyId === existing.familyId);
    if (familyIndex !== -1) {
      families[familyIndex] = {
        ...families[familyIndex],
        headFullName: updateData.fullName,
        updatedAt: now
      };
      saveLocalFamilies(families);
    }
  }

  return updatedMember;
}

/**
 * Delete a member record.
 */
export async function deleteMember(memberId, familyId) {
  if (isFirebaseConfigured && db) {
    try {
      const memberRef = doc(db, MEMBERS_COLLECTION, memberId);
      await deleteDoc(memberRef);

      if (familyId) {
        const familyRef = doc(db, FAMILIES_COLLECTION, familyId);
        await updateDoc(familyRef, {
          memberCount: increment(-1),
          updatedAt: serverTimestamp()
        });
      }
      return true;
    } catch (err) {
      console.warn("Firestore deleteMember error, falling back to local store:", err);
    }
  }

  const members = getLocalMembers();
  const families = getLocalFamilies();

  const filteredMembers = members.filter(m => m.id !== memberId && m.memberId !== memberId);
  saveLocalMembers(filteredMembers);

  if (familyId) {
    const fIndex = families.findIndex(f => f.id === familyId || f.familyId === familyId);
    if (fIndex !== -1) {
      const currentCount = families[fIndex].memberCount || 1;
      families[fIndex] = {
        ...families[fIndex],
        memberCount: Math.max(0, currentCount - 1)
      };
      saveLocalFamilies(families);
    }
  }

  return true;
}

/**
 * Search across all members and associated families.
 * @param {string} queryText
 */
export async function searchMembersAndFamilies(queryText) {
  if (!queryText || !queryText.trim()) return [];

  const families = await (async () => {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, FAMILIES_COLLECTION));
        const res = [];
        snap.forEach(d => res.push({ id: d.id, ...d.data() }));
        return res;
      } catch (e) {
        console.warn("Firestore families search fallback:", e);
      }
    }
    return getLocalFamilies();
  })();

  const members = await (async () => {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, MEMBERS_COLLECTION));
        const res = [];
        snap.forEach(d => res.push({ id: d.id, ...d.data() }));
        return res;
      } catch (e) {
        console.warn("Firestore members search fallback:", e);
      }
    }
    return getLocalMembers();
  })();

  const familyMap = new Map();
  families.forEach(f => {
    familyMap.set(f.id, f);
    if (f.familyId) familyMap.set(f.familyId, f);
  });

  const results = [];

  members.forEach(member => {
    const family = familyMap.get(member.familyId);
    if (matchesMemberSearch(member, family, queryText)) {
      results.push({
        member,
        family
      });
    }
  });

  return results;
}
