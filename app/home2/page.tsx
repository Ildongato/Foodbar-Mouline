import MoulineHome2 from '@/components/home2/mouline';
import './home2.css';
export default function Home2() {
  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/images/interieur-1600.webp"
        imageSrcSet="/images/interieur-800.webp 800w, /images/interieur-1600.webp 1600w"
        imageSizes="100vw"
      />
      <MoulineHome2 />
    </>
  );
}
