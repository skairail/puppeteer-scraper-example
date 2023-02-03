// For more information, see https://crawlee.dev/
import { PlaywrightCrawler, Dataset } from "crawlee";

// PlaywrightCrawler crawls the web using a headless
// browser controlled by the Playwright library.
const crawler = new PlaywrightCrawler({
  // Use the requestHandler to process each of the crawled pages.
  async requestHandler({
    // request,
    page,
    // enqueueLinks,
    // log
  }) {
    const title = await page.title();
    const date = await page.locator("div.time").textContent();
    const image = await page.locator("#hplogo-img").getAttribute("src");
    const earlyVersions = await page.$$eval(
      "#blog-card > div > div > p > img",
      (imgs: any) => imgs.map((img: any) => img.src)
    );
    const desc = await page.$$eval("#blog-card > div > div > p", (texts: any) =>
      texts.map((text: any) => text.innerText)
    );
    await Dataset.pushData({
      //   url: request.loadedUrl,
      imgUrl: image?.slice(2),
      date: date,
      title,
      description: desc.slice(0, 2),
      earlyVersions: earlyVersions,
    });
    // await enqueueLinks();
  },
  // headless: false,
});

await crawler.run([
  "https://www.google.com/doodles/arkhip-kuindzhis-180th-birthday",
  "https://www.google.com/doodles/lunar-new-year-2022-multiple-countries",
]);
