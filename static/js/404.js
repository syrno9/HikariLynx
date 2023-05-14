const imageUrls = [
  '/.static/404.png',
  '/.static/4042.png',
  '/.static/4043.png',
  '/.static/4044.png'
];

const randomIndex = Math.floor(Math.random() * imageUrls.length);

document.getElementById('image').src = imageUrls[randomIndex];
