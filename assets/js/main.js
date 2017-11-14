var $ = require('jquery');
var Ladda = require('ladda');
var retinajs  = require('retinajs');

var videoElement = document.getElementById('big_video');

const trackEvent = function(a, b, c) {
  if (ga !== undefined) {
    ga('send', 'event', a, b, c);
  }
}

var loadVideo = function() {
  setTimeout(function() {
    videoElement.style.opacity = '1';
  }, 200);
};

const handle_newsletter_submit = function(e) {
  trackEvent('Button', 'Click', 'Subscribe');

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
      trackEvent('Subscribe', 'Completed', '');
    },
    error: function (xhr, status, error) {
      $email.prop('disabled', false);
      $submit.prop('disabled', false);
      Ladda.stopAll();
      trackEvent('Subscribe', 'Failed', '');
    }
  });
};

function isElementInView(el) {
  var $el = $(el);

  var scrollEl = 'body';
  if (navigator.userAgent.toLowerCase().indexOf('chrome') != -1) {
    scrollEl = 'html';
  }
  
  var viewportTop = $(scrollEl).scrollTop();
  var viewportBottom = viewportTop + $(window).height();

  var elTop = Math.round($el.offset().top);
  var elBottom = elTop + $el.height();

  return ((elTop < viewportBottom) && (elBottom > viewportTop));
}

function whenInView(el, action) {
  $el = $(el);

  if (isElementInView($el) && !$el.hasClass('inView')) {
    $el.addClass('inView');
    action($el);
  } else if(!isElementInView($el) && $el.hasClass('inView')) {
    $el.removeClass('inView');
  }
}

function startAnimations() {
  $('.animateWhenInView').each(function () {
    whenInView(this, function() {});
  });
}

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
  
  $(window).scroll(startAnimations);
  startAnimations();

  retinajs();
});
