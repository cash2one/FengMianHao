var register_module = (function ($, LS) {
  var $window = $(window);
  var $body = $('body');
  var wW = $window.width();
  var wH = $window.height();
  var $input_email = $('#input_email');
  var $input_passwd = $('#input_passwd');
  var $passwd_repeat = $('#input_passwd_repeat');
  var $input_captcha = $('#input_captcha');
  var $btn_register = $('#btn_register');
  var $btn_submit_chosen_type = $('#btn_submit_chosen_type');
  var $change_captcha = $('#change_captcha');
  return {
    'getter': function () {
      return {
        '$input_email': $input_email,
        '$input_passwd': $input_passwd,
        '$passwd_repeat': $passwd_repeat,
        '$input_captcha': $input_captcha,
        '$btn_register': $btn_register,
        '$change_captcha': $change_captcha
      };
    },
    'init': function () {
      var self = this;
      Promise.race([helpers.setBackgroundImg($body), helpers.delay(1000)]).then(function () {
        $body.removeClass('transparent');
      }, function () {
        $body.removeClass('transparent');
      });
      self.setSize();
      self.bindEvent();
      self.changeCaptcha($('#the_captcha'));
    },
    'bindEvent': function () {
      var self = this;
      $window.on('resize', function () {
        wW = $window.width();
        wH = $window.height();
        self.setSize()
      });
      $change_captcha.on('click', function () {
        self.changeCaptcha($('#the_captcha'));
      });
      $btn_register.on('click', function () {
        if(!$(this).hasClass('available')) {
          return false;
        }
        if ($(this).hasClass('error') || $(this).hasClass('processing')) {
          return false;
        }
        if(!helpers.getValueFromUrl('inviteCode')) {
          return location.replace('/page/others/inviteCode.html');
        }
        $btn_register.addClass('processing');
        //if (helpers.validateEmailAddr($input_email.val()) && helpers.validatePasswd($input_passwd.val()) && helpers.validatePasswd(self.data_of_form.password)) {
        if (true) {
          self.sendCredits({
            'data': JSON.stringify({
              email: helpers.validateEmailAddr($input_email.val()),
              password: helpers.validatePasswd($input_passwd.val()),
              confirm_password: helpers.validatePasswd($input_passwd.val()),
              vcode: $input_captcha.val(),
              vcode_id: $change_captcha.data('captcha-id'),
              inviteCode: helpers.getValueFromUrl('inviteCode')
            })
          }).then(function (result) {
            console.log('sendCredits() => ', result);
            $btn_register.removeClass('processing');
            self.redirectTo(result);
          }, function (status_code, msg) {
            alert(JSON.stringify(msg));
            self.changeCaptcha($('#the_captcha'));
            $input_captcha.val('');
            $btn_register.removeClass('processing');
          });
        }
      });
      $btn_submit_chosen_type.on('click', function () {
        console.log('jumpToForm(', $(this).data('chosen-type'), ')');
        return self.jumpToForm($(this).data('chosen-type'));
      });
      $('.type-of-apply').on('click', function () {
        console.log($(this).prop('id'));
        $btn_submit_chosen_type.data('chosen-type', $(this).prop('id')).addClass('available');
        $(this).addClass('chosen').siblings('.type-of-apply').removeClass('chosen');
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
      return helpers.$post(helpers.apis().registerStageOne, payload);
    },
    'jumpToForm': function (data) {
      console.log('jumpToForm(', data, ')');
      var gotoPage = function (page, param) {
        console.log('param', param);
        console.log(helpers.destination_pages[page]);
        return location.replace(page + param);
      };
      switch (data) {
        case 'type_student':
          console.log('type_student');
          gotoPage(helpers.destination_pages.page_register_form_type_individual, '?type=1');
          break;
        case 'type_individual':
          gotoPage(helpers.destination_pages.page_register_form_type_individual, '?type=2');
          break;
        case 'type_media':
          gotoPage(helpers.destination_pages.page_register_form_type_org, '?type=3');
          break;
        case 'type_enterprise':
          gotoPage(helpers.destination_pages.page_register_form_type_org, '?type=5');
          break;
        case 'type_bureau':
          console.log('未通过,去审核结果页');
          gotoPage(helpers.destination_pages.page_register_form_type_bureau, '?type=4');
          break;
        case 'type_other':
          gotoPage(helpers.destination_pages.page_register_form_type_org, '?type=6');
          break;
        default:
          console.log('ERROR: ', data);
      }
    },
    'redirectTo': function () {
      console.log('redirectTo(', helpers.destination_pages.page_activation_email_success_sent, ')');
      return location.replace(helpers.destination_pages.page_activation_email_success_sent + '?inviteCode=' + helpers.getValueFromUrl('inviteCode'));
    },
    'setSize': function () {
      $('#stage_one .has-account').css('height', $('#stage_one .form').height() + 'px');
    }
  };
})(jQuery, window.localStorage);
register_module.init();
var form = new Vue({
  el: 'body',
  data: function () {
    return {
      data_of_form: {
        email: '',
        passwd: '',
        repeat_passwd: '',
        captcha: '',
        check_agree_terms: false,
        email_inited: false,
        passwd_inited: false,
        repeat_passwd_inited: false,
        captcha_inited: false,
        check_agree_terms_inited: false
      }
    }
  },
  computed: {
    canSubmit: function () {
      return this.validateForm();
    }
  },
  methods: {
    validateForm: function () {
      console.log('validateForm()');
      var self = this;
      var obj = self.data_of_form;
      if (!helpers.validateEmailAddr(obj.email)) {
        if (obj.email_inited === true) {
          $('#input_email').siblings('.tip').addClass('show');
        }
        return false;
      } else {
        $('#input_email').siblings('.tip').removeClass('show');
      }
      if (!helpers.validatePasswd(obj.passwd)) {
        if (obj.passwd_inited === true) {
          if(obj.passwd.length < 8) {
            console.log('obj.passwd.length < 8');
            $('#input_passwd').siblings('.tip').text('密码长度至少8位').addClass('show');
          } else {
            console.log('else');
            $('#input_passwd').siblings('.tip').text('密码至少包含数字/字母/符号中的2种').addClass('show');
          }
        }
        return false;
      } else {
        $('#input_passwd').siblings('.tip').removeClass('show');
      }
      if (obj.passwd !== obj.repeat_passwd) {
        if (obj.repeat_passwd_inited === true) {
          $('#input_passwd_repeat').siblings('.tip').addClass('show');
        }
        return false;
      } else {
        $('#input_passwd_repeat').siblings('.tip').removeClass('show');
      }
      if (obj.captcha.length !== 4) {
        if (obj.captcha_inited === true) {
          $('#tip_for_captcha').addClass('show');
        }
        return false;
      } else {
        $('#tip_for_captcha').removeClass('show');
      }
      if (obj.check_agree_terms === false) {
        return false;
      }
      return true;
    },
    submit: function (evt) {
      var $btn = $(evt.target);
      if(!$btn.hasClass('available')) {
        return false;
      }
      if ($btn.hasClass('error') || $btn.hasClass('processing')) {
        return false;
      }
      $btn.addClass('processing');
    }
  }
});