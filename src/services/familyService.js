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
  saveLocalMembers,
  saveLocalAll,
  fetchLiveLocalData 
} from "./localStore";
import { sanitizeText, sanitizePhone, sanitizeDate } from "../utils/sanitize";

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

  await fetchLiveLocalData();
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
      return null;
    } catch (err) {
      console.warn("Firestore getFamilyById error, fallback to local store:", err);
    }
  }

  await fetchLiveLocalData();
  const families = getLocalFamilies();
  return families.find(f => f.id === familyId || f.familyId === familyId) || null;
}

/**
 * Creates a new family and automatically creates the corresponding member record for the family head
 * and any additional family members added in the same step.
 * @param {object} familyData
 * @param {object} headMemberData
 * @param {Array} additionalMembers
 */
export async function createFamilyWithHead(familyData, headMemberData = {}, additionalMembers = []) {
  const now = new Date().toISOString();
  const totalCount = 1 + (additionalMembers ? additionalMembers.length : 0);

  // Sanitized family data
  const cleanHeadName = sanitizeText(familyData.headFullName, 100);
  const cleanVillage = sanitizeText(familyData.originalVillage, 100);
  const cleanMadhSthal = sanitizeText(familyData.matajiMadhSthal, 100);

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
        fullName: cleanHeadName,
        relationshipToHead: "પોતે (કુટુંબના વડા - Family Head)",
        dateOfBirth: sanitizeDate(headMemberData.dateOfBirth),
        education: sanitizeText(headMemberData.education, 100),
        occupation: sanitizeText(headMemberData.occupation, 100),
        workplaceAddress: sanitizeText(headMemberData.workplaceAddress, 250),
        mobileNumber: sanitizePhone(headMemberData.mobileNumber),
        maternalSurname: sanitizeText(headMemberData.maternalSurname, 100),
        maternalVillage: sanitizeText(headMemberData.maternalVillage, 100),
        residentialAddress: sanitizeText(headMemberData.residentialAddress, 250),
        photoUrl: "",
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
        headFullName: cleanHeadName,
        originalVillage: cleanVillage,
        matajiMadhSthal: cleanMadhSthal,
        memberCount: totalCount,
        isPublic: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      batch.set(familyRef, familyPayload);
      batch.set(memberRef, headMemberPayload);

      // 5. Add all additional members
      if (Array.isArray(additionalMembers) && additionalMembers.length > 0) {
        additionalMembers.forEach((extraMem) => {
          const extraMemberRef = doc(collection(db, MEMBERS_COLLECTION));
          const extraId = extraMemberRef.id;
          const extraPayload = {
            memberId: extraId,
            familyId: familyId,
            fullName: sanitizeText(extraMem.fullName, 100),
            relationshipToHead: sanitizeText(extraMem.relationshipToHead, 100),
            dateOfBirth: sanitizeDate(extraMem.dateOfBirth),
            education: sanitizeText(extraMem.education, 100),
            occupation: sanitizeText(extraMem.occupation, 100),
            workplaceAddress: sanitizeText(extraMem.workplaceAddress, 250),
            mobileNumber: sanitizePhone(extraMem.mobileNumber),
            maternalSurname: sanitizeText(extraMem.maternalSurname, 100),
            maternalVillage: sanitizeText(extraMem.maternalVillage, 100),
            residentialAddress: sanitizeText(extraMem.residentialAddress, 250),
            photoUrl: "",
            isPublicMobile: extraMem.isPublicMobile !== false,
            isPublicAddress: extraMem.isPublicAddress !== false,
            isPublic: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          batch.set(extraMemberRef, extraPayload);
        });
      }

      await batch.commit();
      return { id: familyId, ...familyPayload, headMemberId };
    } catch (err) {
      console.warn("Firestore createFamilyWithHead error, falling back to local store:", err);
    }
  }

  // Local storage mode
  await fetchLiveLocalData();
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
    memberCount: totalCount,
    isPublic: true,
    createdAt: now,
    updatedAt: now
  };

  families.unshift(newFamily);
  members.unshift(headMember);

  // Add additional members to local store
  if (Array.isArray(additionalMembers) && additionalMembers.length > 0) {
    additionalMembers.forEach((extraMem, idx) => {
      const extraId = "mem-" + (Date.now() + idx + 1);
      members.push({
        ...extraMem,
        id: extraId,
        memberId: extraId,
        familyId: familyId,
        isPublic: true,
        createdAt: now,
        updatedAt: now
      });
    });
  }

  await saveLocalAll(families, members);

  return newFamily;
}

/**
 * Updates a family record.
 */
export async function updateFamily(familyId, updateData) {
  const now = new Date().toISOString();

  const cleanData = { ...updateData };
  if (cleanData.headFullName) cleanData.headFullName = sanitizeText(cleanData.headFullName, 100);
  if (cleanData.originalVillage) cleanData.originalVillage = sanitizeText(cleanData.originalVillage, 100);
  if (cleanData.matajiMadhSthal) cleanData.matajiMadhSthal = sanitizeText(cleanData.matajiMadhSthal, 100);

  if (isFirebaseConfigured && db) {
    try {
      const familyRef = doc(db, FAMILIES_COLLECTION, familyId);
      const payload = {
        ...cleanData,
        updatedAt: serverTimestamp()
      };
      await updateDoc(familyRef, payload);

      // If head full name changed, update the head member document too
      if (cleanData.headFullName && cleanData.headMemberId) {
        const headMemberRef = doc(db, MEMBERS_COLLECTION, cleanData.headMemberId);
        await updateDoc(headMemberRef, {
          fullName: cleanData.headFullName,
          updatedAt: serverTimestamp()
        });
      }

      return { id: familyId, ...cleanData };
    } catch (err) {
      console.warn("Firestore updateFamily error, falling back to local store:", err);
    }
  }

  await fetchLiveLocalData();
  const families = getLocalFamilies();
  const members = getLocalMembers();

  const index = families.findIndex(f => f.id === familyId || f.familyId === familyId);
  if (index === -1) throw new Error("Family not found");

  const existing = families[index];
  const updatedFamily = {
    ...existing,
    ...cleanData,
    updatedAt: now
  };
  families[index] = updatedFamily;

  // Synchronize head member's name if changed
  if (cleanData.headFullName && existing.headMemberId) {
    const memberIndex = members.findIndex(m => m.id === existing.headMemberId || m.memberId === existing.headMemberId);
    if (memberIndex !== -1) {
      members[memberIndex] = {
        ...members[memberIndex],
        fullName: cleanData.headFullName,
        updatedAt: now
      };
    }
  }

  await saveLocalAll(families, members);
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
  await fetchLiveLocalData();
  const families = getLocalFamilies();
  const members = getLocalMembers();

  const filteredFamilies = families.filter(f => f.id !== familyId && f.familyId !== familyId);
  const filteredMembers = members.filter(m => m.familyId !== familyId);

  await saveLocalAll(filteredFamilies, filteredMembers);
  return true;
}
