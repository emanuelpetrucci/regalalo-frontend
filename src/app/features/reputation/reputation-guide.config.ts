export interface GainCardConfig {
  id: string;
  nameKey: string;
  descKey: string;
  tagKey: string;
  pointsKey: string;
  icon: 'gift' | 'refresh' | 'receive';
}

export interface StairStepConfig {
  id: string;
  orderKey: string;
  pointsKey: string;
  noteKey: string;
  stepClass: 's1' | 's2' | 's3';
}

export interface VisStageConfig {
  id: string;
  monthsKey: string;
  unitKey: string;
  headlineKey: string;
  descKey: string;
  rows: VisRowConfig[];
}

export interface VisRowConfig {
  rank: string;
  labelKey: string;
  variant: 'default' | 'you' | 'dim' | 'invisible';
}

export const GAIN_CARDS: GainCardConfig[] = [
  {
    id: 'first',
    icon: 'gift',
    pointsKey: 'reputation_guide.gain.cards.first.points',
    nameKey: 'reputation_guide.gain.cards.first.name',
    descKey: 'reputation_guide.gain.cards.first.desc',
    tagKey: 'reputation_guide.gain.cards.first.tag',
  },
  {
    id: 'next',
    icon: 'refresh',
    pointsKey: 'reputation_guide.gain.cards.next.points',
    nameKey: 'reputation_guide.gain.cards.next.name',
    descKey: 'reputation_guide.gain.cards.next.desc',
    tagKey: 'reputation_guide.gain.cards.next.tag',
  },
  {
    id: 'receive',
    icon: 'receive',
    pointsKey: 'reputation_guide.gain.cards.receive.points',
    nameKey: 'reputation_guide.gain.cards.receive.name',
    descKey: 'reputation_guide.gain.cards.receive.desc',
    tagKey: 'reputation_guide.gain.cards.receive.tag',
  },
];

export const STAIR_STEPS: StairStepConfig[] = [
  {
    id: '1',
    stepClass: 's1',
    orderKey: 'reputation_guide.lose.stairs.first.order',
    pointsKey: 'reputation_guide.lose.stairs.first.points',
    noteKey: 'reputation_guide.lose.stairs.first.note',
  },
  {
    id: '2',
    stepClass: 's2',
    orderKey: 'reputation_guide.lose.stairs.second.order',
    pointsKey: 'reputation_guide.lose.stairs.second.points',
    noteKey: 'reputation_guide.lose.stairs.second.note',
  },
  {
    id: '3',
    stepClass: 's3',
    orderKey: 'reputation_guide.lose.stairs.third.order',
    pointsKey: 'reputation_guide.lose.stairs.third.points',
    noteKey: 'reputation_guide.lose.stairs.third.note',
  },
];

export const VIS_STAGES: VisStageConfig[] = [
  {
    id: 'one-month',
    monthsKey: 'reputation_guide.visibility.stages.one_month.months',
    unitKey: 'reputation_guide.visibility.stages.one_month.unit',
    headlineKey: 'reputation_guide.visibility.stages.one_month.headline',
    descKey: 'reputation_guide.visibility.stages.one_month.desc',
    rows: [
      {
        rank: '1',
        labelKey: 'reputation_guide.visibility.list.giver',
        variant: 'default',
      },
      {
        rank: '2',
        labelKey: 'reputation_guide.visibility.list.giver',
        variant: 'default',
      },
      {
        rank: '7',
        labelKey: 'reputation_guide.visibility.list.you_lower',
        variant: 'you',
      },
    ],
  },
  {
    id: 'two-months',
    monthsKey: 'reputation_guide.visibility.stages.two_months.months',
    unitKey: 'reputation_guide.visibility.stages.two_months.unit',
    headlineKey: 'reputation_guide.visibility.stages.two_months.headline',
    descKey: 'reputation_guide.visibility.stages.two_months.desc',
    rows: [
      {
        rank: '1',
        labelKey: 'reputation_guide.visibility.list.giver',
        variant: 'default',
      },
      {
        rank: '2',
        labelKey: 'reputation_guide.visibility.list.giver',
        variant: 'default',
      },
      {
        rank: '',
        labelKey: 'reputation_guide.visibility.list.invisible',
        variant: 'invisible',
      },
    ],
  },
];

export const REPUTATION_NAV_LINKS = [
  { id: 'explorar', labelKey: 'nav.explore', path: '/explorar' },
  { id: 'mis-objetos', labelKey: 'nav.my_items', path: '/mis-objetos' },
  { id: 'entregas', labelKey: 'nav.deliveries', path: '/entregas', childRoutes: true },
  { id: 'perfil', labelKey: 'nav.profile', path: '/perfil' },
] as const;
