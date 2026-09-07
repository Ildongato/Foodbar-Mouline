import Mouline from '@/components/mouline';
import './globals.css';
export default function Home() {
  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/images/ontbijt-1280.webp"
        imageSrcSet="/images/ontbijt-640.webp 640w, /images/ontbijt-1280.webp 1280w"
        imageSizes="(max-width: 800px) 100vw, 75vw"
      />
      <Mouline />
    </>
  );
}
