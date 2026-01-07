/**
 * Seed Project Type Fields
 *
 * Populates the projectTypeFields table with initial field definitions.
 * Run this mutation once to set up the dynamic fields.
 */


import { v } from 'convex/values'
import { mutation } from '../../_generated/server'

// Field definition type for seeding
interface FieldSeed {
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'checkbox' | 'textarea'
  required: boolean
  placeholder?: string
  description?: string
  options?: { value: string; label: string }[]
  min?: number
  max?: number
}

// Field definitions by project type name
const PROJECT_TYPE_FIELD_SEEDS: Record<string, FieldSeed[]> = {
  'Wedding Album': [
    { name: 'albumCount', label: 'Number of Albums', type: 'number', required: true, min: 1, max: 20 },
    { name: 'sheetsPerAlbum', label: 'Sheets per Album', type: 'number', required: true, min: 10, max: 100 },
    {
      name: 'size',
      label: 'Album Size',
      type: 'select',
      required: true,
      options: [
        { value: '8x8', label: '8x8 (Small)' },
        { value: '10x10', label: '10x10 (Medium)' },
        { value: '12x12', label: '12x12 (Standard)' },
        { value: '12x18', label: '12x18 (Large)' },
        { value: '16x24', label: '16x24 (Extra Large)' },
      ],
    },
    {
      name: 'coverType',
      label: 'Cover Type',
      type: 'select',
      required: false,
      options: [
        { value: 'hardcover', label: 'Hardcover' },
        { value: 'softcover', label: 'Softcover' },
        { value: 'leather', label: 'Premium Leather' },
        { value: 'fabric', label: 'Premium Fabric' },
      ],
    },
    { name: 'includeParentAlbums', label: 'Include Smaller Parent Albums?', type: 'checkbox', required: false },
  ],

  'Pre-Wedding Album': [
    { name: 'albumCount', label: 'Number of Albums', type: 'number', required: true, min: 1, max: 10 },
    { name: 'sheetsPerAlbum', label: 'Sheets per Album', type: 'number', required: true, min: 10, max: 100 },
    {
      name: 'size',
      label: 'Album Size',
      type: 'select',
      required: true,
      options: [
        { value: '8x8', label: '8x8 (Small)' },
        { value: '10x10', label: '10x10 (Medium)' },
        { value: '12x12', label: '12x12 (Standard)' },
      ],
    },
    { name: 'themePreference', label: 'Theme Preference', type: 'text', required: false, placeholder: 'e.g., Vintage, Modern, Romantic' },
    { name: 'includeEngagement', label: 'Include Engagement Photos?', type: 'checkbox', required: false },
  ],

  'Birthday Album': [
    { name: 'albumCount', label: 'Number of Albums', type: 'number', required: true, min: 1, max: 10 },
    { name: 'sheetsPerAlbum', label: 'Sheets per Album', type: 'number', required: true, min: 10, max: 50 },
    {
      name: 'size',
      label: 'Album Size',
      type: 'select',
      required: true,
      options: [
        { value: '8x8', label: '8x8 (Small)' },
        { value: '10x10', label: '10x10 (Medium)' },
        { value: '12x12', label: '12x12 (Standard)' },
      ],
    },
    { name: 'theme', label: 'Party Theme', type: 'text', required: false, placeholder: 'e.g., Princess, Superhero, Jungle' },
    { name: 'ageOrMilestone', label: 'Age or Milestone', type: 'text', required: false, placeholder: 'e.g., 1st Birthday, Sweet 16' },
    { name: 'includeGuestPhotos', label: 'Include Guest Photos Section?', type: 'checkbox', required: false },
  ],

  'Wedding Photography Edit': [
    { name: 'estimatedPhotoCount', label: 'Estimated Photo Count', type: 'number', required: true, min: 100 },
    { name: 'numberOfLocations', label: 'Number of Locations', type: 'number', required: false, min: 1 },
    {
      name: 'editingStyle',
      label: 'Editing Style Preference',
      type: 'select',
      required: false,
      options: [
        { value: 'natural', label: 'Natural & Light' },
        { value: 'cinematic', label: 'Cinematic & Moody' },
        { value: 'vibrant', label: 'Vibrant & Colorful' },
        { value: 'classic', label: 'Classic & Timeless' },
        { value: 'custom', label: 'Custom (describe in notes)' },
      ],
    },
    {
      name: 'candidRatio',
      label: 'Candid vs Posed Preference',
      type: 'select',
      required: false,
      options: [
        { value: 'mostly-candid', label: 'Mostly Candid (80/20)' },
        { value: 'balanced', label: 'Balanced (50/50)' },
        { value: 'mostly-posed', label: 'Mostly Posed (20/80)' },
      ],
    },
  ],

  'Wedding Film': [
    { name: 'durationMinutes', label: 'Target Duration (minutes)', type: 'number', required: true, min: 5 },
    { name: 'rawFootageSizeGB', label: 'Raw Footage Size (GB)', type: 'number', required: false },
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
    { name: 'highlightsNeeded', label: 'Highlights Video Needed?', type: 'checkbox', required: false },
    { name: 'includeDroneFootage', label: 'Include Drone Footage?', type: 'checkbox', required: false },
  ],

  'YouTube Video': [
    { name: 'targetDuration', label: 'Target Duration (minutes)', type: 'number', required: true, min: 1 },
    { name: 'thumbnailNeeded', label: 'Custom Thumbnail Needed?', type: 'checkbox', required: false },
    { name: 'bRollAvailable', label: 'B-Roll Footage Available?', type: 'checkbox', required: false },
    {
      name: 'musicSource',
      label: 'Music Source',
      type: 'select',
      required: false,
      options: [
        { value: 'royalty-free', label: 'Royalty-Free (we provide)' },
        { value: 'client-provided', label: 'Client Provided' },
        { value: 'none', label: 'No Music Needed' },
      ],
    },
    { name: 'captionsNeeded', label: 'Captions/Subtitles Needed?', type: 'checkbox', required: false },
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
      required: false,
      options: [
        { value: 'instagram', label: 'Instagram Reels' },
        { value: 'tiktok', label: 'TikTok' },
        { value: 'both', label: 'Both (optimized for each)' },
      ],
    },
    { name: 'musicPreference', label: 'Music Style Preference', type: 'text', required: false, placeholder: 'e.g., Upbeat, Romantic, Trending' },
    { name: 'trendingAudio', label: 'Use Trending Audio?', type: 'checkbox', required: false },
  ],

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
      ],
    },
    { name: 'numberOfDays', label: 'Number of Days', type: 'number', required: true, min: 1 },
    {
      name: 'expectedDeliverables',
      label: 'Expected Deliverables',
      type: 'select',
      required: false,
      options: [
        { value: 'photos-only', label: 'Photos Only' },
        { value: 'video-only', label: 'Video Only' },
        { value: 'photos-video', label: 'Photos + Video' },
        { value: 'photos-video-album', label: 'Photos + Video + Album' },
      ],
    },
    { name: 'corporateBranding', label: 'Include Corporate Branding?', type: 'checkbox', required: false },
  ],
}

/**
 * Seed project type fields
 * This will add field definitions for all project types
 */
export const seedProjectTypeFields = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    totalFieldsCreated: v.number(),
  }),
  handler: async (ctx) => {
    // Get all project types
    const projectTypes = await ctx.db.query('projectTypes').collect()

    if (projectTypes.length === 0) {
      return {
        success: false,
        message: 'No project types found. Please seed project types first.',
        totalFieldsCreated: 0,
      }
    }

    let totalFieldsCreated = 0

    for (const projectType of projectTypes) {
      const seedFields = PROJECT_TYPE_FIELD_SEEDS[projectType.name]
      if (!seedFields) continue

      // Check if fields already exist for this project type
      const existingFields = await ctx.db
        .query('projectTypeFields')
        .withIndex('by_projectTypeId', (q) => q.eq('projectTypeId', projectType._id))
        .collect()

      if (existingFields.length > 0) {
        console.log(`Fields already exist for ${projectType.name}, skipping...`)
        continue
      }

      // Create fields for this project type
      for (let i = 0; i < seedFields.length; i++) {
        const field = seedFields[i]
        await ctx.db.insert('projectTypeFields', {
          projectTypeId: projectType._id,
          name: field.name,
          label: field.label,
          type: field.type,
          required: field.required,
          placeholder: field.placeholder,
          description: field.description,
          options: field.options ? JSON.stringify(field.options) : undefined,
          min: field.min,
          max: field.max,
          displayOrder: i + 1,
          isActive: true,
        })
        totalFieldsCreated++
      }

      console.log(`Created ${seedFields.length} fields for ${projectType.name}`)
    }

    return {
      success: true,
      message: `Successfully seeded ${totalFieldsCreated} project type fields`,
      totalFieldsCreated,
    }
  },
})
