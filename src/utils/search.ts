import { normalizeTodoText } from "./todos";

// One matcher for every list, so a search behaves the same against a task, a tag,
// a link or a deleted item. An empty search matches everything.
export function matchesSearch(search: string, ...texts: (string | null | undefined)[]) {
  const normalizedSearch = normalizeTodoText(search);
  if (!normalizedSearch) return true;

  return texts.some((text) => text && normalizeTodoText(text).includes(normalizedSearch));
}

export const isSearching = (search: string) => Boolean(normalizeTodoText(search));
