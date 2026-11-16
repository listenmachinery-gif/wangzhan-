import { InquiryListPage, type InquiryListSearchParams } from "@/components/admin/crm/InquiryListPage";

export const dynamic = "force-dynamic";

export default function AdminLeadsPage({ searchParams }: { searchParams: InquiryListSearchParams }) {
  return InquiryListPage({ path: "/admin/leads", searchParams });
}
