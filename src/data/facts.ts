// Every number on this site comes from a source listed in SOURCES.
// Citations use ID.<key>, derived from the order of SOURCES, so numbering
// can never drift out of sync with the list at the bottom of each page.

export type SourceGroup = 'Ecosystems' | 'Pesticide use' | 'Take action' | 'Tools'

type SourceDef = {
  key: string
  group: SourceGroup
  org: string
  title: string
  url: string
  used: string
}

const defs = [
  // ---- Ecosystems
  {
    key: 'monarch2026',
    group: 'Ecosystems',
    org: 'Xerces Society',
    title: 'Western Monarch Numbers Remain at Historic Low (Jan. 29, 2026)',
    url: 'https://www.xerces.org/press/western-monarch-numbers-remain-at-historic-low',
    used: '12,260 monarchs in 2025; 9,119 in 2024; 1,901 in 2020; ~10% yearly decline since the 1980s; pesticides named as a driver.',
  },
  {
    key: 'monarch2025',
    group: 'Ecosystems',
    org: 'Xerces Society',
    title: 'Western Monarch Butterfly Population Declines to Near Record Low (Jan. 30, 2025)',
    url: 'https://www.xerces.org/press/western-monarch-butterfly-population-declines-to-near-record-low',
    used: 'Central Valley milkweed contaminated by 64 pesticides; methoxyfenozide in 96% of samples; EPA tests only honey bees.',
  },
  {
    key: 'monarch2024',
    group: 'Ecosystems',
    org: 'Xerces Society',
    title: 'Western Monarch Count Tallies 233,394 Butterflies (Jan. 30, 2024)',
    url: 'https://www.xerces.org/press/western-monarch-count-tallies-233394-butterflies',
    used: '233,394 butterflies counted in 2023, about 5% of 1980s levels.',
  },
  {
    key: 'beeKill2014',
    group: 'Ecosystems',
    org: 'Dadant & Sons (beekeeping news)',
    title: '80,000+ Beehives Damaged or Dead; Beekeepers Meet With EPA',
    url: 'https://www.dadant.com/80000-beehives-damaged-or-dead-beekeepers-meet-with-epa/',
    used: 'Beekeeper-reported 2014 almond-bloom losses (a poll of beekeepers, not a government count).',
  },
  {
    key: 'almondBees2019',
    group: 'Ecosystems',
    org: 'Insects (MDPI), peer-reviewed',
    title: 'Combined Toxicity of Insecticides and Fungicides Applied to California Almond Orchards to Honey Bee Larvae and Adults',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6359038/',
    used: '1.48M colonies rented in 2017; lab finding that insecticide combinations reduced larval survival.',
  },
  {
    key: 'almondLabel',
    group: 'Ecosystems',
    org: 'California Agriculture (UC ANR), peer-reviewed',
    title: 'Growers follow the label: An analysis of bee-toxic pesticide use in almond orchards during bloom',
    url: 'https://doi.org/10.3733/ca.2020a0030',
    used: '~2 million colonies (81% of US managed colonies) needed in 2018; bee-toxic products without EPA precautions still commonly applied during bloom.',
  },
  {
    key: 'almondTox2022',
    group: 'Ecosystems',
    org: 'Environmental Toxicology and Chemistry, peer-reviewed',
    title: 'Acute Toxicity of Fungicide–Insecticide–Adjuvant Combinations Applied to Almonds During Bloom on Adult Honey Bees',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9313819/',
    used: 'Synergistic toxicity of mixes; supports night-time application.',
  },
  {
    key: 'sediment',
    group: 'Ecosystems',
    org: 'Environmental Science & Technology, peer-reviewed',
    title: "Distribution and Toxicity of Sediment-Associated Pesticides in Agriculture-Dominated Water Bodies of California's Central Valley",
    url: 'https://doi.org/10.1021/es0352193',
    used: '70 samples, 10 counties: 42% of locations toxic, 14% extremely toxic, pyrethroids in 75% of samples.',
  },
  {
    key: 'sediment2013',
    group: 'Ecosystems',
    org: 'UC Davis (AGIS publication)',
    title: 'Identifying the cause of sediment toxicity in agricultural sediments',
    url: 'https://agis.ucdavis.edu/publications/2013/Weston_2013_identifying_cause.pdf',
    used: 'One quarter of 100+ samples toxic; pyrethroids over toxic thresholds in three quarters of toxic samples.',
  },
  {
    key: 'usgsBees',
    group: 'Ecosystems',
    org: 'U.S. Geological Survey',
    title: 'Pesticides Detected in Bees, Flowers, Soil, and Air within Pollinator-Attractive Row-Crop Border Plantings',
    url: 'https://www.usgs.gov/programs/environmental-health-program/science/pesticides-detected-bees-flowers-soil-and-air-within',
    used: 'Eight farms in Yolo and Colusa counties: 8 insecticides, 13 herbicides, 12 fungicides, 4 degradates found.',
  },
  {
    key: 'plos',
    group: 'Ecosystems',
    org: 'PLOS ONE, peer-reviewed',
    title: 'Agricultural margins could enhance landscape connectivity for pollinating insects across the Central Valley of California',
    url: 'https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0267263',
    used: 'Wild pollinators worth $937M–$2.4B/yr to California agriculture; field margins can reconnect habitat.',
  },
  {
    key: 'xercesCV',
    group: 'Ecosystems',
    org: 'Xerces Society',
    title: 'Study: Connecting Habitat in the Central Valley Could Help Save California’s Pollinators',
    url: 'https://xerces.org/press/study-connecting-habitat-in-central-valley-could-help-save-californias-pollinators',
    used: 'Central Valley produces 25% of US food and 40% of its fruits and nuts; reducing pesticide loads improves connectivity.',
  },
  // ---- Pesticide use
  {
    key: 'dprCounty',
    group: 'Pesticide use',
    org: 'California Dept. of Pesticide Regulation (DPR)',
    title: 'Total Pounds, Applications, and Acres Treated by County: 2023',
    url: 'https://www.cdpr.ca.gov/wp-content/uploads/2025/08/2023_county_total_pounds_apps_acres.pdf',
    used: 'County pounds, applications, and acres treated.',
  },
  {
    key: 'dprTop5',
    group: 'Pesticide use',
    org: 'California Dept. of Pesticide Regulation (DPR)',
    title: 'The Top Five Commodities by Pounds Applied in each County in 2023 and the Top Five Chemicals used',
    url: 'https://www.cdpr.ca.gov/wp-content/uploads/2025/08/2023_county_top5_commodity_then_chemical_pounds.pdf',
    used: 'Top crops and chemicals for each Central Valley county.',
  },
  {
    key: 'dprChem',
    group: 'Pesticide use',
    org: 'California Dept. of Pesticide Regulation (DPR)',
    title: 'The Top 100 Chemicals by Pounds in Total Statewide Pesticide Use in 2023',
    url: 'https://www.cdpr.ca.gov/wp-content/uploads/2025/08/2023_top100_chemicals_by_pounds.pdf',
    used: 'Statewide chemical pounds; sulfur and mineral oil lead by weight.',
  },
  {
    key: 'dprReport2023',
    group: 'Pesticide use',
    org: 'California Dept. of Pesticide Regulation (DPR)',
    title: 'Pesticide Use Annual Report 2023 Data Summary',
    url: 'https://www.cdpr.ca.gov/wp-content/uploads/2025/08/2023_pur_annual_report.pdf',
    used: 'Five counties = 50% of statewide pounds; top crops by pounds.',
  },
  {
    key: 'dprCrops',
    group: 'Pesticide use',
    org: 'California Dept. of Pesticide Regulation (DPR)',
    title: 'The Top 100 Commodities by Pounds in Total Statewide Pesticide Use in 2023',
    url: 'https://www.cdpr.ca.gov/wp-content/uploads/2025/08/2023_top100_commodities_by_pounds.pdf',
    used: 'Crop pounds applied.',
  },
  {
    key: 'oehha13d',
    group: 'Pesticide use',
    org: 'OEHHA (California Office of Environmental Health Hazard Assessment)',
    title: '1,3-Dichloropropene: Proposition 65 listing',
    url: 'https://oehha.ca.gov/proposition-65/chemicals/13-dichloropropene',
    used: 'Listed as causing cancer (01/01/1989).',
  },
  {
    key: 'dpr13d',
    group: 'Pesticide use',
    org: 'California Dept. of Pesticide Regulation (DPR)',
    title: '1,3-Dichloropropene Report for 2025 (draft)',
    url: 'https://www.cdpr.ca.gov/wp-content/uploads/2026/10/13d_report_2025_draft_10-2026.pdf',
    used: 'Restricted material and toxic air contaminant with setbacks and monitoring.',
  },
  // ---- Take action
  {
    key: 'dprReportPage',
    group: 'Take action',
    org: 'California Dept. of Pesticide Regulation (DPR)',
    title: 'Report a Pesticide Incident',
    url: 'https://www.cdpr.ca.gov/report-a-pesticide-incident/',
    used: '1-87PestLine, confidentiality, Poison Control, 911 for emergencies.',
  },
  {
    key: 'dprHowTo',
    group: 'Take action',
    org: 'California Dept. of Pesticide Regulation (DPR)',
    title: 'How To Report Pesticide Incidents (questions inspectors ask)',
    url: 'https://www.cdpr.ca.gov/wp-content/uploads/2024/07/how_to_report_pesticide_incidents.pdf',
    used: 'What details help an investigation; anonymous reporting.',
  },
  {
    key: 'dprCaspir',
    group: 'Take action',
    org: 'California Dept. of Pesticide Regulation (DPR)',
    title: 'How to report pesticide incidents, illnesses, or concerns',
    url: 'https://content.civicplus.com/api/assets/f50a5199-e720-4b61-8121-d92b118f08f9',
    used: 'CASPIR app; CAC follow-up within a business day; right to the final report; county directory.',
  },
  {
    key: 'sprayDays',
    group: 'Take action',
    org: 'California Dept. of Pesticide Regulation (DPR)',
    title: 'SprayDays California',
    url: 'https://spraydays.cdpr.ca.gov/',
    used: 'Free alerts before restricted-material applications.',
  },
  {
    key: 'sprayDays2',
    group: 'Take action',
    org: 'California Dept. of Pesticide Regulation (DPR)',
    title: 'SprayDays California Scheduled for Statewide Rollout on March 24, 2025',
    url: 'https://www.cdpr.ca.gov/2025/02/21/spraydays-california-scheduled-for-statewide-rollout-on-march-24-2025/',
    used: '48 hours notice for soil fumigants; 24 hours for other restricted materials.',
  },
  {
    key: 'schools',
    group: 'Take action',
    org: 'California Dept. of Pesticide Regulation (DPR)',
    title: 'Healthy Schools Act FAQs',
    url: 'https://cdn.ymaws.com/cashnet.site-ym.com/resource/resmgr/covid/dpr_-_healthy_schools_faq.pdf',
    used: 'Notice and warning-sign rules at public schools and licensed child care.',
  },
  {
    key: 'wells',
    group: 'Take action',
    org: 'California Attorney General',
    title: 'Enforcement Advisory on Landlord Compliance with Domestic Well Testing Requirement',
    url: 'https://oag.ca.gov/news/press-releases/attorney-general-bonta-issues-enforcement-advisory-landlord-compliance-domestic',
    used: 'Pesticides among groundwater contaminants; Fresno, San Joaquin, Tulare among highest-risk counties.',
  },
  {
    key: 'xercesRes',
    group: 'Take action',
    org: 'Xerces Society',
    title: 'Pollinator Conservation Resources: California',
    url: 'https://xerces.org/pollinator-resource-center/california',
    used: 'Central Valley Pollinator seed mix; native plant, seed and services directory.',
  },
  {
    key: 'xercesMilkweed',
    group: 'Take action',
    org: 'Xerces Society',
    title: 'Milkweed Finder',
    url: 'https://www.xerces.org/milkweed/milkweed-seed-finder',
    used: 'Vendor directory; ask vendors for seed origin; some vendors are wholesale only.',
  },
  {
    key: 'hedgerow',
    group: 'Take action',
    org: 'Hedgerow Farms (Winters, CA)',
    title: 'Hedgerow Farms',
    url: 'https://www.hedgerowfarms.com/',
    used: 'CA Central Valley Pollinator Mix, narrowleaf milkweed, premium seed for projects under two acres.',
  },
  {
    key: 'payne',
    group: 'Take action',
    org: 'Theodore Payne Foundation',
    title: 'Native Wildflower & Plant Seeds',
    url: 'https://store.theodorepayne.org/collections/seeds-1',
    used: 'Native seeds from $7, including poppy, milkweed, and a butterfly mix.',
  },
  {
    key: 'calscape',
    group: 'Take action',
    org: 'California Native Plant Society (Calscape)',
    title: 'Native Plant Nurseries in California',
    url: 'https://www.calscape.com/cnps/nurseries.php',
    used: 'Directory to find native plant nurseries by location.',
  },
  {
    key: 'ssSeeds',
    group: 'Take action',
    org: 'S&S Seeds',
    title: 'S&S Seeds: California native seed since 1975',
    url: 'https://nativeseedgroup.com/who-we-are/ss-seeds',
    used: 'Native seed supplier focused on restoration-scale projects and custom mixes.',
  },
  // ---- Tools
  {
    key: 'nominatim',
    group: 'Tools',
    org: 'Nominatim / OpenStreetMap',
    title: 'Nominatim geocoding service',
    url: 'https://nominatim.org/',
    used: 'Turns the address you type into a county (not stored by this site).',
  },
] as const satisfies readonly SourceDef[]

export type SourceKey = (typeof defs)[number]['key']

export type Source = SourceDef & { id: number }

export const SOURCES: Source[] = defs.map((d, i) => ({ ...d, id: i + 1 }))

export const ID = Object.fromEntries(
  SOURCES.map((s) => [s.key, s.id]),
) as Record<SourceKey, number>

export const flagged13D = '1,3-dichloropropene'

export const statewideCrops = [
  { name: 'Wine grape', lbs: 26_341_481 },
  { name: 'Almond', lbs: 23_908_413 },
  { name: 'Strawberry', lbs: 13_075_406 },
  { name: 'Table & raisin grape', lbs: 11_730_354 },
  { name: 'Processing tomato', lbs: 10_421_111 },
  { name: 'Orange', lbs: 9_550_802 },
  { name: 'Pistachio', lbs: 7_719_338 },
  { name: 'Rice', lbs: 5_995_283 },
  { name: 'Tangerine', lbs: 4_605_809 },
  { name: 'Walnut', lbs: 3_469_405 },
  { name: 'Alfalfa', lbs: 2_256_327 },
  { name: 'Cotton', lbs: 1_796_887 },
]

export const monarchCounts = [
  { year: '2020', n: 1_901 },
  { year: '2023', n: 233_394 },
  { year: '2024', n: 9_119 },
  { year: '2025', n: 12_260 },
]

// ---- Actions, FAQ, and knowledge for the helper chat ----------------------

export type ActionItem = { id: string; title: string; body: string; cite: number[] }

export const actions: ActionItem[] = [
  {
    id: 'email',
    title: 'Email your local food provider',
    body: 'Use the Email page to send a polite, specific note to a grocery store, farmers market vendor, farm, restaurant, or school nutrition director asking how food is grown and whether pollinators are protected.',
    cite: [],
  },
  {
    id: 'report',
    title: 'Report spraying that harmed people, bees, fish, or plants',
    body: 'Call 1-87PestLine (1-877-378-5463) to reach your County Agricultural Commissioner, or use the CASPIR app. You can report anonymously. If anyone has trouble breathing, call 911 first. The Report page builds a script for you.',
    cite: [ID.dprReportPage, ID.dprCaspir],
  },
  {
    id: 'plant',
    title: 'Plant native flowers and milkweed',
    body: 'Xerces recommends regionally appropriate native flowers and native milkweeds. Ask vendors where seed came from, and avoid tropical milkweed. The Plant page lists verified places to buy.',
    cite: [ID.monarch2026, ID.xercesMilkweed],
  },
  {
    id: 'yard',
    title: 'Skip insecticides at home',
    body: 'Xerces’ first monarch action is to avoid using pesticides, especially insecticides, which threaten monarchs and other pollinators.',
    cite: [ID.monarch2026],
  },
  {
    id: 'spraydays',
    title: 'Sign up for SprayDays alerts',
    body: 'Free email or text alerts for restricted-material pesticide applications near an address you choose: 48 hours notice for soil fumigants and 24 hours for other restricted materials. You can sign up anonymously.',
    cite: [ID.sprayDays, ID.sprayDays2],
  },
  {
    id: 'school',
    title: 'Ask your school or child care about its pesticide notices',
    body: 'Public K-12 schools and licensed child care centers must follow the Healthy Schools Act: yearly notices, warning signs, and individual notice for people who register.',
    cite: [ID.schools],
  },
  {
    id: 'well',
    title: 'Test private well water',
    body: 'Pesticides are among the contaminants found in Central Valley groundwater. If you or your landlord use a domestic well, ask about testing.',
    cite: [ID.wells],
  },
]

export type FaqItem = { q: string; a: string; cite: number[] }

export const faq: FaqItem[] = [
  {
    q: 'Is pesticide use really harming wildlife in the Central Valley?',
    a: 'Several studies point that way. Xerces and the University of Nevada, Reno found 64 different pesticides on Central Valley milkweed leaves, the monarch caterpillars’ only food. A Central Valley sediment survey found 42% of sampled waterway locations toxic to at least one invertebrate species. USGS found pesticides in bees, flowers, soil, and air at eight Yolo and Colusa farms. Pesticides are one of several pressures, along with habitat loss and climate.',
    cite: [ID.monarch2025, ID.sediment, ID.usgsBees],
  },
  {
    q: 'Why does almond bloom matter so much for bees?',
    a: 'About 2 million honey bee colonies, around 81% of managed US colonies, are needed in the Central Valley to pollinate almonds. A peer-reviewed analysis found that bee-toxic products without EPA precautionary statements are still commonly applied during bloom, and lab work shows some insecticide–fungicide mixes are harmful to bees.',
    cite: [ID.almondLabel, ID.almondBees2019, ID.almondTox2022],
  },
  {
    q: 'Are pesticides the only reason monarchs are disappearing?',
    a: 'No. Xerces names habitat loss, pesticides, and climate change together. The western monarch count was 12,260 in 2025, 9,119 in 2024, and 1,901 in 2020, against millions in the 1980s, a decline of roughly 10% per year. Xerces says pesticide contamination is one of the widespread issues voluntary efforts alone cannot fix.',
    cite: [ID.monarch2026, ID.monarch2025],
  },
  {
    q: 'Why does this site show county pesticide pounds?',
    a: 'DPR reports that Fresno, Kern, Tulare, San Joaquin, and Monterey counties account for half of California’s pounds applied. Fresno (26.3M lb) and Kern (24.3M lb) were the top two counties in 2023. Pounds show where use is concentrated, not how hazardous it is: sulfur and mineral oil lead by weight.',
    cite: [ID.dprReport2023, ID.dprCounty, ID.dprChem],
  },
  {
    q: 'Which chemicals does this site flag, and why?',
    a: '1,3-dichloropropene, because California lists it under Proposition 65 as known to cause cancer and DPR regulates it as a restricted material and toxic air contaminant. We only flag chemicals with an official listing we can cite.',
    cite: [ID.oehha13d, ID.dpr13d],
  },
  {
    q: 'Can I see exactly what was sprayed on the farm that supplies my store?',
    a: 'Not from one public dataset. DPR publishes use by county and crop, but no public source ties a specific farm to a specific store shelf. That is why the Email page asks providers directly how their food is grown.',
    cite: [ID.dprCounty, ID.dprTop5],
  },
  {
    q: 'Will planting flowers actually help?',
    a: 'It helps, but it is not enough alone. A PLOS ONE study found that restoring farm field margins could reconnect pollinator habitat across the Central Valley, and that cutting pesticide loads improves connectivity further. Xerces says gardens are probably a reason monarchs are not in worse shape, but larger-scale pesticide and climate issues need action too.',
    cite: [ID.plos, ID.xercesCV, ID.monarch2025],
  },
  {
    q: 'I saw spraying that hurt bees, fish, or people. What do I do?',
    a: 'If anyone has trouble breathing, leave the area and call 911. For first-aid advice, Poison Control is 1-800-222-1222. Then report it to your County Agricultural Commissioner through 1-87PestLine (1-877-378-5463) or the CASPIR app. You can stay anonymous, and you can ask for the pesticide name and a copy of the final report.',
    cite: [ID.dprReportPage, ID.dprCaspir],
  },
  {
    q: 'Is your data current?',
    a: 'County and crop figures are DPR’s 2023 report, the latest full-year summary we found. Monarch counts run through winter 2025. The waterway studies are older research, so treat them as evidence of harm, not a current snapshot. Check the sources tab for newer editions.',
    cite: [ID.dprCounty, ID.monarch2026, ID.sediment, ID.sediment2013],
  },
]

export const knowledge: { topic: string; text: string }[] = [
  ...actions.map((a) => ({
    topic: a.id,
    text: `${a.title}. ${a.body}${a.cite.length ? ` [${a.cite.join(', ')}]` : ''}`,
  })),
  ...faq.map((f) => ({
    topic: f.q,
    text: `${f.q} ${f.a} [${f.cite.join(', ')}]`,
  })),
]
