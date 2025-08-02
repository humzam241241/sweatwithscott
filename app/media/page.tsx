import Navbar from "@/components/Navbar";
import MediaGallery from "@/components/MediaGallery";
import Footer from "@/components/footer";

export default function MediaPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24">
        <MediaGallery />
      </main>
      <Footer />
    </>
  );
}
