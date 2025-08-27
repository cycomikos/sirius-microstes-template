import { Microsite, Country } from '../types/microsite';

export const MICROSITES: Microsite[] = [
  {
    id: '1',
    title: 'Exploration & Production (MALAYSIA)',
    description: 'Explore the wide range of Exploration & Production geospatial data managed by PETRONAS including Blocks, Fields, Wells, Facilities, Pipelines, and Platforms.',
    status: 'online',
    hasAccess: true,
    icon: '🛢️',
    gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    country: 'MY'
  },
  {
    id: '2',
    title: 'PETRONAS Regional Suitability Mapping (PRSM™)',
    description: 'PETRONAS Regional Suitability Mapping (PRSM™) hosted in web-based PiriGIS, offers a quick screening tool to assess Jack Up (JU) and Semi-Submersible rig suitability.',
    status: 'online',
    hasAccess: false,
    icon: '🗺️',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    country: 'MY'
  },
  {
    id: '3',
    title: 'Live ADP',
    description: 'Explore Live Area Development Plan system, an initiative under Alpha Oil to automate Area Development Plan (ADP) using data science and machine learning algorithms.',
    status: 'online',
    hasAccess: false,
    icon: '📊',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    country: 'MY'
  },
  {
    id: '4',
    title: 'PGB - Gas Transmission & Regasification',
    description: 'PETRONAS Gas Berhad (PGB) Gas Transmission and Regasification (GTR) manages the 2,521 km Peninsular Gas Utilisation (PGU) pipeline network across Malaysia.',
    status: 'online',
    hasAccess: true,
    icon: '⚡',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    country: 'MY'
  },
  {
    id: '5',
    title: 'Health Safety Security and Environmental',
    description: 'Comprehensive HSE management system for tracking incidents, compliance, and safety metrics across all PETRONAS operations worldwide with real-time dashboards.',
    status: 'online',
    hasAccess: true,
    icon: '🛡️',
    gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    country: 'GLOBAL'
  },
  {
    id: '6',
    title: 'Maritime Security System',
    description: 'Real-time vessel tracking and maritime security monitoring for offshore assets and shipping routes using AIS data and satellite imagery integration.',
    status: 'online',
    hasAccess: false,
    icon: '🚢',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    country: 'GLOBAL'
  },
  {
    id: '7',
    title: 'Integrated Geological Management',
    description: 'Advanced geological data management and analysis platform for subsurface exploration and production activities across all regions.',
    status: 'online',
    hasAccess: false,
    icon: '⛰️',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    country: 'GLOBAL'
  },
  {
    id: '8',
    title: 'PDB - Petroli Network',
    description: 'Downstream business network management system for retail operations and distribution channels including petrol stations and commercial outlets.',
    status: 'offline',
    hasAccess: false,
    icon: '⛽',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    country: 'MY'
  }
];

export const COUNTRIES: Country[] = [
  { value: 'MY', label: '🇲🇾 Malaysia' },
  { value: 'GLOBAL', label: '🌍 Global' },
  { value: 'BR', label: '🇧🇷 Brazil' },
  { value: 'BN', label: '🇧🇳 Brunei Darussalam' },
  { value: 'GA', label: '🇬🇦 Gabon' },
  { value: 'ID', label: '🇮🇩 Indonesia' },
  { value: 'IQ', label: '🇮🇶 Iraq' },
  { value: 'SS', label: '🇸🇸 South Sudan' },
  { value: 'SR', label: '🇸🇷 Suriname' },
  { value: 'TM', label: '🇹🇲 Turkmenistan' }
];