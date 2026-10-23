import { initialFamilies, initialMembers } from "../data/initialData";

const FAMILIES_STORAGE_KEY = "family_directory_families";
const MEMBERS_STORAGE_KEY = "family_directory_members";

export function getLocalMembers() {
  const data = localStorage.getItem(MEMBERS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(initialMembers));
    return initialMembers;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialMembers;
  }
}

export function saveLocalMembers(members) {
  localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
}

export function getLocalFamilies() {
  const data = localStorage.getItem(FAMILIES_STORAGE_KEY);
  let families;
  if (!data) {
    families = initialFamilies;
    localStorage.setItem(FAMILIES_STORAGE_KEY, JSON.stringify(families));
  } else {
    try {
      families = JSON.parse(data);
    } catch {
      families = initialFamilies;
    }
  }

  // Calculate live, accurate member counts based on actual members in storage
  const allMembers = getLocalMembers();
  return families.map(f => {
    const fId = f.id || f.familyId;
    const realCount = allMembers.filter(m => 
      String(m.familyId).trim() === String(fId).trim() ||
      (f.id && String(m.familyId).trim() === String(f.id).trim()) ||
      (f.familyId && String(m.familyId).trim() === String(f.familyId).trim())
    ).length;

    return {
      ...f,
      memberCount: realCount
    };
  });
}

export function saveLocalFamilies(families) {
  localStorage.setItem(FAMILIES_STORAGE_KEY, JSON.stringify(families));
}

export function resetLocalStore() {
  localStorage.setItem(FAMILIES_STORAGE_KEY, JSON.stringify(initialFamilies));
  localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(initialMembers));
}
