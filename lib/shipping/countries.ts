import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import zhLocale from "i18n-iso-countries/langs/zh.json";

countries.registerLocale(enLocale);
countries.registerLocale(zhLocale);

export type ShippingCountryLocale = "zh-CN" | "en";

export function getCountryName(code: string, locale: ShippingCountryLocale) {
  const normalized = code.trim().toUpperCase();
  const language = locale === "zh-CN" ? "zh" : "en";
  return countries.getName(normalized, language, { select: "official" }) ?? normalized;
}

export const countryOptionsZh = Object.keys(countries.getAlpha2Codes())
  .map((value) => ({ value, label: getCountryName(value, "zh-CN") }))
  .sort((left, right) => left.label.localeCompare(right.label, "zh-CN"));

export function isIsoCountryCode(code: string) {
  return Boolean(countries.alpha2ToAlpha3(code.trim().toUpperCase()));
}
