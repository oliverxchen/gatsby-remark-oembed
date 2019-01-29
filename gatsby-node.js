const {
  ammendOptions,
  ammendProviders,
  filterProviders,
  fetchOembedProviders
} = require("./helpers");

exports.onPreBootstrap = async ({ cache }, rawOptions) => {
  const options = ammendOptions(rawOptions);
  console.log('options');
  console.log(options);
  const rawProviders = await fetchOembedProviders();
  const providers = processProviders(rawProviders, options);
  console.log('providers');
  console.log(providers);
  console.log(providers[0].endpoints);
  console.log(providers[1].endpoints);
  await cache.set("remark-oembed-providers", providers);
};

const processProviders = (providers, options) => {
  providers = ammendProviders(providers);
  return filterProviders(providers, options.providers);
};
