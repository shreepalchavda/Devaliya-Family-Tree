import { initialFamilies, initialMembers } from "../data/initialData";

const FAMILIES_STORAGE_KEY = "family_directory_families";
const MEMBERS_STORAGE_KEY = "family_directory_members";

export function getLocalFamilies() {
  const data = localStorage.getItem(FAMILIES_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(FAMILIES_STORAGE_KEY, JSON.stringify(initialFamilies));
    return initialFamilies;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialFamilies;
  }
}

export function saveLocalFamilies(families) {
  localStorage.setItem(FAMILIES_STORAGE_KEY, JSON.stringify(families));
}

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

export function resetLocalStore() {
  localStorage.setItem(FAMILIES_STORAGE_KEY, JSON.stringify(initialFamilies));
  localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(initialMembers));
}
