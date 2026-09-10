// A pros/cons list is one option; a comparison is two options side by side.
export type DecisionListKind = "pros_cons" | "compare";

// Positive weights read as pros, negative ones as cons, so a score is a plain sum.
export type DecisionItem = {
  id: string;
  text: string;
  weight: number;
};

export type DecisionOption = {
  id: string;
  name: string;
  items: DecisionItem[];
};

export type DecisionList = {
  id: string;
  kind: DecisionListKind;
  title: string;
  options: DecisionOption[];
  updatedAt: string | null;
};

export type DecisionListSummary = {
  id: string;
  kind: DecisionListKind;
  title: string;
  shareToken: string;
  updatedAt: string | null;
};

export type DecisionListRow = {
  id: string;
  kind: unknown;
  title: unknown;
  options: unknown;
  share_token?: unknown;
  updated_at?: unknown;
};
