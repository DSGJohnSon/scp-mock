import ContactSection from "@/components/sections/ContactSection";
import dynamic from "next/dynamic";
const DesirSection = dynamic(() => import("@/components/sections/DesirSection"), { ssr: false });
import FAQSection from "@/components/sections/FAQSection";
import HeroLanding from "@/components/sections/HeroLanding";
import InterestSection from "@/components/sections/InterestSection";
import PricingSection from "@/components/sections/PricingSection";
import TeamSection from "@/components/sections/TeamSection";
import TestimonySection from "@/components/sections/TestimonySection";

export async function generateMetadata() {
  return {
    title: `Serre Chevalier Parapente | Vols Inoubliables au Cœur des Alpes`,
    description: `Vivez l'aventure du parapente en toute sécurité. Apprenez à voler en autonomie avec nos moniteurs certifiés FFVL. 4 sites exceptionnels, matériel de qualité.`,
    alternates: {
      canonical: `https://www.serre-chevalier-parapente.fr/`,
    },
  };
}

export default function PublicHome() {
  return (
    <>
      <HeroLanding />
      <InterestSection />
      <DesirSection />
      <FAQSection />
      <PricingSection />
      <TeamSection title="L'équipe" centerTitle />
      <TestimonySection />
      <ContactSection />
    </>
  );
}
