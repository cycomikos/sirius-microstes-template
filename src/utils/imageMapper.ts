// Import all images from assets
import EH from '../assets/images/EH.png';
import HSSE from '../assets/images/HSSE.png';
import LiveADP_2 from '../assets/images/LiveADP_2.png';
import VTS_maritime from '../assets/images/VTS_maritime.png';
import bio from '../assets/images/bio.png';
import enp from '../assets/images/enp.png';
import esi from '../assets/images/esi.png';
import iegms from '../assets/images/iegms.png';
import pdb from '../assets/images/pdb.png';
import pgb from '../assets/images/pgb.png';
import prism from '../assets/images/prism.png';
import logoSirius from '../assets/images/logo-sirius.jpeg';

// Image mapping based on microsite title or ID
export const IMAGE_MAP: Record<string, string> = {
  // Direct filename matches (case-insensitive)
  'eh': EH,
  'hsse': HSSE,
  'liveadp_2': LiveADP_2,
  'liveadp': LiveADP_2, // Alternative name
  'vts_maritime': VTS_maritime,
  'vts': VTS_maritime, // Alternative name
  'bio': bio,
  'enp': enp,
  'esi': esi,
  'iegms': iegms,
  'pdb': pdb,
  'pgb': pgb,
  'prism': prism,
  
  // Alternative mappings based on common microsite names
  'environmental health': EH,
  'health safety security environment': HSSE,
  'health safety': HSSE,
  'adp': LiveADP_2,
  'vessel traffic': VTS_maritime,
  'maritime': VTS_maritime,
  'biological': bio,
  'enterprise portal': enp,
  'enterprise': enp,
  'environmental': esi,
  'integrated': iegms,
  'project database': pdb,
  'project': pdb,
  'petronas global': pgb,
  'global': pgb,
  
  // Default fallback
  'default': logoSirius,
  'sirius': logoSirius,
};

/**
 * Maps a microsite to its corresponding image based on title, ID, or icon field
 * @param microsite - The microsite object
 * @returns The image path or default image
 */
export const getMicrositeImage = (microsite: { id: string; title: string; icon?: string }): string => {
  // First, try to match by icon field if it exists and is not an emoji
  if (microsite.icon && !isEmoji(microsite.icon)) {
    const iconKey = normalizeKey(microsite.icon);
    if (IMAGE_MAP[iconKey]) {
      return IMAGE_MAP[iconKey];
    }
  }
  
  // Try to match by ID
  const idKey = normalizeKey(microsite.id);
  if (IMAGE_MAP[idKey]) {
    return IMAGE_MAP[idKey];
  }
  
  // Try to match by title
  const titleKey = normalizeKey(microsite.title);
  if (IMAGE_MAP[titleKey]) {
    return IMAGE_MAP[titleKey];
  }
  
  // Try partial matches in title for common keywords
  const titleLower = microsite.title.toLowerCase();
  for (const [key, image] of Object.entries(IMAGE_MAP)) {
    if (key !== 'default' && key !== 'sirius' && titleLower.includes(key)) {
      return image;
    }
  }
  
  // Return default image
  return IMAGE_MAP['default'];
};

/**
 * Normalizes a string key for mapping lookup
 * @param key - The key to normalize
 * @returns Normalized lowercase key with special characters removed
 */
const normalizeKey = (key: string): string => {
  return key.toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

/**
 * Checks if a string is an emoji
 * @param str - The string to check
 * @returns True if the string appears to be an emoji
 */
const isEmoji = (str: string): boolean => {
  // Simple emoji detection - check for common emoji patterns
  return /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(str);
};