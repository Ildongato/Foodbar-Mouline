import MoulineHome3 from '@/components/home3/mouline';
import './home3.css';
export default function Home3() {
  return (
    <>
      <link
        rel="preload"
        as="font"
        href="/fonts/instrument-serif-regular.woff2"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        as="image"
        href="/images/header-salade-b3624dd6-1280.webp"
        imageSrcSet="/images/header-salade-b3624dd6-640.webp 640w, /images/header-salade-b3624dd6-1280.webp 1280w"
        imageSizes="100vw"
      />
      <MoulineHome3 />
    </>
  );
}
