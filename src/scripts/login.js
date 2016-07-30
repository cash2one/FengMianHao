var login_module = (function ($, LS) {
  var $window = $(window);
  var $body = $('body');
  var wW = $window.width();
  var wH = $window.height();
  var $input_email = $('#input_email');
  var $input_passwd = $('#input_passwd');
  var $btn_login = $('#btn_login');
  var $login_error_msg = $('#login_error_msg');
  var $change_captcha = $('#change_captcha');
  var $input_captcha = $('#input_captcha');
  return {
    'init': function () {
      var self = this;
      Promise.race([helpers.setBackgroundImg($body), helpers.delay(1000)]).then(function () {
        $body.removeClass('transparent');
      }, function () {
        $body.removeClass('transparent');
      });
      self.setSize();
      self.bindEvent();
      $input_email.focus();
    },
    'bindEvent': function () {
      var self = this;
      $window.on('resize', function () {
        wW = $window.width();
        wH = $window.height();
        self.setSize()
      });
      $('#login_container').on('change', function () {
        $login_error_msg.text('').addClass('hidden');
      });
      $input_email.on('change keyup', function () {
        if ($(this).val().trim().length > 0 && helpers.validateEmailAddr($(this).val())) {
          $input_email.closest('.input-wrapper').removeClass('error');
          $btn_login.removeClass('error');
        } else {
          $input_email.closest('.input-wrapper').addClass('error');
          $btn_login.addClass('error');
        }
      });
      $input_passwd.on('change keyup', function () {
        if ($(this).val().length > 0) {
          $input_email.closest('.input-wrapper').removeClass('error');
          $btn_login.removeClass('error');
        } else {
          $input_email.closest('.input-wrapper').addClass('error');
          $btn_login.addClass('error');
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
        if ($('#login_container').hasClass('require-captcha')) {
          payload.vcode = $input_captcha.val();
          payload.vcode_id = $change_captcha.data('captcha-id');
        }
        $btn_login.addClass('processing');
        self.sendCredits(payload).then(function (result) {
          LS.setItem('userinfo', JSON.stringify(result));
          $btn_login.removeClass('processing');
          self.redirectTo(result);
        }, function (status_code, msg) {
          console.log(JSON.stringify(status_code), JSON.stringify(msg));
          $login_error_msg.text(msg).removeClass('hidden');
          $btn_login.removeClass('processing');
          if (parseInt(status_code) === 445) {
            self.changeCaptcha($('#the_captcha'));
            $('.captcha-container').removeClass('hidden');
            $('#login_container').addClass('require-captcha');
          }
        });
      });
      $change_captcha.on('click', function () {
        self.changeCaptcha($('#the_captcha'));
      });
    },
    'changeCaptcha': function ($img) {
      helpers.$post(helpers.apis().getCaptcha, {}).then(function (data) {
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
        console.log(helpers.destination_pages[page]);
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
      $('html, body').width(wW);
      $('html, body').height(wH);
      $('#main').css('height', (wH - 90 - 64) + 'px');
      $('#main').css('min-height', (400) + 'px');
    }
  };
})(jQuery, window.localStorage);
login_module.init();