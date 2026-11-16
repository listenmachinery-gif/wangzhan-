import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { AnalyticsConsentProvider } from "@/components/analytics/AnalyticsConsentProvider";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AnalyticsConsentProvider>
      <SiteHeader />
      {children}
      <SiteFooter />
    </AnalyticsConsentProvider>
  );
}
