function loadVideosFromServer(videoArray) {
  videoArray.forEach(element => {
    let source = element.dataset.src;
    setServerAsset(source);
  });
}

function setServerAsset(imageSource) {
  document.querySelector(`[data-src='${imageSource}']`).setAttribute('src', `${imageSource}`);
}

function checkForImageError(imageArray) {
  for (let i = 0; i < imageArray.length; i++) {
    let source = imageArray[i].dataset.src;
    imageArray[i].onerror = function () {
      setServerAsset(source);
    }
  }
}

function checkForMobile() {
  testExp = new RegExp('Android|webOS|iPhone|iPad|BlackBerry|Windows Phone|Opera Mini|IEMobile|Mobile', 'i');
  return !!testExp.test(navigator.userAgent);
}

function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function getImageData(image, selector, bgProperty) {
  let canvas = document.createElement('canvas');
  let context = canvas.getContext('2d');
  let img = bgProperty ? new Image() : image;
  let type = bgProperty ? '' : getImageType(image);
  if (bgProperty) img.src = image;
  context.canvas.width = img.width;
  context.canvas.height = img.height;
  context.drawImage(img, 0, 0, img.width, img.height);
  if (bgProperty) setBackgroundImage(selector, bgProperty, canvas.toDataURL());
  return canvas.toDataURL(`image/${type}`);
}

function getImageType(image) {
  const imageSrc = image.dataset.src;
  const regex = /(?:\.([^.]+))?$/;
  return regex.exec(imageSrc)[1];
}

function setImageHeightsToSend(imageArray) {
  return imageArray.map(imageNode => imageNode.height);
}