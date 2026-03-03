import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import Hero from "@/components/landing/Hero";
import About from "@/components/landing/About";
import RegistroForm from "@/components/landing/RegistroForm";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <RegistroForm />
      </main>
      <Footer />
    </>
  );
}
