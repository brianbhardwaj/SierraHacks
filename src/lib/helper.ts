import { actions, faq, ID } from '../data/facts'

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

const byId = (id: string) => actions.find((a) => a.id === id)!
const cites = (ids: number[]) => (ids.length ? ` [${ids.join(', ')}]` : '')

function step(id: string): string {
  const a = byId(id)
  return `• ${a.title}: ${a.body}${cites(a.cite)}`
}

const has = (text: string, ...words: string[]) => words.some((w) => text.includes(w))

/**
 * Offline helper. It never invents numbers: it only recombines the cited
 * actions and FAQ answers that already exist on the site.
 */
export function localReply(input: string): string {
  const t = input.toLowerCase()
  const steps: string[] = []
  const intro: string[] = []

  if (has(t, 'sick', 'smell', 'drift', 'sprayed', 'cough', 'breath', 'rash', 'burn', 'dead bee', 'dying', 'fish kill')) {
    intro.push(
      `If anyone is having trouble breathing right now, leave the area and call 911. For first-aid advice, Poison Control is 1-800-222-1222 [${ID.dprReportPage}].`,
    )
    steps.push(step('report'), step('spraydays'))
  }
  if (has(t, 'bee', 'butterfl', 'monarch', 'pollinat', 'wildlife', 'ecosystem', 'garden', 'yard', 'plant', 'flower', 'seed', 'milkweed', 'habitat')) {
    intro.push(`${faq[0].a.split(' Pesticides are')[0]} [${faq[0].cite.join(', ')}]`)
    steps.push(step('plant'), step('yard'), step('email'))
  }
  if (has(t, 'kid', 'child', 'son', 'daughter', 'parent', 'school', 'teacher', 'student', 'daycare')) {
    intro.push('For kids, the strongest tools are notices and speaking up.')
    steps.push(step('school'), step('spraydays'), step('email'))
  }
  if (has(t, 'rent', 'landlord', 'well', 'water', 'tap')) {
    intro.push('For water, testing is the key first move.')
    steps.push(step('well'), step('report'))
  }
  if (has(t, 'farmworker', 'work in', 'field', 'job', 'worker', 'employer')) {
    intro.push('If you work around spraying, reporting is protected: you can ask for confidentiality.')
    steps.push(step('report'), step('spraydays'))
  }
  if (has(t, 'near a farm', 'next to', 'live near', 'orchard', 'near fields', 'neighbor')) {
    steps.push(step('spraydays'), step('report'))
  }
  if (has(t, 'shop', 'grocery', 'eat', 'food', 'produce', 'organic', 'store', 'market', 'farmer', 'restaurant', 'cook', 'email', 'ask')) {
    intro.push('You cannot see farm-by-farm spray records, but you can ask the people who sell you food.')
    steps.push(step('email'), step('plant'))
  }
  if (has(t, 'fight', 'change', 'policy', 'vote', 'advoc', 'organize', 'activis', 'help', 'regulat', 'law', 'stop')) {
    intro.push('The most effective mix is asking suppliers, reporting harm, and rebuilding habitat.')
    steps.push(step('email'), step('report'), step('plant'))
  }
  if (has(t, 'data', 'county', 'percent', '%', 'statistic', 'number', 'source')) {
    intro.push(
      `The Data tab shows DPR’s 2023 county, crop, and chemical figures. No public dataset ties a specific farm to a store shelf, so this site does not guess [${ID.dprCounty}, ${ID.dprTop5}].`,
    )
  }

  const unique = [...new Set(steps)].slice(0, 4)
  if (unique.length === 0 && intro.length === 0) {
    return [
      'Thanks. Tell me a bit more: do you garden, live near fields, have kids in school, use a private well, work around spraying, or mostly shop for food?',
      'Here are three steps almost anyone can take today:',
      step('email'),
      step('plant'),
      step('report'),
    ].join('\n\n')
  }

  return [...intro, ...(unique.length ? ['Here is what I would do:', ...unique] : [])].join('\n\n')
}
