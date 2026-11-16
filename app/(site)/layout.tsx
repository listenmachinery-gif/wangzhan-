import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { AnalyticsConsentProvider } from "@/components/analytics/AnalyticsConsentProvider";
import { PublicChatWidget } from "@/components/chat/PublicChatWidget";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AnalyticsConsentProvider>
      <SiteHeader />
      {children}
      <SiteFooter />
      <PublicChatWidget />
    </AnalyticsConsentProvider>
  );
}
