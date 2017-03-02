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

function isElementInView(el) {
  var $el = $(el);

  var scrollEl = ((navigator.userAgent.toLowerCase().indexOf('webkit') != -1) ? 'body' : 'html');
  var viewportTop = $(scrollEl).scrollTop();
  var viewportBottom = viewportTop + $(window).height();

  var elTop = Math.round($el.offset().top);
  var elBottom = elTop + $el.height();

  return ((elTop < viewportBottom) && (elBottom > viewportTop));
}

function whenInView(el, action) {
  $this = $(el);
  // if ($this.hasClass('inView')) {
  //   return;
  // }

  if (isElementInView($this) && !$this.hasClass('inView')) {
    $this.addClass('inView');
    action($this);
  } else if(!isElementInView($this) && $this.hasClass('inView')) {
    $this.removeClass('inView');
  }
}

function startAnimations() {
  $('.animateWhenInView').each(function () {
    whenInView(this, function() {});
  });

  $('.startPlaybackWhenInView').each(function () {
    whenInView(this, function ($video) {
      const id = $video.attr('id');
      document.getElementById(id).play();
    });
  })
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

  Retina.init(window);
});
