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
  saveLocalFamilies,
  saveLocalAll,
  fetchLiveLocalData 
} from "./localStore";
import { matchesMemberSearch } from "../utils/searchFilter";
import { sanitizeText, sanitizePhone, sanitizeDate } from "../utils/sanitize";

const MEMBERS_COLLECTION = "members";
const FAMILIES_COLLECTION = "families";

/**
 * Fetch all members across all families.
 */
export async function getAllMembers() {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, MEMBERS_COLLECTION));
      const snapshot = await getDocs(q);
      const members = [];
      snapshot.forEach(docSnap => {
        members.push({ id: docSnap.id, ...docSnap.data() });
      });
      return members;
    } catch (err) {
      console.warn("Firestore getAllMembers error, fallback to local store:", err);
    }
  }

  await fetchLiveLocalData();
  return getLocalMembers();
}

/**
 * Get all members belonging to a family.
 * Head is placed first, followed by other members.
 */
export async function getMembersByFamilyId(familyId) {
  let members = [];
  let firestoreSuccess = false;

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
      firestoreSuccess = true;
    } catch (err) {
      console.warn("Firestore getMembersByFamilyId error, falling back to local store:", err);
      members = [];
    }
  }

  // Fallback to local store only if Firestore is unconfigured or errored out
  if (!firestoreSuccess) {
    await fetchLiveLocalData();
    const allLocal = getLocalMembers();
    const allFamilies = getLocalFamilies();
    const currentFamily = allFamilies.find(f => f.id === familyId || f.familyId === familyId);
    
    const validIds = new Set([
      String(familyId).trim(),
      currentFamily?.id ? String(currentFamily.id).trim() : null,
      currentFamily?.familyId ? String(currentFamily.familyId).trim() : null
    ].filter(Boolean));

    members = allLocal.filter(m => validIds.has(String(m.familyId).trim()));
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
      return null;
    } catch (err) {
      console.warn("Firestore getMemberById error, falling back to local store:", err);
    }
  }

  await fetchLiveLocalData();
  const members = getLocalMembers();
  return members.find(m => m.id === memberId || m.memberId === memberId) || null;
}

/**
 * Add a new member to an existing family.
 */
export async function createMember(familyId, memberData) {
  const now = new Date().toISOString();
  const isHead = (memberData.relationshipToHead || '').toLowerCase().includes('head') || (memberData.relationshipToHead || '').includes('વડા');

  // Clean and sanitize member payload - Mobile number is only stored for the Family Head
  const cleanMemberData = {
    fullName: sanitizeText(memberData.fullName, 100),
    gender: sanitizeText(memberData.gender || "", 20),
    relationshipToHead: sanitizeText(memberData.relationshipToHead, 100),
    dateOfBirth: sanitizeDate(memberData.dateOfBirth),
    education: sanitizeText(memberData.education, 100),
    occupation: sanitizeText(memberData.occupation, 100),
    workplaceAddress: sanitizeText(memberData.workplaceAddress, 250),
    ...(isHead && memberData.mobileNumber ? {
      mobileNumber: sanitizePhone(memberData.mobileNumber),
      isPublicMobile: memberData.isPublicMobile !== false
    } : {}),
    maternalSurname: sanitizeText(memberData.maternalSurname, 100),
    maternalVillage: sanitizeText(memberData.maternalVillage, 100),
    residentialAddress: sanitizeText(memberData.residentialAddress, 250),
    photoUrl: "",
    isPublicAddress: memberData.isPublicAddress !== false,
    isPublic: true
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, MEMBERS_COLLECTION), {
        ...cleanMemberData,
        familyId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Increment family member count
      const familyRef = doc(db, FAMILIES_COLLECTION, familyId);
      await updateDoc(familyRef, {
        memberCount: increment(1),
        updatedAt: serverTimestamp()
      });

      return { id: docRef.id, memberId: docRef.id, ...cleanMemberData, familyId };
    } catch (err) {
      console.warn("Firestore createMember error, falling back to local store:", err);
    }
  }

  // Local store
  await fetchLiveLocalData();
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

  // Update family member count
  const familyIndex = families.findIndex(f => f.id === familyId || f.familyId === familyId);
  if (familyIndex !== -1) {
    families[familyIndex] = {
      ...families[familyIndex],
      memberCount: (families[familyIndex].memberCount || 0) + 1,
      updatedAt: now
    };
  }

  await saveLocalAll(families, members);
  return newMember;
}

/**
 * Update an existing member.
 */
export async function updateMember(memberId, updateData) {
  const now = new Date().toISOString();

  // Sanitize fields if present
  const cleanData = { ...updateData };
  if (cleanData.fullName) cleanData.fullName = sanitizeText(cleanData.fullName, 100);
  if (cleanData.gender) cleanData.gender = sanitizeText(cleanData.gender, 20);
  if (cleanData.relationshipToHead) cleanData.relationshipToHead = sanitizeText(cleanData.relationshipToHead, 100);
  if (cleanData.dateOfBirth) cleanData.dateOfBirth = sanitizeDate(cleanData.dateOfBirth);
  if (cleanData.education) cleanData.education = sanitizeText(cleanData.education, 100);
  if (cleanData.occupation) cleanData.occupation = sanitizeText(cleanData.occupation, 100);
  if (cleanData.workplaceAddress) cleanData.workplaceAddress = sanitizeText(cleanData.workplaceAddress, 250);
  if (cleanData.mobileNumber) cleanData.mobileNumber = sanitizePhone(cleanData.mobileNumber);
  if (cleanData.maternalSurname) cleanData.maternalSurname = sanitizeText(cleanData.maternalSurname, 100);
  if (cleanData.maternalVillage) cleanData.maternalVillage = sanitizeText(cleanData.maternalVillage, 100);
  if (cleanData.residentialAddress) cleanData.residentialAddress = sanitizeText(cleanData.residentialAddress, 250);

  if (isFirebaseConfigured && db) {
    try {
      const memberRef = doc(db, MEMBERS_COLLECTION, memberId);
      await updateDoc(memberRef, {
        ...cleanData,
        updatedAt: serverTimestamp()
      });

      // If updating head's name, update in family too
      if (cleanData.familyId && cleanData.isHead) {
        const familyRef = doc(db, FAMILIES_COLLECTION, cleanData.familyId);
        await updateDoc(familyRef, {
          headFullName: cleanData.fullName,
          updatedAt: serverTimestamp()
        });
      }

      return { id: memberId, ...cleanData };
    } catch (err) {
      console.warn("Firestore updateMember error, falling back to local store:", err);
    }
  }

  await fetchLiveLocalData();
  const members = getLocalMembers();
  const families = getLocalFamilies();

  const index = members.findIndex(m => m.id === memberId || m.memberId === memberId);
  if (index === -1) throw new Error("Member not found");

  const existing = members[index];
  const updatedMember = {
    ...existing,
    ...cleanData,
    updatedAt: now
  };

  members[index] = updatedMember;

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
    }
  }

  await saveLocalAll(families, members);
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

  await fetchLiveLocalData();
  const members = getLocalMembers();
  const families = getLocalFamilies();

  const filteredMembers = members.filter(m => m.id !== memberId && m.memberId !== memberId);

  if (familyId) {
    const fIndex = families.findIndex(f => f.id === familyId || f.familyId === familyId);
    if (fIndex !== -1) {
      const currentCount = families[fIndex].memberCount || 1;
      families[fIndex] = {
        ...families[fIndex],
        memberCount: Math.max(0, currentCount - 1)
      };
    }
  }

  await saveLocalAll(families, filteredMembers);
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
    await fetchLiveLocalData();
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
    await fetchLiveLocalData();
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
