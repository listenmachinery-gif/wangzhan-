import { describe, expect, it } from "vitest";

import {
  formatAdminEnum,
  formatCountryName,
  formatDeviceType,
  formatTrafficMedium,
  formatTrafficSource,
} from "@/lib/admin/localization";

describe("admin Chinese display localization", () => {
  it("renders ISO region codes as Chinese country and region names", () => {
    expect(formatCountryName("US")).toBe("美国");
    expect(formatCountryName(" de ")).toBe("德国");
    expect(formatCountryName("CN")).toBe("中国");
  });

  it("preserves customer-authored country text and unknown values", () => {
    expect(formatCountryName("United States")).toBe("United States");
    expect(formatCountryName("ZZ")).toBe("ZZ");
    expect(formatCountryName(null)).toBe("未知");
    expect(formatCountryName(undefined, "—")).toBe("—");
  });

  it("localizes common traffic sources and keeps new campaign sources intact", () => {
    expect(formatTrafficSource("direct")).toBe("直接访问");
    expect(formatTrafficSource("google")).toBe("Google");
    expect(formatTrafficSource("linkedin")).toBe("LinkedIn");
    expect(formatTrafficSource("partner-campaign-2027")).toBe("partner-campaign-2027");
    expect(formatTrafficSource(null)).toBe("未知");
  });

  it("localizes traffic media and device types", () => {
    expect(formatTrafficMedium("organic")).toBe("自然搜索");
    expect(formatTrafficMedium("referral")).toBe("引荐访问");
    expect(formatTrafficMedium("none")).toBe("无媒介");
    expect(formatDeviceType("desktop")).toBe("桌面端");
    expect(formatDeviceType("mobile")).toBe("移动端");
    expect(formatDeviceType("tablet")).toBe("平板");
  });

  it("localizes system enums without changing unknown technical values", () => {
    expect(formatAdminEnum("DRAFT")).toBe("草稿");
    expect(formatAdminEnum("PUBLISHED")).toBe("已发布");
    expect(formatAdminEnum("SUPER_ADMIN")).toBe("超级管理员");
    expect(formatAdminEnum("SALES_MANAGER")).toBe("销售经理");
    expect(formatAdminEnum("CRM_VIEWER")).toBe("CRM 查看员");
    expect(formatAdminEnum("UNMAPPED_TECHNICAL_VALUE")).toBe("UNMAPPED_TECHNICAL_VALUE");
    expect(formatAdminEnum(null, "—")).toBe("—");
  });
});
