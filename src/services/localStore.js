const FAMILIES_STORAGE_KEY = "family_directory_families";
const MEMBERS_STORAGE_KEY = "family_directory_members";

let pushTimeout = null;

function getLocalFamiliesRaw() {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(FAMILIES_STORAGE_KEY);
  try {
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function getLocalMembersRaw() {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(MEMBERS_STORAGE_KEY);
  try {
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function syncWithServer() {
  if (typeof window === "undefined") return;
  try {
    const res = await fetch("/api/data");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.families)) {
        localStorage.setItem(FAMILIES_STORAGE_KEY, JSON.stringify(data.families));
      }
      if (Array.isArray(data?.members)) {
        localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(data.members));
      }
    }
  } catch (err) {
    console.warn("Failed to sync with server:", err);
  }
}

export async function pushToServer(overrideData = null) {
  if (typeof window === "undefined") return;
  try {
    const families = overrideData?.families !== undefined ? overrideData.families : getLocalFamiliesRaw();
    const members = overrideData?.members !== undefined ? overrideData.members : getLocalMembersRaw();
    await fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ families, members })
    });
  } catch (err) {
    console.warn("Failed to push data to server:", err);
  }
}

function schedulePushToServer() {
  if (pushTimeout) clearTimeout(pushTimeout);
  pushTimeout = setTimeout(() => {
    pushToServer();
  }, 100);
}

// Initial sync on module load in browser
if (typeof window !== "undefined") {
  syncWithServer();
}

export function getLocalMembers() {
  return getLocalMembersRaw();
}

export function saveLocalMembers(members) {
  const list = members || [];
  localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(list));
  schedulePushToServer();
}

export function getLocalFamilies() {
  const families = getLocalFamiliesRaw();
  const allMembers = getLocalMembersRaw();

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
  const list = families || [];
  localStorage.setItem(FAMILIES_STORAGE_KEY, JSON.stringify(list));
  schedulePushToServer();
}

export async function saveLocalAll(families, members) {
  if (pushTimeout) clearTimeout(pushTimeout);
  const fList = families !== undefined ? (families || []) : getLocalFamiliesRaw();
  const mList = members !== undefined ? (members || []) : getLocalMembersRaw();
  localStorage.setItem(FAMILIES_STORAGE_KEY, JSON.stringify(fList));
  localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(mList));
  await pushToServer({ families: fList, members: mList });
}

export async function fetchLiveLocalData() {
  await syncWithServer();
  return {
    families: getLocalFamilies(),
    members: getLocalMembers()
  };
}

export function clearAllLocalData() {
  if (pushTimeout) clearTimeout(pushTimeout);
  localStorage.setItem(FAMILIES_STORAGE_KEY, JSON.stringify([]));
  localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify([]));
  pushToServer({ families: [], members: [] });
}

export function resetLocalStore() {
  clearAllLocalData();
}
