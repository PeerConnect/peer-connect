module.exports = {
  // how many peers must be connected before loading assets from peers
  // if threshold = 3, fourth client will load from peers
  threshold: 1,
  // asset types to load from peers
  assetTypes: ['jpg', 'jpeg'],
  // load images above the fold from server if foldLoading: true
  foldLoading: true
};