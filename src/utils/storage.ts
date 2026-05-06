function parseStorageItem<T>(item: string | null) {
  if (!item) return undefined;
  return JSON.parse(item) as T;
}

// session storage
export function setSessionStorageItem<T>(key: string, value: T): void {
  sessionStorage.setItem(key, JSON.stringify(value));
}

export function getSessionStorageItem<T>(key: string): T | undefined {
  const str = sessionStorage.getItem(key);
  return parseStorageItem<T>(str);
}

export function removeSessionStorageItem(key: string): void {
  sessionStorage.removeItem(key);
}

// local storage
export function setLocalStorageItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getLocalStorageItem<T>(key: string): T | undefined {
  const str = localStorage.getItem(key);
  return parseStorageItem<T>(str);
}

export function removeLocalStorageItem(key: string): void {
  localStorage.removeItem(key);
}
