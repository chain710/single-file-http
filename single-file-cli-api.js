/*
 * Copyright 2010-2020 Gildas Lormeau
 * contact : gildas.lormeau <at> gmail.com
 *
 * This file is part of SingleFile.
 *
 *   The code in this file is free software: you can redistribute it and/or
 *   modify it under the terms of the GNU Affero General Public License
 *   (GNU AGPL) as published by the Free Software Foundation, either version 3
 *   of the License, or (at your option) any later version.
 *
 *   The code in this file is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
 *   General Public License for more details.
 *
 *   As additional permission under GNU AGPL version 3 section 7, you may
 *   distribute UNMODIFIED VERSIONS OF THIS file without the copy of the GNU
 *   AGPL normally required by section 4, provided you include this license
 *   notice and a URL through which recipients can access the Corresponding
 *   Source.
 */

/* global require, exports, URL */

const scripts = require("./back-ends/common/scripts.js");
const VALID_URL_TEST = /^(https?|file):\/\//;

const DEFAULT_OPTIONS = {
  removeHiddenElements: true,
  removeUnusedStyles: true,
  removeUnusedFonts: true,
  removeFrames: false,
  compressHTML: true,
  compressCSS: false,
  loadDeferredImages: true,
  loadDeferredImagesMaxIdleTime: 1500,
  loadDeferredImagesBlockCookies: false,
  loadDeferredImagesBlockStorage: false,
  loadDeferredImagesKeepZoomLevel: false,
  loadDeferredImagesDispatchScrollEvent: false,
  filenameTemplate: "{page-title} ({date-locale} {time-locale}).html",
  infobarTemplate: "",
  includeInfobar: false,
  filenameMaxLength: 192,
  filenameMaxLengthUnit: "bytes",
  filenameReplacedCharacters: [
    "~",
    "+",
    "\\\\",
    "?",
    "%",
    "*",
    ":",
    "|",
    '"',
    "<",
    ">",
    "\x00-\x1f",
    "\x7F",
  ],
  filenameReplacementCharacter: "_",
  maxResourceSizeEnabled: false,
  maxResourceSize: 10,
  backgroundSave: true,
  removeAlternativeFonts: true,
  removeAlternativeMedias: true,
  removeAlternativeImages: true,
  groupDuplicateImages: true,
  saveRawPage: false,
  resolveFragmentIdentifierURLs: false,
  userScriptEnabled: false,
  saveFavicon: true,
  includeBOM: false,
  insertMetaCSP: true,
  insertMetaNoIndex: false,
  insertSingleFileComment: true,
  blockImages: false,
  blockStylesheets: false,
  blockFonts: false,
  blockScripts: true,
  blockVideos: true,
  blockAudios: true,
};

const backEnds = {
  //   jsdom: "./back-ends/jsdom.js",
  puppeteer: "./back-ends/puppeteer.js",
  //   "puppeteer-firefox": "./back-ends/puppeteer-firefox.js",
  //   "webdriver-chromium": "./back-ends/webdriver-chromium.js",
  //   "webdriver-gecko": "./back-ends/webdriver-gecko.js",
  //   "playwright-firefox": "./back-ends/playwright-firefox.js",
  //   "playwright-chromium": "./back-ends/playwright-chromium.js",
};

let backend;

exports.DEFAULT_OPTIONS = DEFAULT_OPTIONS;
exports.VALID_URL_TEST = VALID_URL_TEST;
exports.initialize = initialize;

async function initialize(options) {
  options = Object.assign({}, DEFAULT_OPTIONS, options);
  backend = require(backEnds[options.backEnd]);
  let browser = await backend.initialize(options);
  return {
    capture: (url) => capture(browser, url, options),
    close: async () => {
      await backend.closeBrowser(browser);
    },
  };
}

async function capture(browser, url, options) {
  let taskOptions = JSON.parse(JSON.stringify(options));
  taskOptions.url = url;
  console.log(`ready to capture url ${url}`);
  let pageData = await backend.getPageData(browser, taskOptions);
  console.log(`capture ok ${pageData.content.length} bytes`);
  if (taskOptions.includeInfobar) {
    await includeInfobarScript(pageData);
  }

  if (taskOptions.dumpContent) {
    console.log(pageData.content); // eslint-disable-line no-console
  }

  return pageData.content;
}

async function includeInfobarScript(pageData) {
  const infobarContent = await scripts.getInfobarScript();
  pageData.content +=
    "<script>document.currentScript.remove();" + infobarContent + "</script>";
}
