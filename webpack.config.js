const config = ((env = 'dev') => {
  return require(`./webpack.config.${env}`);
});

module.exports = config;
