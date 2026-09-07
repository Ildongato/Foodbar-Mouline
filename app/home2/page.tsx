import MoulineHome2 from '@/components/home2/mouline';
import './home2.css';
export default function Home2() {
  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/images/header-salade-b3624dd6-1280.webp"
        imageSrcSet="/images/header-salade-b3624dd6-640.webp 640w, /images/header-salade-b3624dd6-1280.webp 1280w"
        imageSizes="100vw"
      />
      <MoulineHome2 />
    </>
  );
}
