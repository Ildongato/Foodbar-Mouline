import { assetPath } from '@/lib/hosting';

export default function MillArtwork() {
  const artwork = `url("${assetPath('/home3/images/mouline-windmill-drawn.svg')}")`;
  return (
    <div className="mill-layer" aria-hidden="true">
      <span
        className="mill-artwork"
        style={{ maskImage: artwork, WebkitMaskImage: artwork }}
      />
    </div>
  );
}
