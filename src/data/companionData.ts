import { Plant, GardenBed } from '../types/garden';

export type CompanionSynergyType =
  | 'pest_deterrent'
  | 'nitrogen_fixer'
  | 'pollinator_attractor'
  | 'shade_microclimate'
  | 'root_aeration'
  | 'flavor_enhancer'
  | 'trap_crop'
  | 'general_synergy';

export type CompanionConflictType =
  | 'allelopathy'
  | 'shared_disease'
  | 'nutrient_competition'
  | 'rhizobium_inhibition'
  | 'pest_attractor'
  | 'physical_crowding'
  | 'growth_stunting'
  | 'general_conflict';

export interface CompanionDetail {
  name: string;
  matchedPlantId?: string;
  synergyType: CompanionSynergyType;
  synergyLabel: string;
  badgeEmoji: string;
  reason: string;
  plantingTip: string;
  isInUserBed?: boolean;
  userBedNames?: string[];
}

export interface IncompatibleDetail {
  name: string;
  matchedPlantId?: string;
  conflictType: CompanionConflictType;
  conflictLabel: string;
  badgeEmoji: string;
  severity: 'high' | 'medium';
  reason: string;
  separationAdvice: string;
  isInUserBed?: boolean;
  userBedNames?: string[];
}

export interface CompanionGuideResult {
  plant: Plant;
  friendly: CompanionDetail[];
  unfriendly: IncompatibleDetail[];
  activeBedSynergies: CompanionDetail[];
  activeBedConflicts: IncompatibleDetail[];
  summaryNote: string;
}

// Master botanical companion knowledge database
export const COMPANION_KNOWLEDGE_BASE: Record<
  string,
  {
    friendlyDetails: Record<string, { type: CompanionSynergyType; label: string; emoji: string; reason: string; tip: string }>;
    unfriendlyDetails: Record<string, { type: CompanionConflictType; label: string; emoji: string; severity: 'high' | 'medium'; reason: string; advice: string }>;
  }
> = {
  // Alliums (Garlic, Onions, Leeks, Shallots)
  alliums: {
    friendlyDetails: {
      'Carrots': {
        type: 'pest_deterrent',
        label: 'Mutual Pest Shield',
        emoji: '🛡️',
        reason: 'Allium pungent sulfur vapors mask carrot roots from carrot rust flies, while carrot foliage repels onion maggots.',
        tip: 'Interplant alternate rows of carrots and alliums spaced 4 inches apart.'
      },
      'Tomatoes': {
        type: 'pest_deterrent',
        label: 'Pest & Fungal Barrier',
        emoji: '🛡️',
        reason: 'Natural allicin secretions deter aphids, whiteflies, and spider mites from nightshade foliage while curbing soil fungi.',
        tip: 'Plant garlic or chives along the sunny southern perimeter of tomato stakes.'
      },
      'Peppers': {
        type: 'pest_deterrent',
        label: 'Aphid Deterrent',
        emoji: '🛡️',
        reason: 'Deters flea beetles and aphids while taking up minimal below-ground horizontal root space.',
        tip: 'Tuck around the base of sweet or chili peppers.'
      },
      'Beets': {
        type: 'root_aeration',
        label: 'Root Stratification',
        emoji: '🥕',
        reason: 'Beets and alliums draw nutrients from different soil strata without competing for shallow moisture.',
        tip: 'Alternate beet and shallot sets within the same raised bed row.'
      },
      'Spinach': {
        type: 'shade_microclimate',
        label: 'Living Mulch',
        emoji: '⛅',
        reason: 'Spinach provides a tender groundcover that keeps bulb soil moist and cool, suppressing weeds.',
        tip: 'Sow spinach between allium rows during cool spring or autumn months.'
      },
      'Lettuce': {
        type: 'shade_microclimate',
        label: 'Moisture Retention',
        emoji: '⛅',
        reason: 'Shallow leafy greens shade out germinating weeds without robbing bulbs of deep micronutrients.',
        tip: 'Harvest quick-maturing looseleaf greens before allium bulbs begin bulb swell.'
      },
      'Strawberries': {
        type: 'pest_deterrent',
        label: 'Fungal & Slug Deterrent',
        emoji: '🛡️',
        reason: 'Allium sulfur compounds significantly reduce grey mold (Botrytis) and keep destructive slugs at bay.',
        tip: 'Scatter allium bulbs between strawberry crowns in early spring.'
      },
      'Brassicas': {
        type: 'pest_deterrent',
        label: 'Cabbage Moth Repellent',
        emoji: '🛡️',
        reason: 'Pungent aroma confuses imported cabbageworms and cabbage loopers.',
        tip: 'Surround broccoli or cabbage patches with border alliums.'
      },
      'Cabbage': {
        type: 'pest_deterrent',
        label: 'Cabbage Loopers Repellent',
        emoji: '🛡️',
        reason: 'Disguises brassica leaves with strong aroma, preventing egg laying.',
        tip: 'Plant 1 allium bulb between every 2 cabbage heads.'
      },
      'Celery': {
        type: 'flavor_enhancer',
        label: 'Aroma Synergy',
        emoji: '✨',
        reason: 'Mutual scent masking that repels leaf miners and onion flies.',
        tip: 'Pair in rich, moisture-retaining organic soil.'
      },
      'Roses': {
        type: 'pest_deterrent',
        label: 'Blackspot Protection',
        emoji: '🛡️',
        reason: 'Reduces blackspot fungus and repels rose aphids.',
        tip: 'Plant garlic bulbs around rose root zones.'
      },
      'Chamomile': {
        type: 'flavor_enhancer',
        label: 'Essential Oil Booster',
        emoji: '✨',
        reason: 'Accumulates minerals and improves bulb flavor and size.',
        tip: 'Allow chamomile self-seeders around bed corners.'
      }
    },
    unfriendlyDetails: {
      'Beans': {
        type: 'rhizobium_inhibition',
        label: 'Paralyzes Root Nodules',
        emoji: '🚫',
        severity: 'high',
        reason: 'Allium root exudates contain antimicrobial sulfur compounds that paralyze nitrogen-fixing Rhizobium bacteria colonies on legume roots, severely stunting bean growth.',
        advice: 'Keep beans at least 4-6 feet away or place in an entirely separate garden bed.'
      },
      'Bush Beans': {
        type: 'rhizobium_inhibition',
        label: 'Paralyzes Nitrogen Fixation',
        emoji: '🚫',
        severity: 'high',
        reason: 'Sulfur compounds in the allium rhizosphere stunt bush bean vigor and cause leaf chlorosis.',
        advice: 'Do not plant in the same bed during the same calendar year.'
      },
      'Pole Beans': {
        type: 'rhizobium_inhibition',
        label: 'Suppresses Vine Growth',
        emoji: '🚫',
        severity: 'high',
        reason: 'Inhibits both nitrogen nodulation and tender climbing vine expansion.',
        advice: 'Separate by at least 5 feet in dedicated trellis beds.'
      },
      'Peas': {
        type: 'rhizobium_inhibition',
        label: 'Kills Beneficial Nodules',
        emoji: '🚫',
        severity: 'high',
        reason: 'Spring or fall peas suffer catastrophic root nodule failure and premature dieback next to alliums.',
        advice: 'Plant peas on opposite sides of the garden plot.'
      },
      'Asparagus': {
        type: 'nutrient_competition',
        label: 'Bulb & Crown Crowding',
        emoji: '⚡',
        severity: 'medium',
        reason: 'Both are perennial root feeders that compete intensely for soil phosphorus and potassium.',
        advice: 'Dedicate permanent asparagus beds strictly away from alliums.'
      },
      'Sage': {
        type: 'allelopathy',
        label: 'Growth Retardation',
        emoji: '🛑',
        severity: 'medium',
        reason: 'Sage volatile oils can slow bulb expansion in onions and garlic.',
        advice: 'Place sage with brassicas or carrots instead.'
      }
    }
  },

  // Nightshades (Tomatoes, Peppers, Eggplants, Potatoes)
  nightshades: {
    friendlyDetails: {
      'Basil': {
        type: 'flavor_enhancer',
        label: 'Flavor & Hornworm Defense',
        emoji: '✨',
        reason: 'Basil’s aromatic terpenes repel tomato hornworms, thrips, and fruit flies while scientific trials show it boosts tomato lycopene and essential oil production.',
        tip: 'Plant 1-2 sweet basil starts between each staked tomato plant.'
      },
      'Carrots': {
        type: 'root_aeration',
        label: 'Subsoil Aeration',
        emoji: '🥕',
        reason: 'Carrot taproots loosen deep soil without disturbing the shallow lateral fibrous feeder roots of nightshades.',
        tip: 'Sow carrot seeds around tomatoes early before tomato vines create heavy shade.'
      },
      'Parsley': {
        type: 'pollinator_attractor',
        label: 'Attracts Parasitic Wasps',
        emoji: '🐝',
        reason: 'Attracts braconid wasps whose larvae naturally eliminate tomato hornworms and aphid populations.',
        tip: 'Allow several parsley plants to flower around the bed perimeter.'
      },
      'Marigolds': {
        type: 'pest_deterrent',
        label: 'Nematicide & Pest Shield',
        emoji: '🛡️',
        reason: 'Roots exude alpha-terthienyl, an organic nematicide that eradicates root-knot nematodes while blossoms repel whiteflies.',
        tip: 'Border nightshade beds with dense French marigolds (Tagetes patula).'
      },
      'Garlic': {
        type: 'pest_deterrent',
        label: 'Fungal & Spider Mite Barrier',
        emoji: '🛡️',
        reason: 'Allicin vapors suppress early fungal spores and discourage red spider mites.',
        tip: 'Interplant garlic around the perimeter of tomato cages.'
      },
      'Onions': {
        type: 'pest_deterrent',
        label: 'Aphid Repellent',
        emoji: '🛡️',
        reason: 'Pungent allium aroma keeps aphids from colonizing tender nightshade shoots.',
        tip: 'Plant onion sets in sunny gaps around pepper stems.'
      },
      'Nasturtiums': {
        type: 'trap_crop',
        label: 'Aphid Trap & Pest Shield',
        emoji: '🎯',
        reason: 'Acts as an irresistible trap crop for aphids and flea beetles while repelling squash bugs.',
        tip: 'Tuck creeping nasturtiums at bed corners.'
      },
      'Borage': {
        type: 'pollinator_attractor',
        label: 'Hornworm Deterrent & Bees',
        emoji: '🐝',
        reason: 'Deters tomato hornworms, enriches soil with trace calcium, and lures wild bumblebees for superior blossom pollination.',
        tip: 'Plant 1 borage plant per 4 tomato vines.'
      },
      'Spinach': {
        type: 'shade_microclimate',
        label: 'Shaded Canopy Understory',
        emoji: '⛅',
        reason: 'Grows quickly in spring under tall stakes, then gets cool shade as summer heat builds.',
        tip: 'Sow at the base of newly transplanted nightshades.'
      },
      'Lettuce': {
        type: 'shade_microclimate',
        label: 'Soil Cooler & Weed Barrier',
        emoji: '⛅',
        reason: 'Creates living green mulch keeping soil moisture consistent, preventing blossom end rot.',
        tip: 'Plant butterhead lettuce under tomatoes.'
      }
    },
    unfriendlyDetails: {
      'Fennel': {
        type: 'allelopathy',
        label: 'Allelopathic Growth Inhibition',
        emoji: '🛑',
        severity: 'high',
        reason: 'Fennel roots exude anethole chemicals that chemically stunt, deform, and can kill nightshades and most garden vegetables.',
        advice: 'Never plant fennel inside the main vegetable garden; isolate in a distant herb border.'
      },
      'Cabbage': {
        type: 'nutrient_competition',
        label: 'Excessive Nutrient Drain',
        emoji: '⚡',
        severity: 'high',
        reason: 'Both are greedy heavy feeders requiring colossal amounts of nitrogen and calcium; nightshades also stunt brassica heading.',
        advice: 'Isolate in separate garden beds and practice 3-year crop rotation.'
      },
      'Broccoli': {
        type: 'nutrient_competition',
        label: 'Nutrient Competition',
        emoji: '⚡',
        severity: 'high',
        reason: 'Competes severely for soil moisture and bioavailable calcium, increasing blossom end rot.',
        advice: 'Keep at least 6 feet apart in different soil sectors.'
      },
      'Kale': {
        type: 'nutrient_competition',
        label: 'Heavy Feeder Clash',
        emoji: '⚡',
        severity: 'medium',
        reason: 'Demands massive amounts of soil potassium and magnesium.',
        advice: 'Place in separate bed sections.'
      },
      'Potatoes': {
        type: 'shared_disease',
        label: 'Late Blight & Beetle Cross-Infection',
        emoji: '🦠',
        severity: 'high',
        reason: 'Potatoes and tomatoes share the lethal Phytophthora infestans (late blight) and Colorado potato beetles; planting them together guarantees pathogen outbreaks.',
        advice: 'Plant on opposite ends of the garden to stop fungal airborne transmission.'
      },
      'Corn': {
        type: 'pest_attractor',
        label: 'Shares Destructive Worms',
        emoji: '🐛',
        severity: 'high',
        reason: 'The corn earworm (Helicoverpa zea) and the tomato fruitworm are the exact same pest; corn next to tomatoes leads to heavy infestations.',
        advice: 'Separate corn and nightshade plantings by at least 15 feet.'
      },
      'Kohlrabi': {
        type: 'nutrient_competition',
        label: 'Stunts Bulb Formation',
        emoji: '⚡',
        severity: 'medium',
        reason: 'Tomatoes inhibit kohlrabi bulb swelling and kohlrabi robs nitrogen.',
        advice: 'Keep in separate garden beds.'
      }
    }
  },

  // Brassicas (Kale, Broccoli, Cabbage, Brussels Sprouts, Cauliflower, Kohlrabi)
  brassicas: {
    friendlyDetails: {
      'Thyme': {
        type: 'pest_deterrent',
        label: 'Cabbage Worm Deterrent',
        emoji: '🛡️',
        reason: 'Aromatic thymol oils confuse white cabbage butterflies and deter cabbage loopers from laying eggs.',
        tip: 'Edge brassica raised beds with creeping or common thyme.'
      },
      'Mint': {
        type: 'pest_deterrent',
        label: 'Flea Beetle Repellent',
        emoji: '🛡️',
        reason: 'Intense menthol aroma repels flea beetles, cabbage aphids, and ants.',
        tip: 'Keep mint in sunken containers near brassicas to prevent invasive root spread.'
      },
      'Rosemary': {
        type: 'pest_deterrent',
        label: 'Moth & Beetle Deterrent',
        emoji: '🛡️',
        reason: 'Pungent evergreen terpenes repel egg-laying cabbage moths and snails.',
        tip: 'Plant nearby or lay fresh prunings around brassica stems.'
      },
      'Sage': {
        type: 'pest_deterrent',
        label: 'Disguises Leaf Scent',
        emoji: '🛡️',
        reason: 'Camouflages the natural glucosinolate scents of brassicas from wandering pests.',
        tip: 'Interplant perennial sage bushes near the cabbage patch.'
      },
      'Dill': {
        type: 'pollinator_attractor',
        label: 'Parasitic Wasp Magnet',
        emoji: '🐝',
        reason: 'Umbelliferous flowers supply nectar to tiny beneficial parasitic wasps that destroy cabbage loopers.',
        tip: 'Allow dill to flower adjacent to broccoli rows.'
      },
      'Chamomile': {
        type: 'flavor_enhancer',
        label: 'Vigor & Flavor Booster',
        emoji: '✨',
        reason: 'Improves cabbage flavor and soil calcium bioavailability.',
        tip: 'Interplant 1 chamomile plant every 6 feet in the row.'
      },
      'Onions': {
        type: 'pest_deterrent',
        label: 'Maggot & Aphid Repellent',
        emoji: '🛡️',
        reason: 'Allium aroma deters root maggots and cabbage aphids.',
        tip: 'Alternate onions with brassicas in wide garden beds.'
      },
      'Beets': {
        type: 'root_aeration',
        label: 'Nutrient Synergy',
        emoji: '🥕',
        reason: 'Beet root systems add minerals to soil without crowding heavy brassica taproots.',
        tip: 'Plant beets in between slow-growing cabbage heads.'
      },
      'Celery': {
        type: 'pest_deterrent',
        label: 'Cabbage Moth Masking',
        emoji: '🛡️',
        reason: 'Strong celery aroma masks brassica foliage.',
        tip: 'Pair in rich, moisture-retentive raised beds.'
      }
    },
    unfriendlyDetails: {
      'Tomatoes': {
        type: 'nutrient_competition',
        label: 'Heavy Feeder Clash',
        emoji: '⚡',
        severity: 'high',
        reason: 'Tomatoes deplete the exact micronutrients (boron, calcium) needed for firm brassica head formation, while brassica root exudates stunt tomato vine vigor.',
        advice: 'Never share a bed with tomatoes; separate by at least one full bed width.'
      },
      'Peppers': {
        type: 'nutrient_competition',
        label: 'Alkaline vs Acid Conflict',
        emoji: '⚡',
        severity: 'medium',
        reason: 'Brassicas prefer slightly alkaline/neutral pH (6.5-7.5) to avoid clubroot, while peppers demand acidic pH (6.0-6.5).',
        advice: 'Keep in separate garden beds with tailored soil pH.'
      },
      'Strawberries': {
        type: 'growth_stunting',
        label: 'Stunts Brassica Heads',
        emoji: '🛑',
        severity: 'high',
        reason: 'Strawberries harbor common fungal pathogens and stunt head development in cabbage and broccoli.',
        advice: 'Keep strawberry patches dedicated away from all brassica plantings.'
      },
      'Pole Beans': {
        type: 'physical_crowding',
        label: 'Smothers Sun & Canopy',
        emoji: '🌿',
        severity: 'medium',
        reason: 'Aggressive climbing vines shade out sunlight-dependent brassica heads and compete for soil moisture.',
        advice: 'Use bush varieties or separate trellises.'
      },
      'Fennel': {
        type: 'allelopathy',
        label: 'Allelopathic Stunting',
        emoji: '🛑',
        severity: 'high',
        reason: 'Releases root toxins that stunt brassica seedlings.',
        advice: 'Isolate fennel away from the main garden.'
      }
    }
  },

  // Legumes (Peas, Bush Beans, Pole Beans)
  legumes: {
    friendlyDetails: {
      'Carrots': {
        type: 'nitrogen_fixer',
        label: 'Nitrogen Feed for Foliage',
        emoji: '🌱',
        reason: 'Legumes fix free atmospheric nitrogen into soil nitrates, which feeds lush carrot foliage and promotes straight taproots.',
        tip: 'Sow carrots alongside spring peas along trellis bases.'
      },
      'Cucumbers': {
        type: 'nitrogen_fixer',
        label: 'Nitrogen for Heavy Vines',
        emoji: '🌱',
        reason: 'Cucumbers are heavy nitrogen feeders that thrive on legume root nodules; cucumbers provide leaf mulch.',
        tip: 'Plant bush beans around the base of vining cucumber trellises.'
      },
      'Corn': {
        type: 'shade_microclimate',
        label: 'Living Trellis (Three Sisters)',
        emoji: '⛅',
        reason: 'Sturdy corn stalks provide natural vertical trellising for climbing pole beans while beans stabilize corn in strong winds.',
        tip: 'Allow corn to reach 8-10 inches tall before sowing pole bean seeds.'
      },
      'Radishes': {
        type: 'trap_crop',
        label: 'Flea Beetle Barrier',
        emoji: '🎯',
        reason: 'Radishes lure flea beetles away from bean seedlings and break up tight soil crusts.',
        tip: 'Scatter fast-growing radish seeds along bean rows.'
      },
      'Spinach': {
        type: 'shade_microclimate',
        label: 'Cool Spring Partner',
        emoji: '⛅',
        reason: 'Shares cold-spring planting windows with peas; peas will later shade spinach from premature summer bolting.',
        tip: 'Sow together 4-6 weeks before the last spring frost.'
      },
      'Rosemary': {
        type: 'pest_deterrent',
        label: 'Bean Beetle Deterrent',
        emoji: '🛡️',
        reason: 'Deters Mexican bean beetles and leafhoppers with pungent aromatic oils.',
        tip: 'Plant nearby or lay sprigs across the bean row.'
      },
      'Potatoes': {
        type: 'pest_deterrent',
        label: 'Mutual Pest Shield',
        emoji: '🛡️',
        reason: 'Bush beans repel the Colorado potato beetle, while potato vines repel the destructive Mexican bean beetle.',
        tip: 'Alternate rows of bush beans and seed potatoes.'
      }
    },
    unfriendlyDetails: {
      'Garlic': {
        type: 'rhizobium_inhibition',
        label: 'Lethal to Nitrogen Nodules',
        emoji: '🚫',
        severity: 'high',
        reason: 'Garlic root exudates contain potent antimicrobial sulfur compounds that paralyze nitrogen-fixing Rhizobium bacteria in legume root nodules, stunting both crops.',
        advice: 'Keep garlic and alliums at least 4-6 feet away in a separate bed.'
      },
      'Onions': {
        type: 'rhizobium_inhibition',
        label: 'Destroys Soil Bacteria',
        emoji: '🚫',
        severity: 'high',
        reason: 'Sulfur compounds in onion roots destroy Rhizobium bacteria, causing pale, stunted legume vines with low pod set.',
        advice: 'Never intercrop onions with peas or beans.'
      },
      'Shallots': {
        type: 'rhizobium_inhibition',
        label: 'Suppresses Root Nodules',
        emoji: '🚫',
        severity: 'high',
        reason: 'Excretes sulfur biochemicals that prevent nodule development.',
        advice: 'Separate into distinct garden beds.'
      },
      'Leeks': {
        type: 'rhizobium_inhibition',
        label: 'Inhibits Legume Vigor',
        emoji: '🚫',
        severity: 'high',
        reason: 'Stunts bean root expansion and inhibits nitrogen assimilation.',
        advice: 'Do not follow leeks with beans in crop rotation.'
      },
      'Fennel': {
        type: 'allelopathy',
        label: 'Growth Retardant',
        emoji: '🛑',
        severity: 'high',
        reason: 'Root exudates stunt germination and root branching of legume seedlings.',
        advice: 'Keep fennel isolated in herb beds.'
      }
    }
  },

  // Roots (Carrots, Beets, Radishes, Parsnips, Turnips)
  roots: {
    friendlyDetails: {
      'Rosemary': {
        type: 'pest_deterrent',
        label: 'Carrot Rust Fly Shield',
        emoji: '🛡️',
        reason: 'Rosemary’s camphoric scent completely masks the aroma of root foliage from female carrot rust flies looking to lay eggs.',
        tip: 'Plant near the windward edge of the root bed.'
      },
      'Sage': {
        type: 'pest_deterrent',
        label: 'Carrot Fly Masking',
        emoji: '🛡️',
        reason: 'Overpowers root vegetable aromas with pungent essential oils.',
        tip: 'Place sage cuttings along carrot furrows during thinning.'
      },
      'Onions': {
        type: 'pest_deterrent',
        label: 'Onion Maggot & Fly Synergy',
        emoji: '🛡️',
        reason: 'Onions repel carrot flies while carrots repel onion flies in classic mutual synergy.',
        tip: 'Alternate 1 row of onions with 1 row of carrots.'
      },
      'Leeks': {
        type: 'pest_deterrent',
        label: 'Mutual Fly Barrier',
        emoji: '🛡️',
        reason: 'Leek scents deter carrot rust fly; carrot foliage deters leek moth.',
        tip: 'Interplant in deep, loose raised bed soil.'
      },
      'Lettuce': {
        type: 'shade_microclimate',
        label: 'Moisture Lock & Weed Stopper',
        emoji: '⛅',
        reason: 'Shallow root systems shade delicate root seedlings without stealing subsoil moisture.',
        tip: 'Sow lettuce between carrot rows to prevent soil crusting.'
      },
      'Peas': {
        type: 'nitrogen_fixer',
        label: 'Gentle Nitrogen Supply',
        emoji: '🌱',
        reason: 'Supplies moderate biological nitrogen, fueling sweet, crisp root growth.',
        tip: 'Grow along an adjacent trellis on the north side of the root patch.'
      },
      'Chives': {
        type: 'flavor_enhancer',
        label: 'Flavor Enhancer & Aphid Shield',
        emoji: '✨',
        reason: 'Enhances carrot and beet flavor while preventing root aphids.',
        tip: 'Plant a chive border around the bed perimeter.'
      }
    },
    unfriendlyDetails: {
      'Dill': {
        type: 'allelopathy',
        label: 'Cross-Pollination & Stunting',
        emoji: '🛑',
        severity: 'high',
        reason: 'Dill is in the same Apiaceae family as carrots and can cross-pollinate, ruining seed stock; mature dill also stunts carrot root swelling.',
        advice: 'Keep dill away from carrots and parsnips; keep at least 8 feet apart.'
      },
      'Fennel': {
        type: 'allelopathy',
        label: 'Allelopathic Stunting',
        emoji: '🛑',
        severity: 'high',
        reason: 'Inhibits root elongation and produces unpalatable, woody carrots.',
        advice: 'Keep fennel far away from all root vegetable plantings.'
      },
      'Parsnips': {
        type: 'shared_disease',
        label: 'Shared Canker & Root Flies',
        emoji: '🦠',
        severity: 'medium',
        reason: 'Both crops share carrot fly maggots and parsnip canker fungal spores; mass planting concentrates pests.',
        advice: 'Rotate into separate sections of the garden.'
      }
    }
  },

  // Cucurbits (Cucumbers, Zucchini, Squashes, Melons, Pumpkins)
  cucurbits: {
    friendlyDetails: {
      'Radishes': {
        type: 'pest_deterrent',
        label: 'Cucumber Beetle Defense',
        emoji: '🛡️',
        reason: 'Radish pungent leaves and glucosinolates deter destructive striped and spotted cucumber beetles from chewing cotyledons.',
        tip: 'Sow 4-6 radish seeds right inside each cucumber or squash hill; let them bloom.'
      },
      'Corn': {
        type: 'shade_microclimate',
        label: 'Windbreak & Microclimate',
        emoji: '⛅',
        reason: 'Tall corn blocks drying prairie winds and provides dappled relief during intense mid-summer afternoons.',
        tip: 'Plant on the south or west side of squash vines.'
      },
      'Nasturtiums': {
        type: 'pest_deterrent',
        label: 'Squash Bug Repellent',
        emoji: '🛡️',
        reason: 'Natural mustard oils repel squash bugs (Anasa tristis) and striped cucumber beetles.',
        tip: 'Tumble trailing nasturtiums through pumpkin and zucchini beds.'
      },
      'Sunflowers': {
        type: 'pollinator_attractor',
        label: 'Bee Lure for Fruit Set',
        emoji: '🐝',
        reason: 'Giant flower heads attract hundreds of wild bumblebees that ensure 100% pollination of female squash blossoms.',
        tip: 'Plant along the north perimeter of zucchini beds.'
      },
      'Beans': {
        type: 'nitrogen_fixer',
        label: 'Vigor & Leaf Feeder',
        emoji: '🌱',
        reason: 'Enriches soil with nitrates for massive vine and broad leaf growth.',
        tip: 'Pair bush beans around squash hills.'
      },
      'Dill': {
        type: 'pollinator_attractor',
        label: 'Attracts Beneficial Parasitoids',
        emoji: '🐝',
        reason: 'Attracts hoverflies and predatory wasps that feast on cucumber aphids.',
        tip: 'Let dill bloom near cucumber vines.'
      }
    },
    unfriendlyDetails: {
      'Potatoes': {
        type: 'shared_disease',
        label: 'Blight & Mildew Cross-Infection',
        emoji: '🦠',
        severity: 'high',
        reason: 'Potatoes foster high humidity and airborne Phytophthora blight spores that trigger severe powdery mildew in cucurbits.',
        advice: 'Keep potatoes in a separate bed far from squash and cucumbers.'
      },
      'Sage': {
        type: 'growth_stunting',
        label: 'Stunts Vine Expansion',
        emoji: '🛑',
        severity: 'high',
        reason: 'Strong aromatic volatile oils from sage retard cucumber germination and slow vine growth.',
        advice: 'Grow sage with brassicas or carrots, never near cucurbit vines.'
      },
      'Fennel': {
        type: 'allelopathy',
        label: 'Toxic Root Exudates',
        emoji: '🛑',
        severity: 'high',
        reason: 'Suppresses vine development and reduces blossom count.',
        advice: 'Isolate in separate borders.'
      }
    }
  },

  // Leafy Greens (Lettuce, Spinach, Swiss Chard, Arugula, Asian Greens)
  leafy_greens: {
    friendlyDetails: {
      'Carrots': {
        type: 'root_aeration',
        label: 'Depth Stratification',
        emoji: '🥕',
        reason: 'Deep carrot taproots and shallow leafy green feeder roots utilize different soil horizons harmoniously.',
        tip: 'Interplant in alternating rows.'
      },
      'Radishes': {
        type: 'shade_microclimate',
        label: 'Trap Crop & Breakup',
        emoji: '🎯',
        reason: 'Quick-maturing radishes loosen surface soil and lure flea beetles away from tender greens.',
        tip: 'Sow radishes alongside looseleaf lettuce seeds.'
      },
      'Chives': {
        type: 'pest_deterrent',
        label: 'Aphid Deterrent',
        emoji: '🛡️',
        reason: 'Gentle allium scent prevents aphids from gathering in dense leafy crowns.',
        tip: 'Plant clumping chives around salad greens.'
      },
      'Strawberries': {
        type: 'shade_microclimate',
        label: 'Living Groundcover',
        emoji: '⛅',
        reason: 'Both enjoy cool soils, organic compost, and balanced moisture.',
        tip: 'Fill bare strawberry bed gaps with cut-and-come-again greens.'
      },
      'Bush Beans': {
        type: 'nitrogen_fixer',
        label: 'Gentle Nitrogen & Dappled Shade',
        emoji: '🌱',
        reason: 'Bush beans fix steady nitrogen that keeps leaves tender and lush, while casting shade to prevent bolting.',
        tip: 'Plant on the sunny side of spinach during late spring.'
      },
      'Cucumbers': {
        type: 'shade_microclimate',
        label: 'Summer Shade Canopy',
        emoji: '⛅',
        reason: 'Broad cucumber leaves shield greens from intense midsummer afternoon sun.',
        tip: 'Tuck greens underneath cucumber A-frame trellises.'
      }
    },
    unfriendlyDetails: {
      'Parsley': {
        type: 'physical_crowding',
        label: 'Crowds Shallow Roots',
        emoji: '🌿',
        severity: 'medium',
        reason: 'Parsley develops a dense, fibrous root mass that can choke delicate shallow salad green roots.',
        advice: 'Give parsley its own container or separate bed margin.'
      },
      'Fennel': {
        type: 'allelopathy',
        label: 'Inhibits Germination',
        emoji: '🛑',
        severity: 'high',
        reason: 'Chemical secretions prevent lettuce seed germination and cause bitter foliage.',
        advice: 'Keep away from all salad greens.'
      }
    }
  }
};

// Generic fallback helpers for plants not explicitly defined
const FALLBACK_FRIENDLY_REASONS: Record<CompanionSynergyType, { label: string; emoji: string; reason: string; tip: string }> = {
  pest_deterrent: {
    label: 'Natural Pest Shield',
    emoji: '🛡️',
    reason: 'Pungent aromatic terpenes and volatile oils disguise foliage from insect pests and confuse egg-laying moths.',
    tip: 'Interplant closely to maximize scent barrier effectiveness.'
  },
  nitrogen_fixer: {
    label: 'Nitrogen Enrichment',
    emoji: '🌱',
    reason: 'Fixes atmospheric nitrogen into bioavailable soil nutrients, supporting robust vegetative growth.',
    tip: 'Plant side-by-side or rotate in succession.'
  },
  pollinator_attractor: {
    label: 'Pollinator Magnet',
    emoji: '🐝',
    reason: 'Produces pollen and nectar that attract native bees and predatory beneficial insects.',
    tip: 'Allow companion plants to bloom continuously along bed margins.'
  },
  shade_microclimate: {
    label: 'Microclimate & Living Mulch',
    emoji: '⛅',
    reason: 'Provides light canopy shade to conserve soil moisture and prevent cool-season crops from bolting prematurely.',
    tip: 'Position on the south or west side of sun-sensitive crops.'
  },
  root_aeration: {
    label: 'Root Stratification',
    emoji: '🥕',
    reason: 'Extracts minerals from different soil depths without competing with surface feeder roots.',
    tip: 'Alternate deep taproots with shallow fibrous rooted plants.'
  },
  flavor_enhancer: {
    label: 'Flavor & Vigor Synergy',
    emoji: '✨',
    reason: 'Produces organic biochemical compounds that enhance essential oil concentration and crop vitality.',
    tip: 'Plant within 12-18 inches for maximum botanical interaction.'
  },
  trap_crop: {
    label: 'Beneficial Trap Crop',
    emoji: '🎯',
    reason: 'Lures aphids, flea beetles, and caterpillars away from main vegetable crops.',
    tip: 'Inspect regularly and prune heavily infested trap leaves.'
  },
  general_synergy: {
    label: 'Beneficial Neighbor',
    emoji: '💚',
    reason: 'Compatible growth habits, shared soil pH requirements, and harmonious nutrient uptake.',
    tip: 'Plant together in well-prepared compost-rich soil.'
  }
};

const FALLBACK_UNFRIENDLY_REASONS: Record<CompanionConflictType, { label: string; emoji: string; reason: string; advice: string }> = {
  allelopathy: {
    label: 'Allelopathic Growth Inhibition',
    emoji: '🛑',
    reason: 'Releases biochemical root exudates that chemically stunt seed germination, stem elongation, and root development.',
    advice: 'Keep separated in dedicated garden beds or isolated containers.'
  },
  rhizobium_inhibition: {
    label: 'Suppresses Nitrogen-Fixing Bacteria',
    emoji: '🚫',
    reason: 'Antimicrobial sulfur compounds inhibit beneficial Rhizobium bacteria, stunting legume nodulation and growth.',
    advice: 'Maintain a minimum 4-6 foot separation between alliums and legumes.'
  },
  shared_disease: {
    label: 'Shared Fungal & Viral Pathogens',
    emoji: '🦠',
    reason: 'Both crops are vulnerable to the same blights, root rots, and insect vectors; grouping them accelerates disease spread.',
    advice: 'Separate to opposite sides of the garden and practice 3-year crop rotation.'
  },
  nutrient_competition: {
    label: 'Heavy Feeder Nutrient Depletion',
    emoji: '⚡',
    reason: 'Both crops demand immense amounts of identical soil nutrients (nitrogen, calcium, potassium), starving root zones.',
    advice: 'Separate into distinct beds with balanced compost amendments.'
  },
  pest_attractor: {
    label: 'Attracts Shared Pests',
    emoji: '🐛',
    reason: 'Provides an ideal breeding habitat for destructive insect pests that readily migrate between both crops.',
    advice: 'Separate plantings and use protective floating row covers.'
  },
  physical_crowding: {
    label: 'Canopy Smothering & Root Crowding',
    emoji: '🌿',
    reason: 'Aggressive growth habits shade out light or choke shallow root systems.',
    advice: 'Use trellising or allow generous spacing.'
  },
  growth_stunting: {
    label: 'Growth Retardation & Stunting',
    emoji: '🛑',
    reason: 'Interferes with neighboring plant cell division, delayed heading, or root development.',
    advice: 'Separate into different sectors of the garden plot.'
  },
  general_conflict: {
    label: 'Incompatible Growth Habits',
    emoji: '⚠️',
    reason: 'Conflicting soil pH, moisture demands, or growth habit incompatibility.',
    advice: 'Avoid planting in the same row or container.'
  }
};

/**
 * Builds a comprehensive companion guide for a specific plant,
 * matching against other plants in the catalog and checking active garden beds.
 */
export function getCompanionGuideForPlant(
  plant: Plant,
  allPlants: Plant[] = [],
  beds: GardenBed[] = []
): CompanionGuideResult {
  const categoryKey = plant.category;
  const knowledge = COMPANION_KNOWLEDGE_BASE[categoryKey];

  // Helper to find plant match in catalog
  const findPlantMatch = (name: string): Plant | undefined => {
    const clean = name.toLowerCase().trim();
    return allPlants.find(p => {
      const pName = p.name.toLowerCase();
      return pName.includes(clean) || clean.includes(pName) || p.id.toLowerCase().includes(clean);
    });
  };

  // Helper to check which beds contain a plant
  const checkBedsForPlant = (plantNameOrId: string): string[] => {
    const clean = plantNameOrId.toLowerCase().trim();
    const bedNames: string[] = [];
    
    beds.forEach(bed => {
      const hasPlant = bed.plants.some(bp => {
        if (bp.isHarvested) return false;
        const bName = bp.plantName.toLowerCase();
        const bId = bp.plantId.toLowerCase();
        return bName.includes(clean) || clean.includes(bName) || bId.includes(clean);
      });
      if (hasPlant) {
        bedNames.push(bed.name);
      }
    });

    return bedNames;
  };

  // Friendly Companions
  const friendly: CompanionDetail[] = [];
  const rawCompanions = plant.companions || [];

  rawCompanions.forEach(companionName => {
    const matched = findPlantMatch(companionName);
    const bedMatches = checkBedsForPlant(matched?.name || companionName);

    // Look for specific knowledge
    let detail = knowledge?.friendlyDetails?.[companionName];
    if (!detail && matched) {
      detail = knowledge?.friendlyDetails?.[matched.name];
    }

    if (detail) {
      friendly.push({
        name: companionName,
        matchedPlantId: matched?.id,
        synergyType: detail.type,
        synergyLabel: detail.label,
        badgeEmoji: detail.emoji,
        reason: detail.reason,
        plantingTip: detail.tip,
        isInUserBed: bedMatches.length > 0,
        userBedNames: bedMatches
      });
    } else {
      // Smart inferred synergy
      let type: CompanionSynergyType = 'general_synergy';
      if (companionName.toLowerCase().includes('basil') || companionName.toLowerCase().includes('marigold') || companionName.toLowerCase().includes('thyme') || companionName.toLowerCase().includes('mint')) {
        type = 'pest_deterrent';
      } else if (companionName.toLowerCase().includes('bean') || companionName.toLowerCase().includes('pea')) {
        type = 'nitrogen_fixer';
      } else if (companionName.toLowerCase().includes('radish') || companionName.toLowerCase().includes('carrot')) {
        type = 'root_aeration';
      } else if (companionName.toLowerCase().includes('borage') || companionName.toLowerCase().includes('sunflower') || companionName.toLowerCase().includes('dill')) {
        type = 'pollinator_attractor';
      }

      const fallback = FALLBACK_FRIENDLY_REASONS[type];
      friendly.push({
        name: companionName,
        matchedPlantId: matched?.id,
        synergyType: type,
        synergyLabel: fallback.label,
        badgeEmoji: fallback.emoji,
        reason: fallback.reason,
        plantingTip: fallback.tip,
        isInUserBed: bedMatches.length > 0,
        userBedNames: bedMatches
      });
    }
  });

  // Unfriendly / Incompatible
  const unfriendly: IncompatibleDetail[] = [];
  const rawAvoid = plant.avoidCompanions || [];

  rawAvoid.forEach(avoidName => {
    const matched = findPlantMatch(avoidName);
    const bedMatches = checkBedsForPlant(matched?.name || avoidName);

    // Look for specific knowledge
    let detail = knowledge?.unfriendlyDetails?.[avoidName];
    if (!detail && matched) {
      detail = knowledge?.unfriendlyDetails?.[matched.name];
    }

    if (detail) {
      unfriendly.push({
        name: avoidName,
        matchedPlantId: matched?.id,
        conflictType: detail.type,
        conflictLabel: detail.label,
        badgeEmoji: detail.emoji,
        severity: detail.severity,
        reason: detail.reason,
        separationAdvice: detail.advice,
        isInUserBed: bedMatches.length > 0,
        userBedNames: bedMatches
      });
    } else {
      let conflictType: CompanionConflictType = 'general_conflict';
      let severity: 'high' | 'medium' = 'medium';

      if (avoidName.toLowerCase().includes('fennel')) {
        conflictType = 'allelopathy';
        severity = 'high';
      } else if (avoidName.toLowerCase().includes('bean') || avoidName.toLowerCase().includes('pea')) {
        if (plant.category === 'alliums') {
          conflictType = 'rhizobium_inhibition';
          severity = 'high';
        }
      } else if (avoidName.toLowerCase().includes('potato') && plant.category === 'nightshades') {
        conflictType = 'shared_disease';
        severity = 'high';
      } else if (avoidName.toLowerCase().includes('cabbage') || avoidName.toLowerCase().includes('broccoli')) {
        conflictType = 'nutrient_competition';
        severity = 'high';
      }

      const fallback = FALLBACK_UNFRIENDLY_REASONS[conflictType];
      unfriendly.push({
        name: avoidName,
        matchedPlantId: matched?.id,
        conflictType,
        conflictLabel: fallback.label,
        badgeEmoji: fallback.emoji,
        severity,
        reason: fallback.reason,
        separationAdvice: fallback.advice,
        isInUserBed: bedMatches.length > 0,
        userBedNames: bedMatches
      });
    }
  });

  // Filter active bed synergies and conflicts
  const activeBedSynergies = friendly.filter(f => f.isInUserBed);
  const activeBedConflicts = unfriendly.filter(u => u.isInUserBed);

  let summaryNote = '';
  if (friendly.length > 0 && unfriendly.length > 0) {
    summaryNote = `${plant.name} pairs favorably with ${friendly.length} beneficial companions and should be kept away from ${unfriendly.length} antagonistic neighbors.`;
  } else if (friendly.length > 0) {
    summaryNote = `${plant.name} thrives alongside ${friendly.length} beneficial companion crops with no major known antagonisms.`;
  } else if (unfriendly.length > 0) {
    summaryNote = `Take care to separate ${plant.name} from ${unfriendly.length} antagonistic garden crops.`;
  } else {
    summaryNote = `${plant.name} has flexible planting habits and is broadly compatible with most garden vegetables.`;
  }

  return {
    plant,
    friendly,
    unfriendly,
    activeBedSynergies,
    activeBedConflicts,
    summaryNote
  };
}
