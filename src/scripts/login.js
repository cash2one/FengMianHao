var login_module = (function ($, LS) {
  var $window = $(window);
  var $body = $('body');
  var $slides = $('.slides');
  var $wrapper = $('.wrapper');
  var total_slides = $slides.length;
  var wW = $window.width();
  var wH = $window.height();
  var $input_email = $('#input_email');
  var $input_passwd = $('#input_passwd');
  var $btn_login = $('#btn_login');
  var $login_error_msg = $('#login_error_msg');
  var $change_captcha = $('#change_captcha');
  var $input_captcha = $('#input_captcha');
  var curr_slide_idx = 0;
  var Timer_Scroll = true;
  return {
    'init': function () {
      var self = this;
      Promise.race([helpers.setBackgroundImg($('.slide-1')), helpers.delay(1000)])
          .then(function () {
            $body.removeClass('transparent');
            $.each($slides, function (idx, val) {
              if (!$(val)
                      .hasClass('slide-1')) {
                helpers.setBackgroundImg($(val));
              }
            });
          }, function () {
            $body.removeClass('transparent');
          });
      self.setSize();
      self.bindEvent();
      $input_email.focus();
    },
    'bindEvent': function () {
      var self = this;
      self.wheel_scroll_throttle(function (evt) {
        var dir = evt.originalEvent.deltaY > 0 ? 'next' : 'prev';
        evt.preventDefault();
        if ($window.hasClass('animating')) {
          return false;
        } else {
          return self.slide(dir);
        }
      }, 250);
      $window.on('resize', function () {
        wW = $window.width();
        wH = $window.height();
        self.setSize()
      });
      $('#login_container')
          .on('change', function () {
            $login_error_msg.text('')
                .addClass('hidden');
          });
      $input_email.on('change keyup', function () {
        if ($(this)
                .val()
                .trim()
                .length > 0 && helpers.validateEmailAddr($(this)
                .val())) {
          $input_email.closest('.input-wrapper')
              .removeClass('error');
          $btn_login.removeClass('error');
        } else {
          $input_email.closest('.input-wrapper')
              .addClass('error');
          $btn_login.addClass('error');
        }
      });
      $input_passwd.on('change keyup', function () {
        if ($(this)
                .val()
                .length > 0) {
          $input_email.closest('.input-wrapper')
              .removeClass('error');
          $btn_login.removeClass('error');
        } else {
          $input_email.closest('.input-wrapper')
              .addClass('error');
          $btn_login.addClass('error');
        }
      });
      $input_passwd.on('keyup', function (evt) {
        if (evt.keyCode === 13 && helpers.validateEmailAddr($input_email.val()) && $input_passwd.val() !== '') {
          $btn_login.trigger('click');
        }
      });
      $btn_login.on('click', function () {
        if ($btn_login.hasClass('error') || $btn_login.hasClass('processing')) {
          return false;
        }
        var payload = {
          'email': helpers.validateEmailAddr($input_email.val()),
          'password': $input_passwd.val()
        };
        if ($('#login_container')
                .hasClass('require-captcha')) {
          payload.vcode = $input_captcha.val();
          payload.vcode_id = $change_captcha.data('captcha-id');
        }
        $btn_login.addClass('processing');
        self.sendCredits(payload)
            .then(function (result) {
              LS.setItem('userinfo', JSON.stringify(result));
              $btn_login.removeClass('processing')
                  .removeClass('error');
              $login_error_msg.addClass('hidden');
              self.redirectTo(result);
            }, function (status_code, msg, data) {
              console.log(JSON.stringify(status_code), JSON.stringify(msg));
              $login_error_msg.text(msg)
                  .removeClass('hidden');
              $btn_login.removeClass('processing');
              // 邮箱或密码错误
              if (parseInt(status_code) === 441) {
                $('#input_email')
                    .trigger('select');
                $('#input_passwd')
                    .val('');
                if (data.requireCaptcha === 'true') {
                  console.log('data.requireCaptcha: ', data.requireCaptcha);
                  $('.captcha-container')
                      .removeClass('hidden');
                  $('#login_container')
                      .addClass('require-captcha');
                  $('#input_captcha')
                      .val('');
                  self.changeCaptcha($('#the_captcha'));
                } else {
                  console.log('data: ', data);
                }
              }
              // 验证码错误
              if (parseInt(status_code) === 434) {
                $('.captcha-container')
                    .removeClass('hidden');
                $('#login_container')
                    .addClass('require-captcha');
                $('#input_captcha')
                    .val('')
                    .trigger('select');
                self.changeCaptcha($('#the_captcha'));
              }
              // 失败三次，需要验证码
              //if (parseInt(status_code) === 445) {
              //  self.changeCaptcha($('#the_captcha'));
              //  $('.captcha-container').removeClass('hidden');
              //  $('#login_container').addClass('require-captcha');
              //}
            });
      });
      $change_captcha.on('click', function () {
        self.changeCaptcha($('#the_captcha'));
      });
    },
    'wheel_scroll_throttle': function (callback, delay) {
      $window.on('wheel', function (evt) {
        if (Timer_Scroll) {
          window.clearTimeout(Timer_Scroll);
        }
        Timer_Scroll = window.setTimeout(function () {
          callback(evt);
        }, delay);
      });
    },
    'slide': function (arg) {
      var self = this
      console.log('slide(', arg, ')');
      console.log('curr_slide_idx: ', curr_slide_idx);
      if (arg === 'prev') {
        if (curr_slide_idx <= 0) {
          return false;
        } else {
          self.animateSlide(-1)
              .then(function () {
                $window.removeClass('animating');
                curr_slide_idx = Math.max(0, curr_slide_idx - 1);
              });
        }
      } else if (arg === 'next') {
        if (curr_slide_idx >= total_slides - 1) {
          console.log('curr_slide_idx === total_slides - 1');
          return false;
        } else {
          self.animateSlide(+1)
              .then(function () {
                $window.removeClass('animating');
                curr_slide_idx = Math.min(total_slides - 1, curr_slide_idx + 1);
              });
        }
      } else {
        console.log('else');
      }
    },
    'animateSlide': function (step) {
      console.log('animateSlide(', step, ')');
      $window.addClass('animating');
      var $d = $.Deferred();
      if (step > 0) {
        $wrapper.animate({
          marginTop: '-=' + ((wH * Math.abs(step)) + 'px')
        }, 300, function () {
          $d.resolve();
        });
      } else {
        $wrapper.animate({
          marginTop: '+=' + ((wH * Math.abs(step)) + 'px')
        }, 300, function () {
          $d.resolve();
        });
      }
      return $d.promise();
    },
    'changeCaptcha': function ($img) {
      helpers.$post(helpers.apis()
              .getCaptcha, {})
          .then(function (data) {
            console.log('data.vcode_url: ', helpers.CONFIG.API_BASE_URL + data.vcode_url);
            $img.prop('src', helpers.CONFIG.API_BASE_URL + data.vcode_url + '?data=' + JSON.stringify({
                  "uuid": data.vcode_id
                }));
            $change_captcha.data('captcha-id', data.vcode_id);
          });
    },
    'sendCredits': function (payload) {
      return helpers.$post(helpers.apis().userLogin, (payload));
    },
    'redirectTo': function (data) {
      function gotoPage(page, param) {
        console.log('gotoPage(', page, ')');
        return location.replace(page + param);
      }
      switch (data.userStatus) {
        case 1:
          console.log('新增,去选择类型');
          gotoPage(helpers.destination_pages.page_choose_type, '');
          break;
        case 2:
          console.log('入驻,去审核结果页');
          gotoPage(helpers.destination_pages.page_review_result, '?result=0');
        case 3:
          console.log('编辑,爱去去哪');
          if (helpers.getValueFromUrl('redirect')) {
            location.replace(helpers.getValueFromUrl('redirect'));
          } else {
            gotoPage(helpers.destination_pages.page_dashboard, '');
          }
          break;
        case 5:
          console.log('通过,爱去去哪');
          if (helpers.getValueFromUrl('redirect')) {
            location.replace(helpers.getValueFromUrl('redirect'));
          } else {
            gotoPage(helpers.destination_pages.page_dashboard, '');
          }
          break;
        case 6:
          console.log('未通过,去审核结果页');
          gotoPage(helpers.destination_pages.page_review_result, '?result=1');
          break;
        default:
          console.log('ERROR: ', data);
      }
      console.log('redirectTo(', data, ')');
    },
    'setSize': function () {
      //$('html, body').width(wW);
      //$('html, body').height(wH);
      $slides.width(wW);
      $slides.height(wH);
      //$('#main').css('height', (wH - 90 - 64) + 'px');
      $('#main').css('min-height', (wH - 90 - 64) + 'px');
    }
  };
})(jQuery, window.localStorage);
login_module.init();