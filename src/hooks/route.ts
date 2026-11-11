import { useEffect, useState } from "react";

// Real paths, not hashes. GitHub Pages has no SPA rewrite, so the build ships a
// copy of index.html as 404.html: Pages serves that for any unknown path, the app
// boots with the address bar untouched, and the route below is read from it.
export type Route =
  | { name: "todos" }
  | { name: "lists" }
  | { name: "list"; listId: string }
  | { name: "shared"; shareToken: string }
  | { name: "points" }
  | { name: "goal"; goalId: string };

export const todosPath = "/";
export const listsPath = "/lists";
export const getListPath = (listId: string) => `/lists/${listId}`;
export const getSharedPath = (shareToken: string) => `/shared/${shareToken}`;
export const pointsPath = "/points";
export const getGoalPath = (goalId: string) => `/points/${goalId}`;

// "/todo-cloud" when deployed under the repository name, "" in development.
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const withBase = (path: string) => `${basePath}${path}`;

const stripBase = (pathname: string) =>
  basePath && pathname.startsWith(basePath) ? pathname.slice(basePath.length) || "/" : pathname;

export const getAbsoluteUrl = (path: string) => `${window.location.origin}${withBase(path)}`;

export const getShareUrl = (shareToken: string) => getAbsoluteUrl(getSharedPath(shareToken));

export function parseRoute(location: Location = window.location): Route {
  // Links shared while the app used hash routing still resolve.
  const source = location.hash.startsWith("#/") ? location.hash.slice(1) : stripBase(location.pathname);
  const [firstSegment, secondSegment] = source.replace(/^\//, "").split("/");

  if (firstSegment === "shared" && secondSegment) return { name: "shared", shareToken: secondSegment };
  if (firstSegment === "lists") return secondSegment ? { name: "list", listId: secondSegment } : { name: "lists" };
  if (firstSegment === "points") return secondSegment ? { name: "goal", goalId: secondSegment } : { name: "points" };

  return { name: "todos" };
}

export function navigate(path: string) {
  window.history.pushState({}, "", withBase(path));

  // pushState notifies nobody, so useRoute is told the same way the back button
  // would tell it.
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function useRoute() {
  const [route, setRoute] = useState(() => parseRoute());

  useEffect(() => {
    const handleLocationChange = () => setRoute(parseRoute());

    window.addEventListener("popstate", handleLocationChange);

    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  return route;
}
