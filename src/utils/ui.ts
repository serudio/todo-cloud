export const getTodoFontSize = (size: number) => {
  if (size === 5) return "2rem";
  if (size === 4) return "1.5rem";
  if (size === 3) return "1.25rem";
  if (size === 2) return "1rem";
  return "0.8rem";
};
export const getTodoPadding = (size: number) => {
  if (size === 5) return "16px 16px";
  if (size === 4) return "14px 14px";
  if (size === 3) return "12px 12px";
  if (size === 2) return "9px 9px";
  return "5px 9px";
};
