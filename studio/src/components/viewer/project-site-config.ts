import type { Point2D, ProjectId } from '@/engine/types'

import {
  ORIGINAL_BOUNDARY as CB_ORIGINAL,
  OFFSET_BOUNDARY as CB_OFFSET,
  SITE as CB_SITE,
} from '@/config/site'

import {
  ORIGINAL_BOUNDARY as AB_ORIGINAL,
  OFFSET_BOUNDARY as AB_OFFSET,
  SITE as AB_SITE,
} from '@/config/abbeville/site'

import {
  ORIGINAL_BOUNDARY as MB_ORIGINAL,
  OFFSET_BOUNDARY as MB_OFFSET,
  SITE as MB_SITE,
} from '@/config/mt-brevitor/site'

/** Viewer-relevant subset of site configuration for 3D scene setup. */
export interface ViewerSiteConfig {
  originalBoundary: Point2D[]
  offsetBoundary: Point2D[]
  grossArea: number
  buildableArea: number
  maxCoverage: number
  maxHeight: number
  buildableMinX: number
  buildableMaxX: number
  buildableMinY: number
  buildableMaxY: number
  buildableEW: number
  buildableNS: number
  centroidX: number
  centroidY: number
  beachSide: string
}

/** Resolve the correct site boundaries, centroids, and camera-relevant metrics
 *  for the given project. Defaults to Carlisle Bay when no project is specified. */
export function getViewerSiteConfig(projectId?: ProjectId): ViewerSiteConfig {
  switch (projectId) {
    case 'abbeville':
      return {
        originalBoundary: AB_ORIGINAL,
        offsetBoundary: AB_OFFSET,
        grossArea: AB_SITE.grossArea,
        buildableArea: AB_SITE.buildableArea,
        maxCoverage: AB_SITE.maxCoverage,
        maxHeight: AB_SITE.maxHeight,
        buildableMinX: AB_SITE.buildableMinX,
        buildableMaxX: AB_SITE.buildableMaxX,
        buildableMinY: AB_SITE.buildableMinY,
        buildableMaxY: AB_SITE.buildableMaxY,
        buildableEW: AB_SITE.buildableEW,
        buildableNS: AB_SITE.buildableNS,
        centroidX: AB_SITE.centroidX,
        centroidY: AB_SITE.centroidY,
        beachSide: AB_SITE.beachSide,
      }

    case 'mt-brevitor':
      return {
        originalBoundary: MB_ORIGINAL,
        offsetBoundary: MB_OFFSET,
        grossArea: MB_SITE.grossArea,
        buildableArea: MB_SITE.buildableArea,
        maxCoverage: MB_SITE.maxCoverage,
        maxHeight: MB_SITE.maxHeight,
        buildableMinX: MB_SITE.buildableMinX,
        buildableMaxX: MB_SITE.buildableMaxX,
        buildableMinY: MB_SITE.buildableMinY,
        buildableMaxY: MB_SITE.buildableMaxY,
        buildableEW: MB_SITE.buildableEW,
        buildableNS: MB_SITE.buildableNS,
        centroidX: MB_SITE.centroidX,
        centroidY: MB_SITE.centroidY,
        beachSide: MB_SITE.beachSide,
      }

    case 'carlisle-bay':
    default:
      return {
        originalBoundary: CB_ORIGINAL,
        offsetBoundary: CB_OFFSET,
        grossArea: CB_SITE.grossArea,
        buildableArea: CB_SITE.buildableArea,
        maxCoverage: CB_SITE.maxCoverage,
        maxHeight: CB_SITE.maxHeight,
        buildableMinX: CB_SITE.buildableMinX,
        buildableMaxX: CB_SITE.buildableMaxX,
        buildableMinY: CB_SITE.buildableMinY,
        buildableMaxY: CB_SITE.buildableMaxY,
        buildableEW: CB_SITE.buildableEW,
        buildableNS: CB_SITE.buildableNS,
        centroidX: CB_SITE.centroidX,
        centroidY: CB_SITE.centroidY,
        beachSide: CB_SITE.beachSide,
      }
  }
}
