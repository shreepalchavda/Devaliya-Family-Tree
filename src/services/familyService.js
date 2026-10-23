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
  writeBatch,
  serverTimestamp 
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { 
  getLocalFamilies, 
  saveLocalFamilies, 
  getLocalMembers, 
  saveLocalMembers 
} from "./localStore";

const FAMILIES_COLLECTION = "families";
const MEMBERS_COLLECTION = "members";

/**
 * Fetch all public families (or all if admin).
 */
export async function getAllFamilies() {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, FAMILIES_COLLECTION));
      const snapshot = await getDocs(q);
      const families = [];
      snapshot.forEach(docSnap => {
        families.push({ id: docSnap.id, ...docSnap.data() });
      });
      return families;
    } catch (err) {
      console.warn("Firestore fetch error, fallback to local store:", err);
    }
  }

  return getLocalFamilies();
}

/**
 * Fetch a single family by ID.
 */
export async function getFamilyById(familyId) {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, FAMILIES_COLLECTION, familyId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
    } catch (err) {
      console.warn("Firestore getFamilyById error, fallback to local store:", err);
    }
  }

  const families = getLocalFamilies();
  return families.find(f => f.id === familyId || f.familyId === familyId) || null;
}

/**
 * Creates a new family and automatically creates the corresponding member record for the family head.
 * @param {object} familyData
 * @param {object} headMemberData
 */
export async function createFamilyWithHead(familyData, headMemberData = {}) {
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    try {
      const batch = writeBatch(db);

      // 1. Create family ref
      const familyRef = doc(collection(db, FAMILIES_COLLECTION));
      const familyId = familyRef.id;

      // 2. Create member ref for the head
      const memberRef = doc(collection(db, MEMBERS_COLLECTION));
      const headMemberId = memberRef.id;

      // 3. Prepare head member document
      const headMemberPayload = {
        memberId: headMemberId,
        familyId: familyId,
        fullName: familyData.headFullName,
        relationshipToHead: "પોતે (કુટુંબના વડા - Family Head)",
        dateOfBirth: headMemberData.dateOfBirth || "",
        education: headMemberData.education || "",
        occupation: headMemberData.occupation || "",
        workplaceAddress: headMemberData.workplaceAddress || "",
        mobileNumber: headMemberData.mobileNumber || "",
        maternalSurname: headMemberData.maternalSurname || "",
        maternalVillage: headMemberData.maternalVillage || "",
        residentialAddress: headMemberData.residentialAddress || "",
        photoUrl: headMemberData.photoUrl || "",
        isPublicMobile: headMemberData.isPublicMobile !== false,
        isPublicAddress: headMemberData.isPublicAddress !== false,
        isPublic: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // 4. Prepare family document
      const familyPayload = {
        familyId: familyId,
        headMemberId: headMemberId,
        headFullName: familyData.headFullName,
        originalVillage: familyData.originalVillage,
        matajiMadhSthal: familyData.matajiMadhSthal,
        memberCount: 1,
        isPublic: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      batch.set(familyRef, familyPayload);
      batch.set(memberRef, headMemberPayload);

      await batch.commit();
      return { id: familyId, ...familyPayload, headMemberId };
    } catch (err) {
      console.warn("Firestore createFamilyWithHead error, falling back to local store:", err);
    }
  }

  // Local storage mode
  const families = getLocalFamilies();
  const members = getLocalMembers();

  const familyId = "fam-" + Date.now();
  const headMemberId = "mem-" + Date.now();

  const headMember = {
    id: headMemberId,
    memberId: headMemberId,
    familyId: familyId,
    fullName: familyData.headFullName,
    relationshipToHead: "પોતે (કુટુંબના વડા - Family Head)",
    dateOfBirth: headMemberData.dateOfBirth || "",
    education: headMemberData.education || "",
    occupation: headMemberData.occupation || "",
    workplaceAddress: headMemberData.workplaceAddress || "",
    mobileNumber: headMemberData.mobileNumber || "",
    maternalSurname: headMemberData.maternalSurname || "",
    maternalVillage: headMemberData.maternalVillage || "",
    residentialAddress: headMemberData.residentialAddress || "",
    photoUrl: headMemberData.photoUrl || "",
    isPublicMobile: headMemberData.isPublicMobile !== false,
    isPublicAddress: headMemberData.isPublicAddress !== false,
    isPublic: true,
    createdAt: now,
    updatedAt: now
  };

  const newFamily = {
    id: familyId,
    familyId: familyId,
    headMemberId: headMemberId,
    headFullName: familyData.headFullName,
    originalVillage: familyData.originalVillage,
    matajiMadhSthal: familyData.matajiMadhSthal,
    memberCount: 1,
    isPublic: true,
    createdAt: now,
    updatedAt: now
  };

  families.unshift(newFamily);
  members.unshift(headMember);

  saveLocalFamilies(families);
  saveLocalMembers(members);

  return newFamily;
}

/**
 * Updates a family record.
 */
export async function updateFamily(familyId, updateData) {
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    try {
      const familyRef = doc(db, FAMILIES_COLLECTION, familyId);
      const payload = {
        ...updateData,
        updatedAt: serverTimestamp()
      };
      await updateDoc(familyRef, payload);

      // If head full name changed, update the head member document too
      if (updateData.headFullName && updateData.headMemberId) {
        const headMemberRef = doc(db, MEMBERS_COLLECTION, updateData.headMemberId);
        await updateDoc(headMemberRef, {
          fullName: updateData.headFullName,
          updatedAt: serverTimestamp()
        });
      }

      return { id: familyId, ...updateData };
    } catch (err) {
      console.warn("Firestore updateFamily error, falling back to local store:", err);
    }
  }

  const families = getLocalFamilies();
  const members = getLocalMembers();

  const index = families.findIndex(f => f.id === familyId || f.familyId === familyId);
  if (index === -1) throw new Error("Family not found");

  const existing = families[index];
  const updatedFamily = {
    ...existing,
    ...updateData,
    updatedAt: now
  };
  families[index] = updatedFamily;
  saveLocalFamilies(families);

  // Synchronize head member's name if changed
  if (updateData.headFullName && existing.headMemberId) {
    const memberIndex = members.findIndex(m => m.id === existing.headMemberId || m.memberId === existing.headMemberId);
    if (memberIndex !== -1) {
      members[memberIndex] = {
        ...members[memberIndex],
        fullName: updateData.headFullName,
        updatedAt: now
      };
      saveLocalMembers(members);
    }
  }

  return updatedFamily;
}

/**
 * Deletes a family and all associated members (cascading delete to avoid orphaned records).
 */
export async function deleteFamily(familyId) {
  if (isFirebaseConfigured && db) {
    try {
      const batch = writeBatch(db);

      // 1. Delete family doc
      const familyRef = doc(db, FAMILIES_COLLECTION, familyId);
      batch.delete(familyRef);

      // 2. Query and delete all associated members
      const membersQuery = query(
        collection(db, MEMBERS_COLLECTION),
        where("familyId", "==", familyId)
      );
      const membersSnap = await getDocs(membersQuery);
      membersSnap.forEach(mDoc => {
        batch.delete(mDoc.ref);
      });

      await batch.commit();
      return true;
    } catch (err) {
      console.warn("Firestore deleteFamily error, falling back to local store:", err);
    }
  }

  // Local storage cascading delete
  const families = getLocalFamilies();
  const members = getLocalMembers();

  const filteredFamilies = families.filter(f => f.id !== familyId && f.familyId !== familyId);
  const filteredMembers = members.filter(m => m.familyId !== familyId);

  saveLocalFamilies(filteredFamilies);
  saveLocalMembers(filteredMembers);

  return true;
}
