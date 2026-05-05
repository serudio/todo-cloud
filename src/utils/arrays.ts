// Picks a random insertion position so new/restored cloud items are scattered.
export function getRandomInsertIndex(length: number) {
  return Math.floor(Math.random() * (length + 1));
}

// Inserts an item into a random position without mutating the original array.
export function insertAtRandomPosition<T>(items: T[], item: T) {
  const nextItems = [...items];
  nextItems.splice(getRandomInsertIndex(nextItems.length), 0, item);

  return nextItems;
}
