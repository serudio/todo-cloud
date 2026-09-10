import { useEffect, useState } from "react";

// Hash routes keep deep links working on GitHub Pages, which has no SPA rewrite.
export type Route =
  { name: "todos" } | { name: "lists" } | { name: "list"; listId: string } | { name: "shared"; shareToken: string };

export const todosPath = "#/";
export const listsPath = "#/lists";
export const getListPath = (listId: string) => `#/lists/${listId}`;
export const getSharedPath = (shareToken: string) => `#/shared/${shareToken}`;

export function getShareUrl(shareToken: string) {
  const { origin, pathname, search } = window.location;

  return `${origin}${pathname}${search}${getSharedPath(shareToken)}`;
}

export function parseRoute(hash: string): Route {
  const [firstSegment, secondSegment] = hash.replace(/^#\/?/, "").split("/");

  if (firstSegment === "shared" && secondSegment) return { name: "shared", shareToken: secondSegment };
  if (firstSegment === "lists") return secondSegment ? { name: "list", listId: secondSegment } : { name: "lists" };

  return { name: "todos" };
}

export function navigate(path: string) {
  window.location.hash = path;
}

export function useRoute() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));

  useEffect(() => {
    const handleHashChange = () => setRoute(parseRoute(window.location.hash));

    window.addEventListener("hashchange", handleHashChange);

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return route;
}
