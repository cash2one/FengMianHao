var dashboard = new Vue({
  el: 'body',
  data: function () {
    return {
      data_of_page: {}
    }
  },
  methods: {
    getDataOfPage: function () {
      return helpers.$post(helpers.apis().getIndexPage, {
        'data': JSON.stringify({
          'start': 1,
          'size': 20
        })
      });
    }
  },
  created: function () {
    var self = this;
    var renderPage = function () {
      console.log('renderPage()');
      return self.getDataOfPage().then(function (res) {
        console.log('getDataOfPage() => ', JSON.stringify(res));
        self.data_of_page = res;
      });
    };
    renderPage();
  }
});