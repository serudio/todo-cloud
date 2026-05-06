export function moveItemToFront<T>(items: T[], predicate: (item: T) => boolean) {
  const item = items.find(predicate);
  if (!item) return items;

  return [item, ...items.filter((currentItem) => currentItem !== item)];
}
