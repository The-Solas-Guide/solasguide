export { BrandMark, BrandWordmark } from "@/components/brand/brand-marks";
export { PractitionerTeaserCard } from "@/components/directory/practitioner-teaser-card";
export { PractitionerListItem } from "@/components/directory/practitioner-list-item";
export { CategoryCard } from "@/components/directory/category-card";
export { CategoryCompactCard, CategoryImageTile, CategoryLinkRow } from "@/components/directory/category-navigation";
export { FilterPillGroup } from "@/components/directory/filter-pill-group";
export { DiscoveryControls } from "@/components/directory/discovery-controls";
export { FormChoiceCard } from "@/components/forms/form-choice-card";
export { FormFeedback } from "@/components/forms/form-feedback";
export { FormProgress } from "@/components/forms/form-progress";
export { AuthorityCard } from "@/components/patterns/authority-card";
export { SiteHeader } from "@/components/layout/site-header";
export { SiteFooter } from "@/components/layout/site-footer";
export { Breadcrumbs, Pagination } from "@/components/navigation/navigation-primitives";
export { LandingPageHeader } from "@/components/marketing/landing-page-header";
export { EditorialIntro, CuratorsNote, FactPanel, FaqList, DisclosurePanel } from "@/components/editorial/editorial-blocks";
export { CopywritingGuide } from "@/components/editorial/copywriting-guide";
export { EnquiryCta, JourneyEntryCards } from "@/components/enquiry/enquiry-patterns";
export { CustomerEnquiryForm } from "@/components/enquiry/customer-enquiry-form";
export { EmptyState, LoadingCardGrid } from "@/components/feedback/feedback-patterns";
export { EnquiryDialogExample, MobileFilterSheetExample } from "@/components/overlays/overlay-examples";

export const COMPONENT_REGISTRY = [
  { name: "BrandWordmark", category: "identity", importPath: "@/components/component-registry" },
  { name: "BrandMark", category: "identity", importPath: "@/components/component-registry" },
  { name: "PractitionerTeaserCard", category: "cards", importPath: "@/components/component-registry" },
  { name: "PractitionerListItem", category: "lists", importPath: "@/components/component-registry" },
  { name: "CategoryCard", category: "cards", importPath: "@/components/component-registry" },
  { name: "CategoryImageTile", category: "navigation", importPath: "@/components/component-registry" },
  { name: "CategoryCompactCard", category: "navigation", importPath: "@/components/component-registry" },
  { name: "CategoryLinkRow", category: "lists", importPath: "@/components/component-registry" },
  { name: "FilterPillGroup", category: "search-and-filters", importPath: "@/components/component-registry" },
  { name: "DiscoveryControls", category: "search-and-filters", importPath: "@/components/component-registry" },
  { name: "FormChoiceCard", category: "forms", importPath: "@/components/component-registry" },
  { name: "FormProgress", category: "forms", importPath: "@/components/component-registry" },
  { name: "FormFeedback", category: "feedback", importPath: "@/components/component-registry" },
  { name: "AuthorityCard", category: "patterns", importPath: "@/components/component-registry" },
  { name: "SiteHeader", category: "navigation", importPath: "@/components/component-registry" },
  { name: "SiteFooter", category: "navigation", importPath: "@/components/component-registry" },
  { name: "Breadcrumbs", category: "navigation", importPath: "@/components/component-registry" },
  { name: "Pagination", category: "navigation", importPath: "@/components/component-registry" },
  { name: "LandingPageHeader", category: "page-headers", importPath: "@/components/component-registry" },
  { name: "EditorialIntro", category: "editorial", importPath: "@/components/component-registry" },
  { name: "CuratorsNote", category: "editorial", importPath: "@/components/component-registry" },
  { name: "FactPanel", category: "editorial", importPath: "@/components/component-registry" },
  { name: "FaqList", category: "editorial", importPath: "@/components/component-registry" },
  { name: "DisclosurePanel", category: "editorial", importPath: "@/components/component-registry" },
  { name: "CopywritingGuide", category: "editorial", importPath: "@/components/component-registry" },
  { name: "EnquiryCta", category: "enquiry", importPath: "@/components/component-registry" },
  { name: "JourneyEntryCards", category: "enquiry", importPath: "@/components/component-registry" },
  { name: "CustomerEnquiryForm", category: "enquiry", importPath: "@/components/component-registry" },
  { name: "EmptyState", category: "feedback", importPath: "@/components/component-registry" },
  { name: "LoadingCardGrid", category: "feedback", importPath: "@/components/component-registry" },
  { name: "EnquiryDialogExample", category: "overlays", importPath: "@/components/component-registry" },
  { name: "MobileFilterSheetExample", category: "overlays", importPath: "@/components/component-registry" },
] as const;
