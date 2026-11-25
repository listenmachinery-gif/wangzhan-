import { CompanyStructuredData } from "./CompanyStructuredData";
import { CompanyHero } from "./CompanyHero";
import { CompanyOverview } from "./CompanyOverview";
import { CompanySupportSections } from "./CompanySupportSections";
import { EngineeringQualitySections } from "./EngineeringQualitySections";
import { ProductSystem } from "./ProductSystem";

export function CompanyPage() {
  return (
    <main
      data-about-zyron-page
      className="overflow-x-hidden bg-white text-[#101214]"
    >
      <CompanyStructuredData />
      <CompanyHero />
      <CompanyOverview />
      <ProductSystem />
      <EngineeringQualitySections />
      <CompanySupportSections />
    </main>
  );
}
