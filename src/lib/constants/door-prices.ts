/**
 * What a weekly class costs at the door. Change the numbers here and the whole site follows:
 * pages, share cards, search data and messages all read them from this file.
 */
export const DOOR_PRICES = {
  oneClass: 12,
  twoClasses: 14,
  socialOnly: 5,
} as const;

/** The same prices, ready to show */
export const DOOR = {
  one: `£${DOOR_PRICES.oneClass}`,
  two: `£${DOOR_PRICES.twoClasses}`,
  social: `£${DOOR_PRICES.socialOnly}`,
} as const;
