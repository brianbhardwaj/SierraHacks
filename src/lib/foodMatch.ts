export type FoodMatch =
  | { kind: 'crop'; label: string; needle: string }
  | { kind: 'dairy' }
  | { kind: 'unknown' }

const rules: { words: string[]; match: FoodMatch }[] = [
  { words: ['parmesan', 'parmigiano', 'cheese', 'yogurt', 'yoghurt', 'butter', 'milk', 'dairy', 'whey'], match: { kind: 'dairy' } },
  { words: ['almond'], match: { kind: 'crop', label: 'almonds', needle: 'almond' } },
  { words: ['strawberry'], match: { kind: 'crop', label: 'strawberries', needle: 'strawberry' } },
  { words: ['pistachio'], match: { kind: 'crop', label: 'pistachios', needle: 'pistachio' } },
  { words: ['walnut'], match: { kind: 'crop', label: 'walnuts', needle: 'walnut' } },
  { words: ['wine'], match: { kind: 'crop', label: 'wine grapes', needle: 'grape, wine' } },
  { words: ['grape', 'raisin'], match: { kind: 'crop', label: 'grapes', needle: 'grape' } },
  { words: ['tomato'], match: { kind: 'crop', label: 'tomatoes', needle: 'tomato' } },
  { words: ['tangerine', 'mandarin'], match: { kind: 'crop', label: 'tangerines', needle: 'tangerine' } },
  { words: ['orange'], match: { kind: 'crop', label: 'oranges', needle: 'orange' } },
  { words: ['rice'], match: { kind: 'crop', label: 'rice', needle: 'rice' } },
  { words: ['cherry'], match: { kind: 'crop', label: 'cherries', needle: 'cherry' } },
  { words: ['cotton'], match: { kind: 'crop', label: 'cotton', needle: 'cotton' } },
  { words: ['alfalfa'], match: { kind: 'crop', label: 'alfalfa', needle: 'alfalfa' } },
  { words: ['apple'], match: { kind: 'crop', label: 'apples', needle: 'apple' } },
  { words: ['lettuce', 'spinach', 'kale'], match: { kind: 'crop', label: 'leafy greens', needle: 'lettuce' } },
]

/** Map a product name or ingredient list onto a crop we can look up. */
export function matchFood(text: string): FoodMatch {
  const t = text.toLowerCase()
  for (const rule of rules) {
    if (rule.words.some((w) => t.includes(w))) return rule.match
  }
  return { kind: 'unknown' }
}
