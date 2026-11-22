export interface GalleryItem {
  id: string
  title: string
  caption: string
  /** Two CSS colours for the panel gradient. */
  from: string
  to: string
}

/** Sample content for a made-up studio. Swap for real projects, products or menu items. */
export const SAMPLE_ITEMS: readonly GalleryItem[] = [
  { id: 'bakery', title: 'Corner Bakery', caption: 'Online ordering site', from: '#f2a20c', to: '#b5432a' },
  { id: 'clinic', title: 'Pine Dental', caption: 'Booking and reminders', from: '#5f9fd1', to: '#1d3a5c' },
  { id: 'garage', title: 'Ridge Auto', caption: 'Service price estimator', from: '#d9788f', to: '#5b2f55' },
  { id: 'florist', title: 'Wild Stem', caption: 'Seasonal product gallery', from: '#8fc98a', to: '#2f5b3f' },
  { id: 'gym', title: 'Iron Yard', caption: 'Class schedule and sign-up', from: '#ff7a3d', to: '#401c14' },
  { id: 'cafe', title: 'Lantern Cafe', caption: 'Menu and event pages', from: '#e6c27a', to: '#6b3f1f' },
  { id: 'studio', title: 'North Ceramics', caption: 'Shop with 3D previews', from: '#b9a7e6', to: '#2f2a5b' },
  { id: 'farm', title: 'Hollow Farm', caption: 'CSA subscriptions', from: '#c8d96a', to: '#4a5b1f' },
]
