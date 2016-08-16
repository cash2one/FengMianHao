window.helpers = (function ($, LS) {
  var CONFIG = {
    API_BASE_URL: 'http://170.240.110.30:8080' //盖卵
    //API_BASE_URL: 'http://170.240.110.120:8181' //韩卵
    //API_BASE_URL: 'http://170.240.110.243:80' //李卵
    //API_BASE_URL: 'http://170.240.110.21:8090'     //steven
  };
  $.material.init();
  return {
    'CONFIG': CONFIG,
    apis: function () {
      return {
        'userLogin': CONFIG.API_BASE_URL + '/user/auth', // 首页--登录
        'getCaptcha': CONFIG.API_BASE_URL + '/login/getVCode', // 获取验证码
        'checkInviteCode': CONFIG.API_BASE_URL + '/login/checkInviteCode', // 验证邀请码
        'registerStageOne': CONFIG.API_BASE_URL + '/login/register', // 注册--第一步,提交邮箱&密码
        'registerStageTwo': CONFIG.API_BASE_URL + '/login/getVCode', // 注册--第二步,选择类型
        'registerStageThree': CONFIG.API_BASE_URL + '/user/checkIn', // 注册--第三步,提交某类型的表单
        'getChannelList': CONFIG.API_BASE_URL + '/login/getChannelList', // 注册--第三步,获取领域列表
        'getProvinceList': CONFIG.API_BASE_URL + '/common/province', // 注册--第三步,获取省市列表
        'getNotifications': CONFIG.API_BASE_URL + '/notice/list', // 通知中心--获取所有通知的列表
        'postReadNotice': CONFIG.API_BASE_URL + '/notice/detail', // 通知中心--置某条未读通知为已读状态
        'resetPassword': CONFIG.API_BASE_URL + '/login/resetPassword', // 重置密码
        'sendEmail': CONFIG.API_BASE_URL + '/login/sendEmail', // 发送验证邮件
        'getIndexPage': CONFIG.API_BASE_URL + '/index', // 获取首页数据
        'getAccountInfo': CONFIG.API_BASE_URL + '/user/getUserInfo', // 获取账号资料
        'updateAccountInfo': CONFIG.API_BASE_URL + '/user/updateUserInfo' // 修改账号资料
      };
    },
    'destination_pages': {
      'page_choose_type': '/login/stage2',
      'page_dashboard': '/',
      'page_review_result': '/login/reviewResult',
      'page_register_form_type_bureau': '/login/formBureau',
      'page_register_form_type_individual': '/login/formIndividual',
      'page_register_form_type_org': '/login/formOrg',
      'page_user_agreement': '/page/others/user_agreement.html',
      'page_activation_email_success_sent': '/page/others/activation_email_success_sent.html'
    },
    'LIST_OF_TARGET_READERS': [
      {
        'id': 1,
        'name': "球迷"
      }, {
        'id': 2,
        'name': "八卦神探"
      }, {
        'id': 3,
        'name': "学生党"
      }, {
        'id': 4,
        'name': "影音控"
      }, {
        'id': 5,
        'name': "极客范儿"
      }, {
        'id': 6,
        'name': "文艺青年"
      }, {
        'id': 7,
        'name': "吃货"
      }, {
        'id': 8,
        'name': "旅游达人"
      }, {
        'id': 9,
        'name': "购物狂"
      }, {
        'id': 10,
        'name': "运动达人"
      }, {
        'id': 11,
        'name': "商界精英"
      }, {
        'id': 12,
        'name': "游戏玩家"
      }, {
        'id': 13,
        'name': "居家能手"
      }, {
        'id': 14,
        'name': "社会观察员"
      }, {
        'id': 15,
        'name': "时尚潮人"
      }, {
        'id': 16,
        'name': "理财达人"
      }, {
        'id': 17,
        'name': "养生达人"
      }, {
        'id': 18,
        'name': "汽车迷"
      }
    ],
    'LIST_OF_APPLICANT_TYPE': [
      '',
      '学生',
      '个人',
      '媒体',
      '国家机关',
      '企业',
      '其他组织'
    ],
    'TYPE_OF_APPLICANT': [
      {
        'type_name': 'type_student',
        'desc': '学生',
        'type_no': 1
      }, {
        'type_name': 'type_individual',
        'desc': '个人',
        'type_no': 2
      }, {
        'type_name': 'type_media',
        'desc': '媒体',
        'type_no': 3
      }, {
        'type_name': 'type_bureau',
        'desc': '国家机关',
        'type_no': 4
      }, {
        'type_name': 'type_enterprise',
        'desc': '企业',
        'type_no': 5
      }, {
        'type_name': 'type_other',
        'desc': '其他',
        'type_no': 6
      }
    ],
    getValueFromUrl: function (name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      var r = window.location.search.substr(1).match(reg);
      if (r != null) return unescape(r[2]);
      return null;
    },
    '$post': function (url, data) {
      var $d = jQuery.Deferred();
      $.ajax({
        type: 'POST',
        url: url,
        data: data,
        dataType: 'json',
        success: function (result) {
          if (parseInt(result.status) === 0 || parseInt(result.status) === 200) {
            $d.resolve(result.data);
          } else {
            $d.reject(result.status, result.message, result.data);
          }
        },
        error: function (xhr, type) {
          $d.reject(444, '网络请求失败~');
        }
      });
      return $d.promise();
    },
    '$get': function (url, data) {
      var $d = jQuery.Deferred();
      $.ajax({
        type: 'GET',
        url: url,
        data: data,
        dataType: 'json',
        success: function (result) {
          console.log('$get() success => ', result);
          if (parseInt(result.status) === 0 || parseInt(result.status) === 200) {
            $d.resolve(result.data);
          } else {
            $d.reject('网络请求失败~');
          }
        },
        error: function (xhr, type) {
          $d.reject('网络请求失败~');
        }
      });
      return $d.promise();
    },
    'setBackgroundImg': function ($container) {
      var d = $.Deferred();
      var $tempImg = $('<img>');
      $tempImg.prop('src', $container.data('img'));
      $tempImg.on('load', function () {
        d.resolve($container.css('background-image', 'url(' + $container.data('img') + ')'));
      });
      $tempImg.on('error', function () {
        d.reject($container);
      });
      return d.promise();
    },
    'delay': function (time) {
      var d = $.Deferred();
      setTimeout(function () {
        d.resolve();
      }, time);
      return d.promise();
    },
    'validateEmailAddr': function (input) {
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(input) ? input : false;
    },
    'validatePasswd': function (input) {
      var re = /^(?!^\\d+$)(?!^[a-zA-Z]+$)(?!^[_#@]+$).{8,32}$/; // copy自后台
      if (input.length < 1) {
        return false;
      }
      return re.test(input) ? input : false;
    },
    'checkItemIsEmptyStr': function (arr) {
      console.log('checkItemIsEmptyStr(', arr, ')');
      var i;
      for (i = 0; i < arr.length; ++i) {
        if ((arr[i] + '').trim().length === 0) {
          return true;
        }
      }
      return false
    },
    'VueFilters': function () {
      Vue.filter('formatDate', function (value) {
        var date = new Date(value);
        return date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate() + '  ' + date.getHours() + ':' + date.getMinutes()
      })
    }
  };
})(jQuery, window.localStorage);