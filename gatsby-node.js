const {
  ammendOptions,
  ammendProviders,
  filterProviders,
  fetchOembedProviders
} = require("./helpers");

exports.onPreBootstrap = async ({ cache }, rawOptions) => {
  console.log('ONPREBOOTSTRAP');
  const options = ammendOptions(rawOptions);
  const rawProviders = await fetchOembedProviders();
  console.log('rawProviders');
  console.log(rawProviders);
  const providers = processProviders(rawProviders, options);
  console.log('providers');
  console.log(providers);
  await cache.set("remark-oembed-providers", providers);
};

const processProviders = (providers, options) => {
  console.log('PROCESSPROVIDERS');
  providers = ammendProviders(providers);
  console.log('providers');
  console.log(providers);
  return filterProviders(providers, options.providers);
};
