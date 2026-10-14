// Footprint of each picked-up object, as percentages of its 1536×1024 close-up art.
// Clicks outside the footprint land on the desk and put the object down.
export type Region = { x: number; y: number; w: number; h: number };

export const objectRegions = {
  projects: { x: 3, y: 8, w: 97, h: 92 },
  research: { x: 5.5, y: 11.5, w: 90, h: 82 },
  about: { x: 7, y: 9, w: 86, h: 84 },
  contact: { x: 5.5, y: 13.5, w: 92, h: 75.5 },
} satisfies Record<string, Region>;
