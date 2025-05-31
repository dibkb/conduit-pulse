export type toolType =
  | "search"
  | "linkedInSearch"
  | "linkedInProfile"
  | "scrapePage";

export const getToolCost = (name: toolType): number => {
  switch (name) {
    case "search":
      return 1;
    case "linkedInSearch":
      return 2;
    case "linkedInProfile":
      return 3;
    case "scrapePage":
      return 2;
    default:
      return 0;
  }
};

export const reverseToolMap: Record<toolType, string> = {
  search: "Serp API",
  linkedInSearch: "Scrapin.io /search",
  linkedInProfile: "Scrapin.io /profile",
  scrapePage: "Scrapeowl",
};
