import { Microsite, Country } from '../types/microsite';

export const MICROSITES: Microsite[] = [
  {
    id: '1',
    title: 'Exploration & Production (MALAYSIA)',
    description: {
      en: 'Explore the wide range of Exploration & Production geospatial data managed by PETRONAS including Blocks, Fields, Wells, Facilities, Pipelines, and Platforms.',
      bm: 'Teroka rangkaian luas data geospatial Penerokaan & Pengeluaran yang diuruskan oleh PETRONAS termasuk Blok, Medan, Telaga, Kemudahan, Saluran Paip, dan Platform.'
    },
    status: 'online',
    hasAccess: true,
    icon: '🛢️',
    gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    country: 'MY'
  },
  {
    id: '2',
    title: 'PETRONAS Regional Suitability Mapping (PRSM™)',
    description: {
      en: 'PETRONAS Regional Suitability Mapping (PRSM™) hosted in web-based PiriGIS, offers a quick screening tool to assess Jack Up (JU) and Semi-Submersible rig suitability.',
      bm: 'Pemetaan Kesesuaian Wilayah PETRONAS (PRSM™) yang dihoskan dalam PiriGIS berasaskan web, menawarkan alat saringan pantas untuk menilai kesesuaian pelantar Jack Up (JU) dan Semi-Submersible.'
    },
    status: 'online',
    hasAccess: false,
    icon: '🗺️',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    country: 'MY'
  },
  {
    id: '3',
    title: 'Live ADP',
    description: {
      en: 'Explore Live Area Development Plan system, an initiative under Alpha Oil to automate Area Development Plan (ADP) using data science and machine learning algorithms.',
      bm: 'Teroka sistem Pelan Pembangunan Kawasan Langsung, inisiatif di bawah Alpha Oil untuk mengautomasikan Pelan Pembangunan Kawasan (ADP) menggunakan sains data dan algoritma pembelajaran mesin.'
    },
    status: 'online',
    hasAccess: false,
    icon: '📊',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    country: 'MY'
  },
  {
    id: '4',
    title: 'PGB - Gas Transmission & Regasification',
    description: {
      en: 'PETRONAS Gas Berhad (PGB) Gas Transmission and Regasification (GTR) manages the 2,521 km Peninsular Gas Utilisation (PGU) pipeline network across Malaysia.',
      bm: 'PETRONAS Gas Berhad (PGB) Transmisi Gas dan Regasifikasi (GTR) menguruskan rangkaian saluran paip Penggunaan Gas Semenanjung (PGU) sepanjang 2,521 km di seluruh Malaysia.'
    },
    status: 'online',
    hasAccess: true,
    icon: '⚡',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    country: 'MY'
  },
  {
    id: '5',
    title: 'Health Safety Security and Environmental',
    description: {
      en: 'Comprehensive HSE management system for tracking incidents, compliance, and safety metrics across all PETRONAS operations worldwide with real-time dashboards.',
      bm: 'Sistem pengurusan HSE komprehensif untuk menjejaki insiden, pematuhan, dan metrik keselamatan merentasi semua operasi PETRONAS di seluruh dunia dengan papan pemuka masa nyata.'
    },
    status: 'online',
    hasAccess: true,
    icon: '🛡️',
    gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    country: 'GLOBAL'
  },
  {
    id: '6',
    title: 'Maritime Security System',
    description: {
      en: 'Real-time vessel tracking and maritime security monitoring for offshore assets and shipping routes using AIS data and satellite imagery integration.',
      bm: 'Penjejakan kapal masa nyata dan pemantauan keselamatan maritim untuk aset luar pantai dan laluan perkapalan menggunakan data AIS dan integrasi imej satelit.'
    },
    status: 'online',
    hasAccess: false,
    icon: '🚢',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    country: 'GLOBAL'
  },
  {
    id: '7',
    title: 'Integrated Geological Management',
    description: {
      en: 'Advanced geological data management and analysis platform for subsurface exploration and production activities across all regions.',
      bm: 'Platform pengurusan dan analisis data geologi canggih untuk aktiviti penerokaan dan pengeluaran bawah permukaan merentasi semua wilayah.'
    },
    status: 'online',
    hasAccess: false,
    icon: '⛰️',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    country: 'GLOBAL'
  },
  {
    id: '8',
    title: 'PDB - Petroli Network',
    description: {
      en: 'Downstream business network management system for retail operations and distribution channels including petrol stations and commercial outlets.',
      bm: 'Sistem pengurusan rangkaian perniagaan hiliran untuk operasi runcit dan saluran pengedaran termasuk stesen minyak dan outlet komersial.'
    },
    status: 'offline',
    hasAccess: false,
    icon: '⛽',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    country: 'MY'
  },
  {
    id: '9',
    title: 'PETRONAS Refinery Management System',
    description: {
      en: 'Comprehensive refinery operations management system for monitoring production, maintenance, and quality control across all Malaysian refineries.',
      bm: 'Sistem pengurusan operasi penapisan komprehensif untuk memantau pengeluaran, penyelenggaraan, dan kawalan kualiti di semua kilang penapisan Malaysia.'
    },
    status: 'online',
    hasAccess: true,
    icon: '🏭',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    country: 'MY'
  },
  {
    id: '10',
    title: 'Digital Twin Operations Center',
    description: {
      en: 'Advanced digital twin platform for real-time simulation and monitoring of offshore platforms and onshore facilities across Malaysian operations.',
      bm: 'Platform kembar digital canggih untuk simulasi masa nyata dan pemantauan platform luar pantai dan kemudahan darat merentasi operasi Malaysia.'
    },
    status: 'online',
    hasAccess: false,
    icon: '🔗',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    country: 'MY'
  },
  {
    id: '11',
    title: 'PETRONAS Carbon Management Portal',
    description: {
      en: 'Carbon footprint tracking and management system for monitoring emissions, carbon credits, and sustainability metrics across Malaysian operations.',
      bm: 'Sistem penjejakan dan pengurusan jejak karbon untuk memantau pelepasan, kredit karbon, dan metrik kelestarian merentasi operasi Malaysia.'
    },
    status: 'online',
    hasAccess: true,
    icon: '🌱',
    gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    country: 'MY'
  },
  {
    id: '12',
    title: 'Smart Asset Intelligence Hub',
    description: {
      en: 'AI-powered asset management and predictive maintenance system using IoT sensors and machine learning for optimal equipment performance.',
      bm: 'Sistem pengurusan aset berkuasa AI dan penyelenggaraan ramalan menggunakan sensor IoT dan pembelajaran mesin untuk prestasi peralatan optimum.'
    },
    status: 'online',
    hasAccess: false,
    icon: '🤖',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    country: 'MY'
  },
  {
    id: '13',
    title: 'Smart Asset Intelligence Hub',
    description: {
      en: 'AI-powered asset management and predictive maintenance system using IoT sensors and machine learning for optimal equipment performance.',
      bm: 'Sistem pengurusan aset berkuasa AI dan penyelenggaraan ramalan menggunakan sensor IoT dan pembelajaran mesin untuk prestasi peralatan optimum.'
    },
    status: 'online',
    hasAccess: false,
    icon: '🤖',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    country: 'BR'
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