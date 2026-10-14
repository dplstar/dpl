/*
 * Manufacturing units of the group, from dplstar.com (A-58) and
 * dadupipes.com ("Our Manufacturing Backbone" and the milestones timeline).
 * All four are in the Sikandrabad Industrial Area, Bulandshahar, UP.
 */

const AREA = ['Sikandrabad, Dist. Bulandshahar', 'Uttar Pradesh 203205']

export const MANUFACTURING_UNITS = [
  {
    id: 'dpl-global',
    tag: 'Primary Unit',
    name: 'Unit 1',
    address: ['A-58, Industrial Area', ...AREA],
    note: 'Commissioned in 2008, it is the core unit of where zincalume tanks are made.',
    map: 'https://www.google.com/maps/place/A-58+DPL+GLOBAL+PVT.+LIMITED/@28.4761219,77.6657061,17z/data=!3m1!4b1!4m6!3m5!1s0x390cbd506a008249:0xe4cac1f93ce74d4d!8m2!3d28.4761172!4d77.668281!16s%2Fg%2F11lq77nsx8?entry=ttu'
  },
  {
    id: 'dadu-unit-1',
    tag: 'Associated Unit',
    name: 'Unit 2',
    address: ['A-72, Industrial Area', ...AREA],
    note: "Commissioned in 2006, it is the primary unit for manufacturing pipes.",
    map: 'https://share.google/VJUzBNW4WSbupIFkA'
  },
  {
    id: 'dadu-unit-2',
    tag: 'Supportive Unit',
    name: 'Unit 3',
    address: ['C-27, Industrial Area', ...AREA],
    note: 'Commissioned in 2010 it is the supportive unit for production expansion',
    map: 'https://maps.app.goo.gl/MmrnHZ35zbATkCXv9'
  },
  {
    id: 'dadu-unit-3',
    tag: 'Flagship Unit',
    name: 'Unit 4',
    address: ['Khasra No. 414, Industrial Area', ...AREA],
    note: "Upcoming unit with modern machinery for manufacturing tanks & silos.",
    map: 'https://google.com/maps/search/Khasra+No+414+Industrial+Area+Sikandrabad+Dist+Bulandshahar+Uttar+Pradesh+203205/@28.4421289,77.6959991,11z?entry=s&sa=X&ved=1t%3A199789'
  }
]
