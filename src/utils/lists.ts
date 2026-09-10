import type { DecisionItem, DecisionList, DecisionListKind, DecisionListRow, DecisionOption } from "../types/lists";

export const MAX_ITEM_WEIGHT = 5;
export const WEIGHT_STEPS = Array.from({ length: MAX_ITEM_WEIGHT }, (_, index) => index + 1);

// The scale runs from the strongest con to the strongest pro, with no neutral zero.
export const NEGATIVE_WEIGHTS = WEIGHT_STEPS.map((step) => -step).reverse();
export const WEIGHT_SCALE = [...NEGATIVE_WEIGHTS, ...WEIGHT_STEPS];

// A step is filled when it sits between zero and the item's weight, on that side.
export const isWeightFilled = (step: number, weight: number) =>
  weight > 0 ? step > 0 && step <= weight : step < 0 && step >= weight;

// A sign is what separates a pro from a con, so it is always shown. Zero has none.
export function formatWeight(weight: number) {
  if (weight === 0) return "0";

  return weight > 0 ? `+${weight}` : `\u2212${Math.abs(weight)}`;
}
export const PROS_CONS_TITLE = "Pros and cons";
export const COMPARE_TITLE = "Comparison";

export const getNewItem = (weight: number): DecisionItem => ({
  id: crypto.randomUUID(),
  text: "",
  weight,
});

// Every column that will render gets a blank row, so there is somewhere to type
// straight away. A pros/cons list renders two columns, a comparison one per option.
export function withBlankRows(kind: DecisionListKind, items: DecisionItem[]): DecisionItem[] {
  if (kind === "compare") return items.length ? items : [getNewItem(1)];

  const seededItems = [...items];

  if (!items.some((item) => item.weight > 0)) seededItems.push(getNewItem(1));
  if (!items.some((item) => item.weight < 0)) seededItems.push(getNewItem(-1));

  return seededItems;
}

export const getNewOption = (kind: DecisionListKind, name: string): DecisionOption => ({
  id: crypto.randomUUID(),
  name,
  items: withBlankRows(kind, []),
});

// A pros/cons list holds a single option; a comparison starts with two.
export function getNewOptions(kind: DecisionListKind): DecisionOption[] {
  if (kind === "compare") return [getNewOption(kind, "Option A"), getNewOption(kind, "Option B")];

  return [getNewOption(kind, "")];
}

export const getListTitle = (kind: DecisionListKind) => (kind === "compare" ? COMPARE_TITLE : PROS_CONS_TITLE);

export const getPros = (option: DecisionOption) => option.items.filter((item) => item.weight > 0);
export const getCons = (option: DecisionOption) => option.items.filter((item) => item.weight < 0);

// Blank rows are not reasons yet, so they must not move a score.
export const getItemsScore = (items: DecisionItem[]) =>
  items.reduce((score, item) => (item.text.trim() ? score + item.weight : score), 0);

export const getOptionScore = (option: DecisionOption) => getItemsScore(option.items);

// The clearest score wins; a tie has no winner to point at.
export function getWinningOptionId(options: DecisionOption[]) {
  if (options.length < 2) return null;

  const scores = options.map((option) => ({ id: option.id, score: getOptionScore(option) }));
  const [best, runnerUp] = [...scores].sort((first, second) => second.score - first.score);

  if (!best || !runnerUp || best.score === runnerUp.score) return null;

  return best.id;
}

// Blank rows are scaffolding for whatever is being typed next: they stay in the UI,
// but never reach the database.
export function getSavedOptions(options: DecisionOption[]): DecisionOption[] {
  return options.map((option) => ({
    ...option,
    name: option.name.trim(),
    items: option.items.flatMap((item) => {
      const text = item.text.trim();

      return text ? [{ ...item, text }] : [];
    }),
  }));
}

// Clamps a weight to +/- MAX_ITEM_WEIGHT and keeps it away from a meaningless zero.
export function clampWeight(weight: number, isCon: boolean) {
  const magnitude = Math.min(Math.max(Math.round(Math.abs(weight)) || 1, 1), MAX_ITEM_WEIGHT);

  return isCon ? -magnitude : magnitude;
}

function parseKind(kind: unknown): DecisionListKind {
  return kind === "compare" ? "compare" : "pros_cons";
}

function parseItems(items: unknown): DecisionItem[] {
  if (!Array.isArray(items)) return [];

  return items.flatMap((item) => {
    if (!item || typeof item !== "object") return [];

    const { id, text, weight } = item as Record<string, unknown>;
    if (typeof id !== "string" || typeof text !== "string") return [];

    const parsedWeight = typeof weight === "number" && Number.isFinite(weight) ? weight : 1;
    if (parsedWeight === 0) return [];

    return [{ id, text, weight: clampWeight(parsedWeight, parsedWeight < 0) }];
  });
}

function parseOptions(kind: DecisionListKind, options: unknown): DecisionOption[] {
  if (!Array.isArray(options)) return [];

  return options.flatMap((option) => {
    if (!option || typeof option !== "object") return [];

    const { id, name, items } = option as Record<string, unknown>;
    if (typeof id !== "string") return [];

    // Blank rows are never saved, so a stored option comes back needing them again.
    return [{ id, name: typeof name === "string" ? name : "", items: withBlankRows(kind, parseItems(items)) }];
  });
}

// Rebuilds a list from jsonb that older app versions or shared editors may have written.
export function parseDecisionList(row: DecisionListRow): DecisionList {
  const kind = parseKind(row.kind);
  const options = parseOptions(kind, row.options);

  return {
    id: row.id,
    kind,
    title: typeof row.title === "string" ? row.title : getListTitle(kind),
    options: options.length ? options : getNewOptions(kind),
    updatedAt: typeof row.updated_at === "string" ? row.updated_at : null,
  };
}
