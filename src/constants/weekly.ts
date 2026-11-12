// How often a weekly task can be asked for.
//
// Seven is every day, which is as often as a week can ask. The picker shows the
// whole range rather than a box to type a number into: a target is chosen once
// and is always a single digit, so a row of seven is quicker than typing and
// cannot land on a number that means nothing.
export const WEEKLY_TARGETS = [1, 2, 3, 4, 5, 6, 7];
export const MAX_WEEKLY_TARGET = WEEKLY_TARGETS[WEEKLY_TARGETS.length - 1];
export const DEFAULT_WEEKLY_TARGET = 3;

// How much history is worth keeping: enough to see whether a habit is holding,
// not so much that the row grows forever.
export const KEPT_WEEKS = 12;

// The row of past weeks shown under a weekly task.
export const SHOWN_WEEKS = 6;
