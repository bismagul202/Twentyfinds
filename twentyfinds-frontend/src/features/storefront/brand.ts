export const storefrontBrand = {
  name: "20ISH",
  wordmark: "20ish.",
  primaryTagline: ["Good taste.", "Under £20."],
  secondaryTagline: "Everyday. But Special.",
  locale: "en-GB",
} as const;

const contactNumber = "+92 334 6432767";
const contactDigits = contactNumber.replace(/\D/g, "");

export const storefrontContact = {
  whatsappHref: `https://wa.me/${contactDigits}`,
};
