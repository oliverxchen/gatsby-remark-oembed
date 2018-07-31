const select = require("unist-util-select");
const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

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
          const regExp = new RegExp(schema);
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

exports.tranformsLinkNodeToOembedNode = (node, oembedResult) => {
  const virtualConsole = new jsdom.VirtualConsole();
  virtualConsole.sendTo(console);

  const dom = new JSDOM(
    oembedResult.html.replace(/((\/\/).*embed\.js)/g, 'https:$1'),
    {
      runScripts: "dangerously",
      resources: "usable",
      pretendToBeVisual: true,
      virtualConsole
    }
  );

  console.log('before: ', oembedResult.html);


  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('after: ', dom.window.document.body.children[0].outerHTML);
      node.type = 'html';
      node.value = dom.window.document.body.children[0].outerHTML;
      node.children = undefined;
      resolve(node);
    }, 10000);
  });
};
