import type { ProjectId } from '@/engine/types'

export const PROJECTS: Record<ProjectId, { name: string; description: string }> = {
  'carlisle-bay': {
    name: 'YOTEL + YOTELPAD Carlisle Bay',
    description: '130 keys | Bridgetown | YOTEL city + YOTELPAD extended-stay',
  },
  'abbeville': {
    name: 'YOTELPAD Abbeville',
    description: '60 units | Worthing | 4 towers | YOTELPAD resort',
  },
  'mt-brevitor': {
    name: 'Mt Brevitor Estates',
    description: 'Mixed-use | Sports · Farming · Residential · Community | Small YOTEL TBC',
  },
}
