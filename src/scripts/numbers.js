var numbers = new Vue({
  el: 'body',
  data: function () {
    return {
      data_of_page: {},
      view_mode: 'chart',
      curr_page_of_user_news: 1,
      page_size: 8,
      pages_num: 0
    }
  },
  methods: {
    getDailyStatistics: function () {
      console.log('getDailyStatistics()');
      return helpers.$post(helpers.apis().getDailyStatistics, {
        //            return helpers.$get('http://170.240.110.245:9999/getDailyStatistics.json', {
        'data': JSON.stringify({})
      });
    },
    getUserNews: function () {
      console.log('getUserNews()');
      var self = this;
      return helpers.$post(helpers.apis().getUserNews, {
        //            return helpers.$get('http://170.240.110.245:9999/getUserNews.json', {
        'data': JSON.stringify({
          'page': self.curr_page_of_user_news,
          'pageSize': self.page_size
        })
      });
    },
    toggleViewMode: function (evt) {
      var self = this;
      var $target = $(evt.target);
      if ($target.hasClass('active')) {
        return evt.preventDefault();
      }
      if (self.view_mode === 'chart') {
        return self.view_mode = 'list';
      } else {
        return self.view_mode = 'chart';
      }
    },
    drawChart: function (obj) {
      console.log('revealChart()');
      var chart_dailyStatistics = echarts.init(document.getElementById('chart_container'));
      var xAxis_data_arr = [];
      var series_data_amountAdd_arr = [];
      var series_data_amountCancel_arr = [];
      var series_data_amountTotal_arr = [];
      $.each(obj, function (idx, val) {
        xAxis_data_arr.push(val.dateStr);
        series_data_amountAdd_arr.push(val.amountAdd);
        series_data_amountCancel_arr.push(val.amountCancel);
        series_data_amountTotal_arr.push(val.amountTotal);
      });
      var data = {
        title: {
          text: '趋势'
        },
        tooltip: {
          trigger: 'axis',
          position: function (pt) {
            return [pt[0], '10%'];
          }
        },
        legend: {
          data: ['新增订阅数', '取消订阅数', '累计订阅用户数']
        },
        grid: {
          left: '2%',
          right: '2%',
          bottom: '2%',
          containLabel: true
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xAxis_data_arr
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '新增订阅数',
            type: 'line',
            stack: '总量',
            data: series_data_amountAdd_arr
          },
          {
            name: '取消订阅数',
            type: 'line',
            stack: '总量',
            data: series_data_amountCancel_arr
          },
          {
            name: '累计订阅用户数',
            type: 'line',
            stack: '总量',
            data: series_data_amountTotal_arr
          }
        ]
      };
      chart_dailyStatistics.setOption(data);
    },
    pagenation: function (evt) {
      var self = this;
      var $target = $(evt.target);
      if ($target.closest('li').hasClass('active') || $target.closest('li').hasClass('disabled')) {
        return evt.preventDefault();
      }
      if ($target.closest('li').hasClass('prev')) {
        self.curr_page_of_user_news = Math.max(1, self.curr_page_of_user_news - 1);
      } else if ($target.closest('li').hasClass('next')) {
        self.curr_page_of_user_news = Math.min(self.pages_num, self.curr_page_of_user_news + 1);
      } else {
        self.curr_page_of_user_news = parseInt($target.text());
      }
      return self.getUserNews();
    }
  },
  created: function () {
    var self = this;
    var renderPage = function () {
      console.log('渲染页面()');
      return $.when(self.getDailyStatistics(), self.getUserNews()).done(function (v1, v2) {
        self.data_of_page = v1;
        self.data_of_page.news = v2.news;
        self.pages_num = Math.ceil(parseInt(self.data_of_page.news.allCapacity) / self.page_size);
        console.log('文章阅读量总页数: ', self.pages_num);
        self.drawChart(self.data_of_page.dailyStatistics);
        $('#main').removeClass('transparent');
      });
    };
    renderPage();
  }
});