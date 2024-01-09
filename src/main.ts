import { Actor } from "apify";
import { PuppeteerCrawler } from "crawlee";

import { defaultRequestHandler } from "./routes";
import { Input, getStartUrlsFromInput, addCookieHook } from "./utils";

Actor.main(async () => {
  const input: Input = await Actor.getInput();

  const startUrls: string[] = await getStartUrlsFromInput(input);
  const crawler = new PuppeteerCrawler({
    requestHandler: defaultRequestHandler,
    preNavigationHooks: [addCookieHook],
    headless: !process.env.HEADFUL,
  });

  await crawler.run(startUrls);
});
