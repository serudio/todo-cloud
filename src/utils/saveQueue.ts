/**
 * Runs saves one at a time, and forgets the ones a reload made obsolete.
 *
 * One at a time, because each save names the version the last one came back
 * with: two in flight together would both name the same one, and the second
 * would be refused for no reason but timing.
 *
 * Forgetting, because a save is a snapshot of the copy it was made from. When
 * that copy is thrown away for the server's — another tab got there first — a
 * save still waiting in line would otherwise run afterwards with the fresh
 * version on it, and land, and put the stale copy right back.
 */
export function createSaveQueue() {
  let queue: Promise<void> = Promise.resolve();
  let generation = 0;

  return {
    /** Call when the list is (re)loaded: everything queued before this is dropped. */
    startNewCopy() {
      generation += 1;
    },

    enqueue(save: () => Promise<void>) {
      const madeAt = generation;
      const queuedSave = queue.then(() => (madeAt === generation ? save() : undefined));

      // A save that throws must not wedge every save after it.
      queue = queuedSave.catch(() => undefined);

      return queuedSave;
    },
  };
}
