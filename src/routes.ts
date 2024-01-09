import { Actor } from "apify";
import { Dataset, PuppeteerHook, PuppeteerRequestHandler } from "crawlee";

import { Input } from "./utils";

enum Label {
  "detail",
  "searchPage",
  "servicePage",
  "profilePage",
}

const servicePageHandler: PuppeteerRequestHandler = async (args) => {
  const { page, enqueueLinks } = args;

  await enqueueLinks({
    selector: ".app-aware-link.link-without-visited-state",
    userData: {
      label: Label.profilePage,
    },
  });
};

const profilePageHandler: PuppeteerRequestHandler = async (args) => {
  const { page, request } = args;
  let url;

  await page.waitForSelector(".pvs-header__subtitle");
  const element: any = await page.$(".pvs-header__subtitle");
  const text = await page.evaluate((element) => element.textContent, element);

  const followersCount = parseInt(text, 10);
  if (followersCount > 10) {
    url = request.url;
  }
  const dataObject = {
    url: url,
  };
  await Dataset.pushData(dataObject);
};

export const defaultRequestHandler: PuppeteerRequestHandler = async (args) => {
  const { request, enqueueLinks, log, page } = args;
  const label: Label = request.userData.label;
  log.info(`crawling ${request.url}`);

  const queue = await Actor.openRequestQueue();

  switch (label) {
    case Label.servicePage: {
      return servicePageHandler(args);
    }
    case Label.profilePage: {
      return profilePageHandler(args);
    }

    default: {
      const links: any = [];
      const pageLink = request.url;
      if (!pageLink.includes("page=")) {
        const elements = await page.$$("li[data-test-pagination-page-btn]");
        const lastElement = elements[elements.length - 1];
        const button: any = await lastElement.$("button");
        const value = await button.evaluate((element) =>
          parseInt(element.innerText)
        );

        for (let i = 1; i < 1; i++) {
          const link = `${request.url}&page=${i}`;
          links.push(link);
        }
      }
      await Promise.all([
        await enqueueLinks({
          selector: ".app-aware-link.scale-down",
          userData: {
            label: Label.servicePage,
          },
        }),

        links.forEach(async (url) => {
          await queue.addRequest({
            url,
          });
        }),
      ]);
    }
  }
};
