export type Locale = "en" | "pt";

export interface NavItem {
  labelEn: string;
  labelPt: string;
  href: string;
}

export interface ContactLink {
  label: string;
  url: string;
  icon: string;
}
