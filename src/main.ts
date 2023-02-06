import { Dataset, CheerioCrawler, log, LogLevel } from "crawlee";

import { Actor } from "apify";

Actor.main(async () => {
  const input = await Actor.getInput<{
    startUrl: string;
    includeNextCount: number;
    includePrevCount: number;
  }>();

  if (!input) {
    throw new Error("No input given");
  }
  const crawler = new CheerioCrawler({
    // The crawler downloads and processes the web pages in parallel, with a concurrency
    // automatically managed based on the available system memory and CPU (see AutoscaledPool class).
    // Here we define some hard limits for the concurrency.
    minConcurrency: 10,
    maxConcurrency: 50,

    // On error, retry each page at most once.
    maxRequestRetries: 1,

    // Increase the timeout for processing of each page.
    requestHandlerTimeoutSecs: 30,

    // Limit to 10 requests per one crawl
    maxRequestsPerCrawl: 10,

    async requestHandler({ request, $ }) {
      log.debug(`Processing ${request.url}...`);

      const title = $("title").text();
      const date = $("div.time").text();
      const image = $("#hplogo-img").attr("src");
      const description: any[] = [];
      $("#blog-card > div > div > p ").each((_, e) => {
        description.push($(e).text());
      });
      const earlyVersions: any[] = [];
      $("#blog-card > div > div > p > img").each((_, e) => {
        earlyVersions.push($(e).attr("src"));
      });
      await Dataset.pushData({
        url: request.url,
        imgUrl: image?.slice(2),
        date: date,
        title,
        description: description.slice(0, 2),
        earlyVersions: earlyVersions,
      });

      const nextDoodleLink = $("#doodle-newer").attr("href");
      const prevDoodleLink = $("#doodle-older").attr("href");

      if (input.includeNextCount > 0) {
        for (let i = 0; i < input.includeNextCount; i++) {
          if (typeof nextDoodleLink === "string")
            await crawler.addRequests([
              "https://www.google.com" + nextDoodleLink,
            ]);
        }
        input.includeNextCount--;
      }
      if (input.includePrevCount > 0) {
        for (let i = 0; i < input.includeNextCount; i++) {
          if (typeof prevDoodleLink === "string")
            await crawler.addRequests([
              "https://www.google.com" + prevDoodleLink,
            ]);
        }
        input.includePrevCount--;
      }
    },
  });

  await crawler.run([input.startUrl]);
});

log.debug("Crawler finished.");
