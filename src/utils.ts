import { Actor } from "apify";
import { PuppeteerHook } from "crawlee";

export type Input = {
  startUrls?: { url: string }[];
  keywords: string;
  cookie: string;
} | null;

export const getStartUrlsFromInput = async (
  input: Input
): Promise<string[]> => {
  if (input?.startUrls) {
    return input?.startUrls.map(({ url }) => {
      return url;
    });
  }
  let url = `https://www.linkedin.com/search/results/services/?geoUrn=%5B"103644278"%5D&origin=FACETED_SEARCH&sid=q1Z`;

  if (input !== null) {
    if (input.keywords) {
      const wordsArray = input.keywords.split(" ");
      const encodedString = wordsArray.join("%20");
      url += `&keywords=${encodedString}`;
    }
  }
  return [url];
};

export const addCookieHook: PuppeteerHook = async ({ page, request }) => {
  const input = await Actor.getInput<any>();

  if (!request.headers) {
    request.headers = {};
  }

  if (input.cookie) {
    request.headers["cookie"] = `li_at=${input.cookie}`;
  } else {
    delete request.headers["cookie"];
  }
};
