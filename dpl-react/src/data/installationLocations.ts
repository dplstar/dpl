// Installation locations, grouped by state. lat/lng are approximate city centres.
export const INSTALLATION_LOCATIONS = [
  // Uttar Pradesh
  { name: 'Agra', state: 'UP', lat: 27.18, lng: 78.01 },
  { name: 'Ambedkar Nagar', state: 'UP', lat: 26.43, lng: 82.54 },
  { name: 'Ayodhya', state: 'UP', lat: 26.80, lng: 82.20 },
  { name: 'Azamgarh', state: 'UP', lat: 26.07, lng: 83.19 },
  { name: 'Balrampur', state: 'UP', lat: 27.43, lng: 82.18 },
  { name: 'Bareilly', state: 'UP', lat: 28.37, lng: 79.43 },
  { name: 'Ghaziabad', state: 'UP', lat: 28.67, lng: 77.45 },
  { name: 'Greater Noida', state: 'UP', lat: 28.47, lng: 77.50 },
  { name: 'Kanpur', state: 'UP', lat: 26.45, lng: 80.35 },
  { name: 'Mathura', state: 'UP', lat: 27.49, lng: 77.67 },
  { name: 'Noida', state: 'UP', lat: 28.54, lng: 77.39 },
  { name: 'Shravasti', state: 'UP', lat: 27.51, lng: 82.00 },
  { name: 'Varanasi', state: 'UP', lat: 25.32, lng: 82.97 },
  // Haryana
  { name: 'Faridabad', state: 'HR', lat: 28.41, lng: 77.31 },
  { name: 'Gurugram', state: 'HR', lat: 28.46, lng: 77.03 },
  { name: 'Rohtak', state: 'HR', lat: 28.89, lng: 76.61 },
  // Punjab
  { name: 'Abohar', state: 'PB', lat: 30.14, lng: 74.20 },
  { name: 'Hoshiarpur', state: 'PB', lat: 31.53, lng: 75.91 },
  { name: 'Lalru', state: 'PB', lat: 30.48, lng: 76.80 },
  // Telangana
  { name: 'Hyderabad', state: 'TS', lat: 17.39, lng: 78.49 },
  { name: 'Nizamabad', state: 'TS', lat: 18.67, lng: 78.09 },
  // Uttarakhand
  { name: 'Joshimath', state: 'UK', lat: 30.56, lng: 79.56 },
  { name: 'Rudrapur', state: 'UK', lat: 28.98, lng: 79.40 },
  // Single-location states / UTs
  { name: 'Chennai', state: 'TN', lat: 13.08, lng: 80.27 },
  { name: 'Indore', state: 'MP', lat: 22.72, lng: 75.86 },
  { name: 'Kozhikode', state: 'KL', lat: 11.25, lng: 75.78 },
  { name: 'Kutch', state: 'GJ', lat: 23.73, lng: 69.86 },
  { name: 'Mumbai', state: 'MH', lat: 19.08, lng: 72.88 },
  { name: 'Kinnaur Kailas', state: 'HP', lat: 31.60, lng: 78.35 },
  { name: 'Nagaland', state: 'NL', lat: 25.67, lng: 94.11 },
  { name: 'Dadra & Nagar Haveli', state: 'DH', lat: 20.27, lng: 73.02 },
  // Outside India (no state shape on the map). Placed at the centre of the
  // country, not Thimphu, so the pin sits in the gap between Sikkim and Arunachal.
  { name: 'Bhutan', state: null, lat: 27.42, lng: 90.43, outside: true },
]

// state id -> number of installation locations (use as `values` for shading)
export const COUNT_BY_STATE = INSTALLATION_LOCATIONS.reduce((acc, l) => {
  if (l.state) acc[l.state] = (acc[l.state] || 0) + 1
  return acc
}, {})