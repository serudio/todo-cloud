import { useCallback, useEffect, useState } from "react";
import type { DecisionList, DecisionListKind, DecisionListSummary, DecisionOption } from "../types/lists";
import {
  createDecisionList,
  deleteDecisionList,
  getDecisionList,
  getDecisionLists,
  getSharedDecisionList,
  saveSharedDecisionList,
  updateDecisionList,
} from "../utils/db/decisionLists";
import { getSavedOptions, parseDecisionList } from "../utils/lists";

// Loads the signed-in user's saved lists and keeps the index in sync with changes.
export function useDecisionLists(userId: string | undefined) {
  const [lists, setLists] = useState<DecisionListSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLists = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    const { data, error: loadError } = await getDecisionLists(userId);
    setIsLoading(false);

    if (loadError) {
      setError(loadError.message);
      return;
    }

    setError(null);
    setLists(
      (data ?? []).map((row) => ({
        ...parseDecisionList(row),
        shareToken: typeof row.share_token === "string" ? row.share_token : "",
      })),
    );
  }, [userId]);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  const createList = useCallback(
    async (kind: DecisionListKind) => {
      if (!userId) return null;

      const { data, error: createError } = await createDecisionList(userId, kind);

      if (createError || !data) {
        setError(createError?.message ?? "The list could not be created.");
        return null;
      }

      await loadLists();

      return parseDecisionList(data).id;
    },
    [loadLists, userId],
  );

  const removeList = useCallback(async (listId: string) => {
    const { error: deleteError } = await deleteDecisionList(listId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setLists((currentLists) => currentLists.filter((list) => list.id !== listId));
  }, []);

  return { lists, isLoading, error, createList, removeList, reloadLists: loadLists };
}

type UseDecisionListOptions = { listId?: string; shareToken?: string };

// Loads one list either as its owner or through a share token, and saves edits back
// the same way, so the editor UI does not care which of the two it is showing.
export function useDecisionList({ listId, shareToken }: UseDecisionListOptions) {
  const [list, setList] = useState<DecisionList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isStale = false;

    async function loadList() {
      setIsLoading(true);

      const { data, error: loadError } = shareToken
        ? await getSharedDecisionList(shareToken)
        : await getDecisionList(listId ?? "");

      if (isStale) return;

      setIsLoading(false);

      if (loadError) {
        setError(loadError.message);
        return;
      }

      if (!data) {
        setError("That list does not exist, or the link is no longer valid.");
        return;
      }

      setError(null);
      setList(parseDecisionList(data));
    }

    if (!listId && !shareToken) {
      setIsLoading(false);
      return;
    }

    loadList();

    return () => {
      isStale = true;
    };
  }, [listId, shareToken]);

  const saveList = useCallback(
    async (title: string, options: DecisionOption[]) => {
      if (!list) return;

      setIsSaving(true);

      const savedOptions = getSavedOptions(options);
      const { error: saveError } = shareToken
        ? await saveSharedDecisionList(shareToken, title.trim(), savedOptions)
        : await updateDecisionList(list.id, title.trim(), savedOptions);

      setIsSaving(false);
      setError(saveError ? saveError.message : null);
    },
    [list, shareToken],
  );

  // Typing only touches local state; commits are what reach the database, so a
  // keystroke does not become a request.
  const changeList = useCallback((title: string, options: DecisionOption[]) => {
    setList((currentList) => (currentList ? { ...currentList, title, options } : currentList));
  }, []);

  const commitList = useCallback(
    (title: string, options: DecisionOption[]) => {
      changeList(title, options);
      saveList(title, options);
    },
    [changeList, saveList],
  );

  return { list, isLoading, isSaving, error, changeList, commitList };
}
