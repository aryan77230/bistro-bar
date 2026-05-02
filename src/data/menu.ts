/**
 * Menu content for Bistro Bar.
 * Dishes and cocktails are placeholder copy meant to feel editorial; swap freely.
 * Prices shown in INR (₹) to match the Durg, Chhattisgarh location.
 */

export const signatureDishes = [
  'Duck Confit',
  'Black Garlic Focaccia',
  'Smoked Old Fashioned',
  'Beet Tartare',
  'Bone Marrow',
  'Negroni Bianco',
  'Charred Octopus',
  'Saffron Risotto',
  'Bruléed Figs',
  'Mezcal Sour',
];

export interface WineLabel {
  vintage: string;
  name: string;
  variety: string;
  /** Optional bottle / glass image displayed as the card background. */
  image?: string;
  region: string;
  notes: string;
  price: string;
  colorStops: [string, string];
}

export const wines: WineLabel[] = [
  {
    vintage: '2018',
    name: 'Maison Crépuscule',
    variety: 'Pinot Noir',
    region: 'Burgundy · France',
    notes: 'Crushed violets, damp earth, a whisper of clove.',
    price: '₹ 4,200 / 750ml',
    image:
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=75',
    colorStops: ['#7C2835', '#2A0E12'],
  },
  {
    vintage: '2020',
    name: 'Sottobosco',
    variety: 'Sangiovese',
    region: 'Tuscany · Italy',
    notes: 'Sour cherry skin, dried oregano, weathered oak.',
    price: '₹ 3,600 / 750ml',
    image:
      'https://images.unsplash.com/photo-1474722883778-792e7990302f?auto=format&fit=crop&w=900&q=75',
    colorStops: ['#3E2413', '#1E1108'],
  },
  {
    vintage: '2021',
    name: 'Doon di Notte',
    variety: 'Nebbiolo',
    region: 'Piedmont · Italy',
    notes: 'Rose petal, tar, cold espresso, brick dust.',
    price: '₹ 5,100 / 750ml',
    image:
      'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?auto=format&fit=crop&w=900&q=75',
    colorStops: ['#3B1F3A', '#1A0C1F'],
  },
  {
    vintage: '2022',
    name: 'Aubade Blanc',
    variety: 'Chenin Blanc',
    region: 'Loire · France',
    notes: 'Quince, saline minerality, beeswax, bright finish.',
    price: '₹ 3,800 / 750ml',
    image:
      'https://images.unsplash.com/photo-1584013750984-2ce404f31c68?auto=format&fit=crop&w=900&q=75',
    colorStops: ['#D4A560', '#6B4F1A'],
  },
  {
    vintage: '2019',
    name: 'Selva Profonda',
    variety: 'Syrah / Shiraz',
    region: 'Nashik · India',
    notes: 'Cracked pepper, blackberry jam, smoked paprika.',
    price: '₹ 2,900 / 750ml',
    image:
      'https://images.unsplash.com/photo-1547595628-c61a29f496f0?auto=format&fit=crop&w=900&q=75',
    colorStops: ['#5A2A1A', '#2E3618'],
  },
];

export interface Cocktail {
  title: string;
  subtitle: string;
  price: string;
  gradient: string;
  borderColor: string;
  handle?: string;
  image?: string;
  /** Optional MP4 URL — when set, hovering the card reveals this
   *  short clip with a staggered colour transition. */
  video?: string;
}

export const cocktails: Cocktail[] = [
  {
    title: 'Smoked Old Fashioned',
    subtitle: 'Bourbon · demerara · hickory smoke · orange peel',
    price: '₹ 850',
    gradient: 'linear-gradient(160deg,#7C2835 0%,#2A0E12 55%,#1A0B0E 100%)',
    borderColor: '#A03D50',
    handle: 'house · 02',
    image:
      'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=900&q=75',
    // 6s clip from a YouTube cocktail tutorial (8:20–8:26 of CN-RjWGSUoc),
    // hosted locally so it loops cleanly without buffering.
    video: '/videos/smoked-old-fashioned.mp4',
  },
  {
    title: 'Negroni Bianco',
    subtitle: 'Gin · Suze · Lillet · olive brine mist',
    price: '₹ 780',
    gradient: 'linear-gradient(160deg,#D4A560 0%,#6B4F1A 60%,#1A0B0E 100%)',
    borderColor: '#D4A560',
    handle: 'aperitivo · 07',
    image:
      'https://images.unsplash.com/photo-1587223962930-cb7f31384c19?auto=format&fit=crop&w=900&q=75',
    // Mixkit "Smoking cocktail glass".
    video: 'https://assets.mixkit.co/videos/22850/22850-720.mp4',
  },
  {
    title: 'Mezcal Paloma',
    subtitle: 'Mezcal · grapefruit cordial · sea salt · lime foam',
    price: '₹ 820',
    gradient: 'linear-gradient(160deg,#5A2A1A 0%,#2E3618 60%,#1A0B0E 100%)',
    borderColor: '#5A2A1A',
    handle: 'agave · 11',
    image:
      'https://images.unsplash.com/photo-1541546006121-5c3bc5e8c7b9?auto=format&fit=crop&w=900&q=75',
    // Mixkit "Homemade margarita cocktail" — citrus-forward like a paloma.
    video: 'https://assets.mixkit.co/videos/5128/5128-720.mp4',
  },
  {
    title: 'Saffron Gimlet',
    subtitle: 'Gin · kaffir lime cordial · saffron thread · white pepper',
    price: '₹ 790',
    gradient: 'linear-gradient(160deg,#E8C88A 0%,#A0703A 60%,#1A0B0E 100%)',
    borderColor: '#E8C88A',
    handle: 'signature · 04',
    image:
      'https://images.unsplash.com/photo-1609951651556-5334e2706168?auto=format&fit=crop&w=900&q=75',
    // Mixkit "Martini cocktail with olives" — coupe glass like a gimlet.
    video: 'https://assets.mixkit.co/videos/5133/5133-720.mp4',
  },
  {
    title: 'Black Fig Sour',
    subtitle: 'Rye · black fig preserve · lemon · aquafaba · angostura',
    price: '₹ 820',
    gradient: 'linear-gradient(160deg,#3B1F3A 0%,#1A0C1F 60%,#1A0B0E 100%)',
    borderColor: '#5E2D5B',
    handle: 'seasonal · 09',
    image:
      'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=900&q=75',
    // Mixkit "Bartender makes an experimental cocktail" — dark / moody.
    video: 'https://assets.mixkit.co/videos/4172/4172-720.mp4',
  },
  {
    title: 'Cardamom Espresso Martini',
    subtitle: 'Vodka · espresso · cardamom · cacao dust',
    price: '₹ 860',
    gradient: 'linear-gradient(160deg,#3E2413 0%,#1E1108 60%,#1A0B0E 100%)',
    borderColor: '#7A4A2A',
    handle: 'after · 03',
    image:
      'https://images.unsplash.com/photo-1545438102-799c3991ffb2?auto=format&fit=crop&w=900&q=75',
    // Mixkit "Barmaid preparing a cocktail in the bar".
    video: 'https://assets.mixkit.co/videos/4295/4295-720.mp4',
  },
];

export interface Plate {
  name: string;
  description: string;
  price: string;
  /** Optional gradient backdrop for the card body (mirrors the
   *  Cocktail pattern). */
  gradient?: string;
  /** Optional border colour matched to the gradient palette. */
  borderColor?: string;
  image: string;
  tag: string;
}

export const plates: Plate[] = [
  {
    name: 'Charred Octopus',
    description: 'Smoked paprika oil, pickled fennel, burnt lemon',
    price: '₹ 1,450',
    gradient: 'linear-gradient(160deg,#8B3A1F 0%,#3A1810 55%,#1A0B0E 100%)',
    borderColor: '#B85B30',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=75',
    tag: 'plates · 01',
  },
  {
    name: 'Beet Tartare',
    description: 'Roasted beet, caper leaf, horseradish snow, rye crisp',
    price: '₹ 780',
    gradient: 'linear-gradient(160deg,#7A2840 0%,#2E0F1A 55%,#1A0B0E 100%)',
    borderColor: '#9B3A55',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=75',
    tag: 'plates · 02',
  },
  {
    name: 'Bone Marrow & Toast',
    description: 'Roasted femur, parsley gremolata, sourdough coal',
    price: '₹ 1,120',
    gradient: 'linear-gradient(160deg,#A07A4A 0%,#3A2A18 55%,#1A0B0E 100%)',
    borderColor: '#C29055',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=75',
    tag: 'plates · 03',
  },
  {
    name: 'Saffron Risotto',
    description: 'Aged carnaroli, saffron threads, brown butter, aged parm',
    price: '₹ 1,280',
    gradient: 'linear-gradient(160deg,#D4A560 0%,#6B4F1A 60%,#1A0B0E 100%)',
    borderColor: '#E0B870',
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=900&q=75',
    tag: 'plates · 04',
  },
  {
    name: 'Duck Confit',
    description: 'Slow-cooked leg, black cherry jus, crisped potato pavé',
    price: '₹ 1,680',
    gradient: 'linear-gradient(160deg,#5A1F2A 0%,#2A0E12 55%,#1A0B0E 100%)',
    borderColor: '#7C2835',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=75',
    tag: 'plates · 05',
  },
  {
    name: 'Bruléed Figs',
    description: 'Black mission figs, stracciatella, thyme honey, cracked pepper',
    price: '₹ 680',
    gradient: 'linear-gradient(160deg,#4A1F3D 0%,#1F0F1A 60%,#1A0B0E 100%)',
    borderColor: '#6B2D5C',
    image: 'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?auto=format&fit=crop&w=900&q=75',
    tag: 'desserts · 01',
  },
];

export const heroStats = [
  { to: 135, label: 'Seats' },
  { to: 48, label: 'Cocktails on Menu', suffix: '' },
  { to: 2024, label: 'Est.', separator: '' },
  { to: 7, label: 'Nights a Week' },
];
