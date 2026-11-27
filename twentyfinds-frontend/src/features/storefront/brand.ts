export const storefrontBrand = {
  name: "20ISH",
  wordmark: "20ish.",
  primaryTagline: ["Good taste.", "Under £20."],
  secondaryTagline: "Everyday. But Special.",
  locale: "en-GB",
} as const;

export function whatsappHref(copy: Record<string, string>) {
  const number = copy["contact.whatsapp-number"];
  return `https://wa.me/${number && /^[1-9][0-9]{7,14}$/.test(number) ? number : "923346432767"}`;
}
