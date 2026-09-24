/** Home3 gallery pool. Crop positions belong to the photo, not to a random slot. */
export type GalleryPhoto = {
  id: string;
  alt: string;
  width: number;
  height: number;
  position: string;
};

export const galleryPhotos = [
  {
    id: 'koffie-detail',
    alt: 'Een kop koffie met een klein rood hartje ernaast',
    width: 1440,
    height: 1800,
    position: '50% 25%',
  },
  {
    id: 'smeersalades',
    alt: 'Boterhammen met huisgemaakte smeersalade op een bord',
    width: 1440,
    height: 1800,
    position: '50% 50%',
  },
  {
    id: 'quinoasalade',
    alt: 'Quinoasalade met tomaatjes in een groen bord',
    width: 1440,
    height: 1641,
    position: '50% 50%',
  },
  {
    id: 'broodje-bereiden',
    alt: 'Een vers broodje wordt belegd aan de gekoelde toonbank',
    width: 1440,
    height: 1800,
    position: '50% 45%',
  },
  {
    id: 'ontbijttafel',
    alt: 'Ontbijttafel met koffiekoeken, beleg en roze bloemen',
    width: 1440,
    height: 1800,
    position: '50% 50%',
  },
  {
    id: 'zalmsalade',
    alt: 'Salade met zalm, ei en verse groenten op een wit bord',
    width: 1365,
    height: 1365,
    position: '50% 50%',
  },
  {
    id: 'geitenkaassalade',
    alt: 'Geitenkaas met vijgen, spek en frisse salade',
    width: 1365,
    height: 1365,
    position: '50% 48%',
  },
  {
    id: 'pannenkoek-fruit',
    alt: 'Pannenkoek met aardbeien, banaan en ander vers fruit',
    width: 1080,
    height: 1081,
    position: '50% 50%',
  },
  {
    id: 'quiche',
    alt: 'Huisgemaakte quiche met groenten op een bord',
    width: 1440,
    height: 1440,
    position: '50% 50%',
  },
  {
    id: 'verse-groenten',
    alt: 'Kleurrijke verse groenten klaargezet voor de keuken',
    width: 1440,
    height: 1440,
    position: '50% 50%',
  },
  {
    id: 'taart',
    alt: 'Versgebakken taart met amandelen en poedersuiker',
    width: 1440,
    height: 1753,
    position: '50% 45%',
  },
  {
    id: 'interieur',
    alt: 'Het lichte interieur van Mouline met tafels en een lange zitbank',
    width: 1440,
    height: 1920,
    position: '50% 63%',
  },
  {
    id: 'panini',
    alt: 'Gegrilde panini met een kleurrijke salade op een grijs bord',
    width: 1440,
    height: 1800,
    position: '50% 48%',
  },
  {
    id: 'bloemen',
    alt: 'Droogbloemen in een amberkleurige vaas in de foodbar',
    width: 1536,
    height: 1536,
    position: '50% 38%',
  },
  {
    id: 'caroline-aan-het-werk',
    alt: 'Caroline bereidt een vers broodje achter de toog',
    width: 1505,
    height: 1505,
    position: '50% 40%',
  },
] as const satisfies readonly GalleryPhoto[];

type PhotoId = (typeof galleryPhotos)[number]['id'];
export type GallerySet = {
  id: string;
  photos: readonly [PhotoId, PhotoId, PhotoId, PhotoId, PhotoId, PhotoId];
};

// Fixed slot roles: lead dish, interior, detail, food, daily life, hospitality.
// The last image also works as a wide closing photograph on mobile.
export const gallerySets = [
  {
    id: 'aan-tafel',
    photos: [
      'zalmsalade',
      'interieur',
      'bloemen',
      'smeersalades',
      'ontbijttafel',
      'caroline-aan-het-werk',
    ],
  },
  {
    id: 'lunch',
    photos: [
      'geitenkaassalade',
      'interieur',
      'koffie-detail',
      'taart',
      'broodje-bereiden',
      'caroline-aan-het-werk',
    ],
  },
  {
    id: 'uit-de-keuken',
    photos: [
      'panini',
      'interieur',
      'verse-groenten',
      'pannenkoek-fruit',
      'quiche',
      'broodje-bereiden',
    ],
  },
  {
    id: 'koffietijd',
    photos: [
      'quinoasalade',
      'interieur',
      'bloemen',
      'pannenkoek-fruit',
      'ontbijttafel',
      'caroline-aan-het-werk',
    ],
  },
] as const satisfies readonly GallerySet[];

const sessionKey = 'mouline.home3.gallery.v1';
type SessionStore = Pick<Storage, 'getItem' | 'setItem'>;

/** Called once after hydration; sessionStorage also preserves the set on reload. */
export function selectGallerySet(
  storage?: SessionStore,
  random: () => number = Math.random,
): GallerySet {
  try {
    const saved = storage?.getItem(sessionKey);
    const selection = gallerySets.find((set) => set.id === saved);
    if (selection) return selection;
  } catch {
    // Storage can be disabled. The component keeps its selection in memory.
  }

  const selection =
    gallerySets[Math.floor(random() * gallerySets.length)] ?? gallerySets[0];
  try {
    storage?.setItem(sessionKey, selection.id);
  } catch {
    // No persistence is required for the gallery to remain usable.
  }
  return selection;
}

export function galleryPhotoPath(
  photo: GalleryPhoto,
  size: 640 | 1280 | 'full',
) {
  return `/home3/gallery/${photo.id}-${size}.webp`;
}
