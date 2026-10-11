/*
 * Manufacturing units of the group, from dplstar.com (A-58) and
 * dadupipes.com ("Our Manufacturing Backbone" and the milestones timeline).
 * All four are in the Sikandrabad Industrial Area, Bulandshahar, UP.
 */

const AREA = ['Sikandrabad, Dist. Bulandshahar', 'Uttar Pradesh 203205']

export const MANUFACTURING_UNITS = [
  {
    id: 'dpl-global',
    tag: 'DPL Star',
    name: 'DPL Global Pvt Ltd',
    address: ['A-58, Industrial Area', ...AREA],
    note: 'Commissioned in 2018 with two tube mills for hollow sections (25×25 to 150×150 mm). DPL Star Zincalume tanks are made here.',
    map: 'https://www.google.com/maps/place/A-58+DPL+GLOBAL+PVT.+LIMITED/@28.4761219,77.6657061,17z/data=!3m1!4b1!4m6!3m5!1s0x390cbd506a008249:0xe4cac1f93ce74d4d!8m2!3d28.4761172!4d77.668281!16s%2Fg%2F11lq77nsx8?entry=ttu'
  },
  {
    id: 'dadu-unit-1',
    tag: 'Dadu Pipes · Unit 1',
    name: 'Dadu Pipes Unit 1',
    address: ['A-72, Industrial Area', ...AREA],
    note: "Dadu Pipes' first unit. The company started here in 2006 with its first tube mill.",
    map: 'https://share.google/VJUzBNW4WSbupIFkA'
  },
  {
    id: 'dadu-unit-2',
    tag: 'Dadu Pipes · Unit 2',
    name: 'Dadu Pipes Unit 2',
    address: ['C-27, Industrial Area', ...AREA],
    note: 'Commissioned in 2010 to expand production and raise quality standards.',
    map: 'https://maps.app.goo.gl/MmrnHZ35zbATkCXv9'
  },
  {
    id: 'dadu-unit-3',
    tag: 'Dadu Pipes · Unit 3',
    name: 'Dadu Pipes Unit 3',
    address: ['Khasra No. 414, Industrial Area', ...AREA],
    note: "The group's newest manufacturing unit.",
    map: null
  }
]
