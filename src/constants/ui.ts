export const NOT_TODAY_Z = 2;
export const CLOUD_Z = 1;

export const TASK_Z = 1;
export const TASK_ACTIONS_Z = 10;
export const TASK_ACTION_HOVER_Z = 11;
export const ADD_TODO_Z = 1000;

export const MODAL_Z = 10000;

export const TAG_Z = 1000;

export const DEFAULT_TAG_COLOR = "#e2e2e2";

export const MAIN_SITE_URL = "https://serudio.github.io/";

// The other everyday tools, which live on the main site rather than in this app.
export const GOALS_URL = `${MAIN_SITE_URL}goals`;
export const HUNDRED_TODO_URL = `${MAIN_SITE_URL}100-todo`;
// Called "sport" here; the page on the main site is /workouts.
export const SPORT_URL = `${MAIN_SITE_URL}workouts`;

export const SECTION_SETTINGS_STORAGE_KEY = "todo-cloud:sections";
export const CLOUD_SORT_STORAGE_KEY = "todo-cloud:cloud-sort";
export const FULL_WIDTH_STORAGE_KEY = "todo-cloud:full-width";

// The side panels, and the seam the handle that closes them sits on. Both
// drawers and the handle read it, so the handle cannot drift off the edge it
// is meant to be sitting on.
export const SIDE_PANEL_WIDTH = 250;

// The cloud's own look, drawn over its dark background picture: frosted tiles,
// off-white type, and the picture's orange as the one accent.
export const CLOUD_INK = "#f2efe9";
export const CLOUD_ACCENT = "#ff6233";
export const CLOUD_TILE_BG = "rgba(20, 20, 20, 0.55)";
export const CLOUD_TILE_BORDER = "rgba(255, 255, 255, 0.14)";
