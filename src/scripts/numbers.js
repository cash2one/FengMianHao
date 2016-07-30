var numbers_module = (function ($, LS) {
  var $window = $(window);
  var $body = $('body');
  var wW = $window.width();
  var wH = $window.height();
  var $input_email = $('#input_email');
  var $input_passwd = $('#input_passwd');
  var $btn_login = $('#btn_login');
  return {
    'init': function () {
      var self = this;
      $('#content').height(wH);
      self.bindEvent();
    },
    'bindEvent': function () {
      var self = this;
    }
  };
})(jQuery, window.localStorage);
numbers_module.init();