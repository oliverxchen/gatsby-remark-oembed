const select = require("unist-util-select");
const axios = require("axios");
const puppeteer = require("puppeteer");

const OEMBED_PROVIDERS_URL = "https://oembed.com/providers.json";

exports.fetchOembedProviders = () => {
  return axios.get(OEMBED_PROVIDERS_URL).then(response => response.data);
};

exports.getProviderEndpointUrlForLinkUrl = (linkUrl, providers) => {
  let endpointUrl = false;

  for (provider of providers) {
    const endpoints = provider.endpoints || [];
    for (endpoint of endpoints) {
      const schemes = endpoint.schemes || [];

      for (schema of schemes) {
        try {
          const regExp = new RegExp(schema.replace("*", ".*"));
          if (regExp.test(linkUrl)) {
            endpointUrl = endpoint.url;
          }
        } catch (error) {
          console.log(
            "Regex problem with provider",
            provider.provider_name,
            schema,
            error.message
          );
        }
      }
    }
  }

  if (!endpointUrl) {
    console.log("No enpoint url for", linkUrl);
  }

  return endpointUrl;
};

exports.fetchOembed = (linkUrl, endpointUrl) => {
  return axios
    .get(endpointUrl, {
      params: {
        format: "json",
        url: linkUrl
      }
    })
    .then(response => response.data);
};

exports.selectPossibleOembedLinkNodes = markdownAST => {
  return select(markdownAST, "paragraph link:only-child");
};

exports.tranformsLinkNodeToOembedNode = async (node, oembedResult) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(
    oembedResult.html.replace(/((\/\/).*embed\.js)/g, "https:$1")
  );
  const html = await page.content();
  console.log("BEFORE", html);

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const html = await page.content();
      console.log("AFTER: ", html);
      await browser.close();
      node.type = "html";
      node.value = html;
      node.children = undefined;
      resolve(node);
    }, 30000);
  });
};
