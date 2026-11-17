import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { AnalyticsConsentProvider } from "@/components/analytics/AnalyticsConsentProvider";
import { PublicChatWidget } from "@/components/chat/PublicChatWidget";
import { getSiteNavigationView } from "@/lib/repositories/site-navigation-view";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { navigation, categories, products } = await getSiteNavigationView();

  return (
    <AnalyticsConsentProvider>
      <SiteHeader navigation={navigation} categories={categories} products={products} />
      {children}
      <SiteFooter navigation={navigation} />
      <PublicChatWidget />
    </AnalyticsConsentProvider>
  );
}
