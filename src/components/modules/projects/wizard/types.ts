/**
 * Project Wizard Types
 * 
 * Type definitions for the 5-step project request wizard.
 * Supports project-type-specific fields based on category.
 */

import type { Id } from '@convex/_generated/dataModel'

// ============================================================================
// Step Definitions
// ============================================================================

export const WIZARD_STEPS = [
  { id: 1, title: 'Project Type', description: 'Select project type and basic info' },
  { id: 2, title: 'Details', description: 'Project-specific details' },
  { id: 3, title: 'Files', description: 'Upload reference files' },
  { id: 4, title: 'Description', description: 'Add description and notes' },
  { id: 5, title: 'Review', description: 'Review and submit' },
] as const

export type WizardStepId = (typeof WIZARD_STEPS)[number]['id']

// ============================================================================
// Project Type Categories
// ============================================================================

/** Categories for grouping project types */
export type ProjectCategory = 
  | 'wedding'      // Wedding events (wedding, pre-wedding, engagement)
  | 'celebration'  // Birthday, anniversary, babyshower
  | 'corporate'    // Corporate events, conferences
  | 'social_media' // YouTube, Instagram reels, TikTok
  | 'other'        // General projects

/** Maps project type names to their categories */
export const PROJECT_TYPE_CATEGORIES: Record<string, ProjectCategory> = {
  'Wedding Album': 'wedding',
  'Wedding Photography Edit': 'wedding',
  'Wedding Film': 'wedding',
  'Pre-Wedding Album': 'wedding',
  'Engagement Shoot Edit': 'wedding',
  
  'Birthday Album': 'celebration',
  'Birthday Photography Edit': 'celebration',
  'Birthday Video': 'celebration',
  'Anniversary Album': 'celebration',
  'Baby Shower Album': 'celebration',
  
  'Corporate Event': 'corporate',
  'Conference Video': 'corporate',
  'Product Photography': 'corporate',
  
  'YouTube Video': 'social_media',
  'Instagram Reel': 'social_media',
  'TikTok Video': 'social_media',
}

/** Get category for a project type, defaults to 'other' */
export function getProjectCategory(projectTypeName: string): ProjectCategory {
  return PROJECT_TYPE_CATEGORIES[projectTypeName] ?? 'other'
}

// ============================================================================
// Project Type Definition
// ============================================================================

/** Project type from the database */
export interface ProjectType {
  _id: Id<'projectTypes'>
  name: string
  slug: string
  description?: string
  icon?: string
  hasCustomFields: boolean
  isActive: boolean
  sortOrder?: number
}

// ============================================================================
// Form Data Types
// ============================================================================

/** Step 1: Basic Info */
export interface Step1Data {
  projectTypeId: Id<'projectTypes'> | null
  endClientName: string
  eventName: string
  eventDate: number | null
  venue: string
}

import { type FieldValue } from '@/components/shared/dynamic-form-fields'

/** Step 2: Type-Specific Details (dynamic based on project type) */
export interface Step2Data {
  typeSpecificDetails: Record<string, FieldValue>
}

/** Step 3: Reference Files */
export interface ReferenceFile {
  fileId: string
  fileName: string
  fileSize: number
  fileType: string
  storageKey?: string
  previewUrl?: string
}

export interface Step3Data {
  referenceFiles: ReferenceFile[]
}

/** Step 4: Description & Notes */
export interface Step4Data {
  description?: string
  additionalNotes?: string
  preferredDeliveryDate: number | null
}

/** Combined wizard form data */
export interface WizardFormData {
  step1: Step1Data
  step2: Step2Data
  step3: Step3Data
  step4: Step4Data
}

/** Initial empty form state */
export const INITIAL_FORM_DATA: WizardFormData = {
  step1: {
    projectTypeId: null,
    endClientName: '',
    eventName: '',
    eventDate: null,
    venue: '',
  },
  step2: {
    typeSpecificDetails: {},
  },
  step3: {
    referenceFiles: [],
  },
  step4: {
    description: '',
    additionalNotes: '',
    preferredDeliveryDate: null,
  },
}

// ============================================================================
// Project Type Field Definitions
// ============================================================================

export type FieldType = 
  | 'text' 
  | 'number' 
  | 'select' 
  | 'checkbox'
  | 'album-config'  // Special type for album configuration with dynamic sheets
  | 'media-requirements'  // Special type for photo/video count requirements

export interface FieldDefinition {
  name: string
  label: string
  type: FieldType
  required?: boolean
  options?: { value: string; label: string }[]
  placeholder?: string
  description?: string
  min?: number
  max?: number
}

/**
 * Common field sets that can be reused across project types
 */
export const COMMON_FIELDS = {
  // Album configuration (shared by album projects)
  albumConfig: [
    { 
      name: 'albumCount', 
      label: 'Number of Albums', 
      type: 'number' as const, 
      required: true,
      min: 1,
      max: 20,
      description: 'How many albums do you need?'
    },
    { 
      name: 'sheetsPerAlbum', 
      label: 'Sheets per Album', 
      type: 'album-config' as const, 
      required: true,
      description: 'Number of sheets/pages for each album'
    },
    {
      name: 'size',
      label: 'Album Size',
      type: 'select' as const,
      required: true,
      options: [
        { value: '8x8', label: '8x8 (Small)' },
        { value: '10x10', label: '10x10 (Medium)' },
        { value: '12x12', label: '12x12 (Standard)' },
        { value: '12x18', label: '12x18 (Large)' },
        { value: '16x24', label: '16x24 (Extra Large)' },
      ],
    },
  ],
  
  // Photo editing configuration
  photoEdit: [
    { 
      name: 'estimatedPhotoCount', 
      label: 'Estimated Photo Count', 
      type: 'number' as const, 
      required: true,
      description: 'Approximate number of photos to edit'
    },
    { 
      name: 'numberOfLocations', 
      label: 'Number of Locations', 
      type: 'number' as const,
      description: 'How many different locations in the shoot?'
    },
    {
      name: 'editingStyle',
      label: 'Editing Style Preference',
      type: 'select' as const,
      options: [
        { value: 'natural', label: 'Natural & Light' },
        { value: 'cinematic', label: 'Cinematic & Moody' },
        { value: 'vibrant', label: 'Vibrant & Colorful' },
        { value: 'classic', label: 'Classic & Timeless' },
        { value: 'custom', label: 'Custom (describe in notes)' },
      ],
    },
  ],
  
  // Video editing configuration
  videoEdit: [
    { 
      name: 'durationMinutes', 
      label: 'Target Duration (minutes)', 
      type: 'number' as const, 
      required: true,
      min: 1,
      description: 'Desired length of final video'
    },
    { 
      name: 'rawFootageSizeGB', 
      label: 'Raw Footage Size (GB)', 
      type: 'number' as const,
      description: 'Approximate size of raw footage'
    },
    { 
      name: 'highlightsNeeded', 
      label: 'Highlights Video Needed?', 
      type: 'checkbox' as const,
      description: 'Short highlight reel in addition to main video'
    },
  ],
}

/** Dynamic fields per project type category */
export const PROJECT_TYPE_FIELDS: Record<string, FieldDefinition[]> = {
  // ==========================================================================
  // WEDDING PROJECTS
  // ==========================================================================
  'Wedding Album': [
    ...COMMON_FIELDS.albumConfig,
    {
      name: 'coverType',
      label: 'Cover Type',
      type: 'select',
      options: [
        { value: 'hardcover', label: 'Hardcover' },
        { value: 'softcover', label: 'Softcover' },
        { value: 'leather', label: 'Premium Leather' },
        { value: 'fabric', label: 'Premium Fabric' },
      ],
    },
    { 
      name: 'includeParentAlbums', 
      label: 'Include Smaller Parent Albums?', 
      type: 'checkbox',
      description: 'Smaller albums for parents/family'
    },
  ],
  
  'Pre-Wedding Album': [
    ...COMMON_FIELDS.albumConfig,
    { 
      name: 'themePreference', 
      label: 'Theme Preference', 
      type: 'text',
      placeholder: 'e.g., Vintage, Modern, Romantic'
    },
    { 
      name: 'includeEngagement', 
      label: 'Include Engagement Photos?', 
      type: 'checkbox' 
    },
  ],
  
  'Wedding Photography Edit': [
    ...COMMON_FIELDS.photoEdit,
    {
      name: 'candidRatio',
      label: 'Candid vs Posed Preference',
      type: 'select',
      options: [
        { value: 'mostly-candid', label: 'Mostly Candid (80/20)' },
        { value: 'balanced', label: 'Balanced (50/50)' },
        { value: 'mostly-posed', label: 'Mostly Posed (20/80)' },
      ],
    },
    { 
      name: 'ceremonyVsReception', 
      label: 'Focus more on ceremony or reception?', 
      type: 'select',
      options: [
        { value: 'ceremony', label: 'More Ceremony' },
        { value: 'balanced', label: 'Balanced' },
        { value: 'reception', label: 'More Reception' },
      ],
    },
  ],
  
  'Wedding Film': [
    ...COMMON_FIELDS.videoEdit,
    {
      name: 'style',
      label: 'Film Style',
      type: 'select',
      required: true,
      options: [
        { value: 'documentary', label: 'Documentary' },
        { value: 'cinematic', label: 'Cinematic' },
        { value: 'traditional', label: 'Traditional' },
        { value: 'storytelling', label: 'Storytelling' },
      ],
    },
    { 
      name: 'includeDroneFootage', 
      label: 'Include Drone Footage?', 
      type: 'checkbox' 
    },
  ],

  // ==========================================================================
  // CELEBRATION PROJECTS
  // ==========================================================================
  'Birthday Album': [
    ...COMMON_FIELDS.albumConfig,
    { 
      name: 'theme', 
      label: 'Party Theme', 
      type: 'text',
      placeholder: 'e.g., Princess, Superhero, Jungle'
    },
    { 
      name: 'ageOrMilestone', 
      label: 'Age or Milestone', 
      type: 'text',
      placeholder: 'e.g., 1st Birthday, Sweet 16, 50th'
    },
    { 
      name: 'includeGuestPhotos', 
      label: 'Include Guest Photos Section?', 
      type: 'checkbox' 
    },
  ],
  
  'Birthday Photography Edit': [
    ...COMMON_FIELDS.photoEdit,
    { 
      name: 'theme', 
      label: 'Party Theme', 
      type: 'text' 
    },
    { 
      name: 'includeDecorShots', 
      label: 'Include Decor & Setup Shots?', 
      type: 'checkbox' 
    },
  ],

  // ==========================================================================
  // SOCIAL MEDIA PROJECTS
  // ==========================================================================
  'YouTube Video': [
    { 
      name: 'targetDuration', 
      label: 'Target Duration (minutes)', 
      type: 'number', 
      required: true,
      min: 1
    },
    { 
      name: 'thumbnailNeeded', 
      label: 'Custom Thumbnail Needed?', 
      type: 'checkbox' 
    },
    { 
      name: 'bRollAvailable', 
      label: 'B-Roll Footage Available?', 
      type: 'checkbox' 
    },
    { 
      name: 'musicSource', 
      label: 'Music Source', 
      type: 'select',
      options: [
        { value: 'royalty-free', label: 'Royalty-Free (we provide)' },
        { value: 'client-provided', label: 'Client Provided' },
        { value: 'none', label: 'No Music Needed' },
      ]
    },
    {
      name: 'captionsNeeded',
      label: 'Captions/Subtitles Needed?',
      type: 'checkbox',
    },
  ],
  
  'Instagram Reel': [
    {
      name: 'duration',
      label: 'Duration',
      type: 'select',
      required: true,
      options: [
        { value: '15', label: '15 seconds' },
        { value: '30', label: '30 seconds' },
        { value: '60', label: '60 seconds' },
        { value: '90', label: '90 seconds' },
      ],
    },
    {
      name: 'platform',
      label: 'Primary Platform',
      type: 'select',
      options: [
        { value: 'instagram', label: 'Instagram Reels' },
        { value: 'tiktok', label: 'TikTok' },
        { value: 'both', label: 'Both (optimized for each)' },
      ],
    },
    { 
      name: 'musicPreference', 
      label: 'Music Style Preference', 
      type: 'text',
      placeholder: 'e.g., Upbeat, Romantic, Trending'
    },
    { 
      name: 'trendingAudio', 
      label: 'Use Trending Audio?', 
      type: 'checkbox' 
    },
  ],

  // ==========================================================================
  // CORPORATE PROJECTS
  // ==========================================================================
  'Corporate Event': [
    { 
      name: 'eventType', 
      label: 'Event Type', 
      type: 'select', 
      required: true,
      options: [
        { value: 'conference', label: 'Conference' },
        { value: 'seminar', label: 'Seminar/Workshop' },
        { value: 'product-launch', label: 'Product Launch' },
        { value: 'team-building', label: 'Team Building' },
        { value: 'annual-meeting', label: 'Annual Meeting' },
        { value: 'other', label: 'Other' },
      ]
    },
    { 
      name: 'numberOfDays', 
      label: 'Number of Days', 
      type: 'number', 
      required: true,
      min: 1
    },
    { 
      name: 'expectedDeliverables', 
      label: 'Expected Deliverables', 
      type: 'select',
      options: [
        { value: 'photos-only', label: 'Photos Only' },
        { value: 'video-only', label: 'Video Only' },
        { value: 'photos-video', label: 'Photos + Video' },
        { value: 'photos-video-album', label: 'Photos + Video + Album' },
      ]
    },
    { 
      name: 'corporateBranding', 
      label: 'Include Corporate Branding?', 
      type: 'checkbox',
      description: 'Add company logo/colors to deliverables'
    },
  ],
}

/** Get fields for a project type, with fallback to empty array */
export function getFieldsForProjectType(projectTypeName: string): FieldDefinition[] {
  return PROJECT_TYPE_FIELDS[projectTypeName] ?? []
}

/** Get default values for a project type's fields */
export function getDefaultValuesForProjectType(projectTypeName: string): Record<string, unknown> {
  const fields = getFieldsForProjectType(projectTypeName)
  const defaults: Record<string, unknown> = {}
  
  for (const field of fields) {
    switch (field.type) {
      case 'checkbox':
        defaults[field.name] = false
        break
      case 'number':
        defaults[field.name] = null
        break
      case 'album-config':
        defaults[field.name] = []
        break
      default:
        defaults[field.name] = ''
    }
  }
  
  return defaults
}
