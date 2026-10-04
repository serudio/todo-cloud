export const getTodoFontSize = (size: number) => {
  if (size === 10) return "2.5rem";
  if (size === 9) return "2.4rem";
  if (size === 8) return "2.3rem";
  if (size === 7) return "2.2rem";
  if (size === 6) return "2.1rem";
  if (size === 5) return "2rem";
  if (size === 4) return "1.5rem";
  if (size === 3) return "1.25rem";
  if (size === 2) return "1rem";
  return "0.8rem";
};
export const getTodoPadding = (size: number) => {
  if (size === 10) return "21px 21px";
  if (size === 9) return "20px 20px";
  if (size === 8) return "19px 19px";
  if (size === 7) return "18px 18px";
  if (size === 6) return "17px 17px";
  if (size === 5) return "16px 16px";
  if (size === 4) return "14px 14px";
  if (size === 3) return "12px 12px";
  if (size === 2) return "9px 9px";
  return "5px 9px";
};
