var $ = require('jquery');
var Ladda = require('ladda');
var Retina = require('retina.js').Retina;
var appear = require('jquery.appear');
var videoElement = document.getElementById('big_video');

var loadVideo = function() {
  setTimeout(function() {
    videoElement.style.opacity = '1';
  }, 200);
};

const handle_newsletter_submit = function(e) {
  e.preventDefault();
  var $email = $(this).find('input[name=email]');
  var $submit = $(this).find('input[type=submit]');
  var l = Ladda.create(document.querySelector('.ladda-button'));
  l.start();

  if ($email.val() == '') {
    Ladda.stopAll();
    return;
  }

  $email.prop('disabled', true);
  $submit.prop('disabled', true);

  const data = {
    email: $email.val(),
    list: 'northplay'
  };
  const url = 'https://services.northplay.co/subscribe';

  $.ajax({
    url: url,
    method: 'POST',
    cache: false,
    contentType: 'application/json',
    data: JSON.stringify(data),
    success: function (data) {
      $('.newsletter__form').hide();
      $('.newsletter__thanks').show();
      Ladda.stopAll();
    },
    error: function (xhr, status, error) {
      $email.prop('disabled', false);
      $submit.prop('disabled', false);
      Ladda.stopAll();
    }
  });
};

$(document).ready(function() {
  if (videoElement != null) {
    videoElement.oncanplay = loadVideo;
  }

  $('#newsletter_form').on('submit', handle_newsletter_submit);

  $('.smooth-scroll').click(function (e) {
    const diff = e.target.href.replace(window.location.href, "");
    if (diff.startsWith('#')) {
      e.preventDefault();
      $('html, body').animate({
        scrollTop: $(diff).offset().top
      }, 800);
    }
  });

  Retina.init(window);
});
