import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ZYRON Heavy Industry",
  description: "How ZYRON Heavy Industry handles website data, optional analytics cookies, and privacy choices.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

const sections = [
  {
    title: "Information you provide",
    body: "When you send an inquiry, we use the contact and project information you provide to respond, prepare quotations, and support your machinery requirements. Please do not submit sensitive personal information that is not needed for your request.",
  },
  {
    title: "Optional website analytics",
    body: "We use Google Analytics 4 to understand page usage and improve our product information. Analytics loads only after you choose “Accept analytics”. We configure analytics not to intentionally send names, email addresses, phone numbers, inquiry messages, or other directly identifying form data. Marketing query parameters are filtered before page locations are sent.",
  },
  {
    title: "Cookies and your choice",
    body: "Your analytics choice is stored for up to 180 days. If accepted, Google Analytics may set cookies such as _ga. You can reject analytics without losing core website functions, or change your choice at any time with the “Cookie preferences” control in the site footer. Withdrawing consent disables further analytics collection and removes accessible Google Analytics cookies.",
  },
  {
    title: "Service providers and international processing",
    body: "Google acts as our analytics service provider and may process analytics data on infrastructure outside your country. Google describes its own handling and safeguards in its privacy documentation.",
  },
  {
    title: "Retention, security, and your rights",
    body: "We retain inquiry information only as long as reasonably needed for business, legal, and support purposes. We apply proportionate safeguards and limit administrative access. Depending on your location, you may ask about, correct, or request deletion of your personal information, subject to applicable legal obligations.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="bg-white px-5 py-20 text-neutral-900 sm:px-8 lg:py-28">
      <article className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ignition">Legal</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Privacy Policy</h1>
        <p className="mt-4 text-sm text-neutral-500">Last updated: November 16, 2026</p>
        <p className="mt-8 text-base leading-8 text-neutral-700">
          ZYRON Heavy Industry respects your privacy. This notice explains how we handle information submitted through zyroncnc.com and how our optional analytics operates.
        </p>
        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-semibold">{section.title}</h2>
              <p className="mt-3 leading-8 text-neutral-700">{section.body}</p>
            </section>
          ))}
          <section>
            <h2 className="text-2xl font-semibold">Google privacy information</h2>
            <p className="mt-3 leading-8 text-neutral-700">
              Read Google&apos;s <a className="font-semibold text-ignition underline underline-offset-4" href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">privacy policy</a> and information about <a className="font-semibold text-ignition underline underline-offset-4" href="https://business.safety.google/privacy/" target="_blank" rel="noreferrer">Google business data responsibility</a>.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold">Contact us</h2>
            <p className="mt-3 leading-8 text-neutral-700">
              For privacy questions or requests, email <a className="font-semibold text-ignition underline underline-offset-4" href="mailto:info@zyroncnc.com">info@zyroncnc.com</a>.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
