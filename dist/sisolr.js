var app = angular.module('Sisolr', ['ui.bootstrap','ui.bootstrap.datetimepicker', 'ngMessages']);
var server = 'http://31.220.58.75:8983',
    path = '/solr/core0';

function formatTgl(str) {
    var tgl = new Date(str);
    var format = {
        date: tgl.getDate(),
        month: tgl.getMonth() + 1,
        year: tgl.getFullYear(),
        hour: tgl.getHours(),
        minute: tgl.getMinutes(),
        second: tgl.getSeconds()
    }

    var _format = ['date', 'month', 'hour', 'minute', 'second'];
    _format.forEach(function(x) {
        if (format[x] < 10) format[x] = '0' + format[x];
    });

    return format.date + '/' + format.month + '/' + format.year + ' ' + format.hour + ':' + format.minute + ':' + format.second;
}

function _formatTgl2(str) {
    var tgl = new Date(str);
    var format = {
        date: tgl.getDate(),
        month: tgl.getMonth() + 1,
        year: tgl.getFullYear(),
        hour: tgl.getHours(),
        minute: tgl.getMinutes(),
        second: tgl.getSeconds()
    }

    var _format = ['date', 'month', 'hour', 'minute', 'second'];
    _format.forEach(function(x) {
        if (format[x] < 10) format[x] = '0' + format[x];
    });

    return format.year + '-' + format.month + '-' + format.date + 'T' + format.hour + ':' + format.minute + ':' + format.second+ 'Z';
}

app.controller('search', function($scope, $http) {
    var that = this,
        keyword = '';
    $scope.formatTgl = formatTgl;
    $scope.current = 0;
    $scope.currentNext = 0;
    $scope.currentPage = 1;
    $scope.pageLevel = 0;
    $scope.data = {};
    $scope.startDate = new Date();
    $scope.endDate = new Date();
    $scope.startDate.setMonth($scope.endDate.getMonth()-3);
    $scope.ngMessages = '';
    //Variable for form input in search//
    $scope.formSaverity = '';
    $scope.formHostname = '';
    $scope.formAddress = '';
    $scope.formUser = '';
    $scope.formMsg = '';

    this.dates = {
        date3: new Date(),
        date4: new Date(),
    };

    this.open = {
        date3: false,
        date4: false,
    };

    this.openCalendar = function(e, date) {
        that.open[date] = true;
    };

    function _getJSONP(start, cb) {
        $http.jsonp(server + path + '/select?q=*%3A*' + '&fq=timegenerated%3A['+ _formatTgl2($scope.startDate) +'+TO+'+ _formatTgl2($scope.endDate) +']'
          + keyword + '&start=' + start +'&rows=20&sort=timegenerated+desc&wt=json&json.wrf=JSON_CALLBACK')
            .then(function(json) {
                cb(json);
            });
    }

    function _view(json) {
        $scope.data = json.data;
        $scope.paging = [];

        $scope.current = Math.ceil(($scope.data.response.numFound - ($scope.pageLevel * 100)) / 100);
        $scope.currentNext = $scope.data.response.numFound - ($scope.pageLevel * 100);

        if ($scope.current < 21) {
            for (var i = $scope.pageLevel + 1; i <= ($scope.pageLevel + $scope.current); i++) {
                $scope.paging.push(i);
            }
        } else {
            for (var i = $scope.pageLevel + 1; i <= ($scope.pageLevel + 20); i++) {
                $scope.paging.push(i);
            }
        }
    }

    _getJSONP(0, _view);

    $scope.search = function() {
        $scope.pageLevel = 0;

        var diffStartDate = $scope.startDate.getTime(),
            diffEndDate = $scope.endDate.getTime();

        if(diffEndDate - diffStartDate > 0 ){
          keyword = '';
          if ($scope.formSaverity !== '') {
              keyword = keyword+'&fq=syslogpriority-text:' + $scope.formSaverity.toLowerCase();
          }
          if ($scope.formHostname !== '') {
              keyword = keyword+'&fq=hostname:' + $scope.formHostname.toLowerCase();
          }
          if ($scope.formAddress !== '') {
              keyword = keyword+'&fq=fromhost-ip:' + $scope.formAddress.toLowerCase();
          }
          if ($scope.formUser !== '') {
              keyword = keyword+'&fq=programname:' + $scope.formUser.toLowerCase();
          }
          if ($scope.formMsg !== '') {
              keyword = keyword+'&fq=msg:' + $scope.formMsg.toLowerCase();
          }
          _getJSONP(0, _view);
        }
    }

    $scope.now = function() {
        var date = new Date();

        var bulan = date.getMonth() + 1,
            tanggal = date.getDate();

        if ((date.getMonth() + 1) < 10) bulan = '0' + (date.getMonth() + 1);
        if ((date.getDate()) < 10) tanggal = '0' + (date.getDate());

        return date.getFullYear() + '-' + bulan + '-' + tanggal;
    }

    $scope.addQuery = function(query) {
        if (keyword === '' || keyword === '&fq=*:*') {
            keyword = '&fq='+query;
        } else {
            keyword = keyword + '&fq=' + query;
        }
    }

    $scope.goToPage = function(number) {
        $scope.currentPage = number;
        _getJSONP(100 * (number - 1), _view);
    }

    $scope.next = function() {
        $scope.pageLevel += 20;
        $scope.goToPage($scope.pageLevel + 1);
    }

    $scope.prev = function() {
        $scope.pageLevel -= 20;
        $scope.goToPage($scope.pageLevel + 1);
    }
});

app.controller('analisys', function($scope, $http) {
    $scope.data = {};

    var _ctx_color = ['rgb(33,150,243)', 'rgb(0,150,136)', 'rgb(205,220,57)', 'rgb(255,193,7)', 'rgb(121,85,72)', 'rgb(244,67,54)', 'rgb(156,39,176)'],
        _ctx_highlight = ['rgb(100,181,246)', 'rgb(77,208,225)', 'rgb(220,231,117)', 'rgb(255,213,79)', 'rgb(161,136,127)', 'rgb(229,115,115)', 'rgb(186,104,200)'];

    function _getJSONP(facet, cb) {
        $http.jsonp(server + path + '/select?q=*%3A*&rows=0&wt=json&facet=true&facet.field=' + facet + '&json.wrf=JSON_CALLBACK')
            .then(function(json) {
                cb(json);
            });
    }

    _getJSONP('syslogpriority-text', function(json) {
        var data = json.data.facet_counts.facet_fields['syslogpriority-text'],
            output = [];
        $scope.data = json.data;
        $scope.saverity = [];

        data.forEach(function(item, index) {
            if ((index + 1) % 2 !== 0) {
                output[index / 2] = {
                    value: data[index + 1],
                    color: _ctx_color[index % 6],
                    highlight: _ctx_highlight[index % 6],
                    label: item
                }
                $scope.saverity[index/2] = {
                    type : item,
                    count : data[index+1]
                }
            }
        });
        var ctx1 = document.getElementById("saverityDChart").getContext("2d");
        var saverityDChart = new Chart(ctx1).Doughnut(output);
    });

    _getJSONP('programname', function(json) {
        var data = json.data.facet_counts.facet_fields['programname'],
            output = [];
        $scope.user = [];

        data.forEach(function(item, index) {
            if ((index + 1) % 2 !== 0) {
                output[index / 2] = {
                    value: data[index + 1],
                    color: _ctx_color[index % 6],
                    highlight: _ctx_highlight[index % 6],
                    label: item
                }
                if ((index/2)<10) {
                  $scope.user[index/2]= {
                      name : item,
                      nameCount : data[index+1]
                  }
                }
            }
        });

        var ctx3 = document.getElementById("prognameDChart").getContext("2d");
        var prognameDChart = new Chart(ctx3).Doughnut(output);
    });

    _getJSONP('hostname', function(json) {
        var data = json.data.facet_counts.facet_fields['hostname'],
            output = [];
        $scope.host = [];

        data.forEach(function(item, index) {
            if ((index + 1) % 2 !== 0) {
                output[index / 2] = {
                    value: data[index + 1],
                    color: _ctx_color[index % 6],
                    highlight: _ctx_highlight[index % 6],
                    label: item
                }
                if ((index/2)<10) {
                  $scope.host[index/2]= {
                      hostname : item,
                      hostCount : data[index+1]
                  }
                }
            }
        });
        var ctx2 = document.getElementById("hostDChart").getContext("2d");
        var hostDChart = new Chart(ctx2).Doughnut(output);
    });

    _getJSONP('syslogpriority-text',function(json){
      var dataJson = json.data.facet_counts.facet_fields['syslogpriority-text'];
      var outputLabels = [],
          outputData = [],
          labels = [],
          data = [];

      dataJson.forEach(function(item, index){
        if((index+1)%2 !== 0){
          outputData[index/2] = dataJson[index+1];
          outputLabels[index/2] =item;
        }
      });

      var dataOutput = {
          labels:outputLabels,
          datasets:[
            {
              label: "Syslog Priority Text",
              fillColor: _ctx_color[(Math.floor((Math.random()*6)+1)) % 7],
              strokeColor: "rgba(220,220,220,0.8)",
              highlightFill: _ctx_highlight[(Math.floor((Math.random()*6)+1)) % 6],
              highlightStroke: "rgba(220,220,220,1)",
              data: outputData
            }
          ]
      };
      var ctxBar = document.getElementById("barChart").getContext("2d");
      var myBarChart= new Chart(ctxBar).Bar(dataOutput);
    });
});
