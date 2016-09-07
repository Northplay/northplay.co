var $ = require('jquery');
var Retina = require('retina.js').Retina;

var videoElement = document.getElementById('big_video');

var loadVideo = function() {
  setTimeout(function() {
    videoElement.style.opacity = '1';
  }, 200);
};

$(document).ready(function() {
  videoElement.oncanplay = loadVideo;

  Retina.init(window);
});
