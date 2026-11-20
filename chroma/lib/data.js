// Sample content for the Past drops and Previous iterations pages.
// Replace these with real drops when you have them.

export const PAST = [
  {
    n: '02',
    t: 'Night shift',
    art: 'radial-gradient(circle at 50% 38%,#f2c200 0 15%,transparent 16%),#1a0c06',
    d: [
      ['Released', 'Oct 28, 2026'],
      ['Price', '$42'],
      ['Produced', '100 pieces'],
      ['Sold out in', '6 days'],
      ['Approved by', '91% of buyers'],
      ['Submissions', '214 from 58 people'],
    ],
  },
  {
    n: '01',
    t: 'Overexposed',
    art: 'linear-gradient(180deg,#ffffff,#f6b79c)',
    d: [
      ['Released', 'Sep 30, 2026'],
      ['Price', '$38'],
      ['Produced', '80 pieces'],
      ['Sold out in', '9 days'],
      ['Approved by', '87% of buyers'],
      ['Submissions', '163 from 41 people'],
    ],
  },
  {
    n: '00',
    t: 'Photocopy',
    art: 'repeating-linear-gradient(45deg,#222 0 3px,#eee 3px 9px)',
    d: [
      ['Released', 'Aug 26, 2026'],
      ['Price', '$35'],
      ['Produced', '50 pieces'],
      ['Sold out in', '3 days'],
      ['Approved by', '94% of buyers'],
      ['Submissions', '88 from 22 people'],
    ],
  },
]

export const ITER = [
  {
    n: 1,
    w: 'Nov 9',
    art: 'repeating-linear-gradient(0deg,#111 0 2px,transparent 2px 8px)',
    t: 'First pass from the Signal loss cluster: scanlines only, no color yet.',
    f: 'Signal loss: CRT scanlines',
  },
  {
    n: 2,
    w: 'Nov 16',
    art: 'linear-gradient(90deg,#F24D11 0 28%,transparent 28%),repeating-linear-gradient(0deg,#111 0 2px,transparent 2px 8px)',
    t: 'Palette narrowed to black and one blue after votes moved Dropped frame up.',
    f: 'Signal loss: Dropped frame, Quiet blue: Overexposed sky',
  },
]

// Set to true once there are real previous iterations to look at.
export const HAS_ITERATIONS = false

// Your own design work, shown on the past drops page.
// Put image files in /public/work and list them here, e.g. { src: '/work/tee1.jpg', label: 'tee 01' }
export const WORK = [
  { src: '/work/becoming.webp', label: 'becoming' },
  { src: '/work/fall-rush.webp', label: 'fall rush' },
  { src: '/work/student-government.webp', label: 'student government' },
  { src: '/work/this-way-up.webp', label: 'this way up' },
]
