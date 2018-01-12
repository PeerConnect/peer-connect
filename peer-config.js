module.exports = {
  // how many peers must be connected before loading assets from peers
  // if threshold = 3, fourth client will load from peers
  threshold: 3,
  assetTypes: ['.jpg'],
  lazyLoading: false,
  fold: false
};