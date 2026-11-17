import Link from "next/link";
import { CustomerForm } from "@/components/admin/crm/CustomerForm";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { TableShell } from "@/components/admin/ui/TableShell";
import { inquiryLegacyStatusLabels } from "@/components/admin/crm/inquiry-options";
import type { CustomerDetail as CustomerValue } from "@/lib/services/customer-service";
import { formatCountryName } from "@/lib/admin/localization";

export function CustomerDetail({ customer }: { customer: CustomerValue }) {
  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] [&>*]:min-w-0">
      <div className="space-y-5">
        {customer.canEdit ? (
          <CustomerForm
            key={`${customer.id}-${customer.version}-${customer.company?.canEdit ? customer.company.version : "readonly"}`}
            customer={{
              id: customer.id,
              version: customer.version,
              fullName: customer.fullName,
              email: customer.email,
              phone: customer.phone,
              whatsapp: customer.whatsapp,
              countryCode: customer.countryCode,
              city: customer.city,
              jobTitle: customer.jobTitle,
              ...(Object.hasOwn(customer, "internalNotes")
                ? { internalNotes: customer.internalNotes }
                : {}),
              ...(customer.company?.canEdit
                ? {
                    company: {
                      name: customer.company.name,
                      version: customer.company.version,
                    },
                  }
                : {}),
            }}
          />
        ) : (
          <AdminCard
            title="客户信息"
            description="只读：当前权限无法修改此客户。"
          >
            <dl className="space-y-4 text-sm">
              {[
                ["客户姓名", customer.fullName],
                ["电子邮箱", customer.email],
                ["电话", customer.phone],
                ["WhatsApp", customer.whatsapp],
                ["国家或地区", formatCountryName(customer.countryCode, "—")],
                ["城市", customer.city],
                ["职位", customer.jobTitle],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-admin-muted">{label}</dt>
                  <dd className="mt-1 break-words">{value || "—"}</dd>
                </div>
              ))}
            </dl>
          </AdminCard>
        )}
        {customer.company ? (
          <AdminCard title="公司信息">
            <p className="break-words text-sm font-medium">
              {customer.company.name}
            </p>
            <p className="mt-1 text-xs text-admin-muted">
              {customer.company.companyCode}
            </p>
            {customer.company.countryCode ? (
              <p className="mt-3 text-sm">{formatCountryName(customer.company.countryCode)}</p>
            ) : null}
            {customer.company.address ? (
              <p className="mt-2 break-words text-sm">
                {customer.company.address}
              </p>
            ) : null}
            {customer.canEdit && !customer.company.canEdit ? (
              <p className="mt-3 text-xs text-admin-muted">公司信息只读</p>
            ) : null}
          </AdminCard>
        ) : null}
      </div>
      <div className="space-y-5">
        <AdminCard
          title="关联询盘"
          description={`当前授权范围内共 ${customer.inquiries.length} 条询盘。`}
        >
          {customer.inquiries.length ? (
            <TableShell caption="客户关联询盘">
              <thead>
                <tr>
                  <th scope="col">询盘编号</th>
                  <th scope="col">阶段</th>
                  <th scope="col">创建时间</th>
                </tr>
              </thead>
              <tbody>
                {customer.inquiries.map((inquiry) => (
                  <tr key={inquiry.id}>
                    <td>
                      <Link
                        className="admin-focus inline-flex min-h-11 items-center rounded-admin-sm font-medium"
                        href={`/admin/inquiries/${encodeURIComponent(inquiry.id)}`}
                      >
                        {inquiry.inquiryNumber || inquiry.id}
                      </Link>
                    </td>
                    <td>
                      {inquiry.stage?.name ||
                        inquiryLegacyStatusLabels[inquiry.status]}
                    </td>
                    <td>
                      {new Date(inquiry.createdAt).toLocaleDateString("zh-CN", {
                        timeZone: "Asia/Shanghai",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableShell>
          ) : (
            <p className="text-sm text-admin-muted">暂无可查看的询盘</p>
          )}
        </AdminCard>
        <AdminCard title="客户活动">
          {customer.timeline.length ? (
            <ol className="space-y-4">
              {customer.timeline.map((activity) => (
                <li
                  key={activity.id}
                  className="border-l-2 border-admin-border pl-4"
                >
                  <time
                    className="text-xs text-admin-muted"
                    dateTime={new Date(activity.createdAt).toISOString()}
                  >
                    {new Date(activity.createdAt).toLocaleString("zh-CN", {
                      timeZone: "Asia/Shanghai",
                    })}
                  </time>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">
                    {activity.content}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-admin-muted">暂无可查看的活动</p>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
