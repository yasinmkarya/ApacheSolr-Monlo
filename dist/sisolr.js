var app = angular.module('Sisolr', []);
var server = 'http://10.14.211.5:8983',
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

app.controller('search', function($scope, $http) {
    $scope.formatTgl = formatTgl;
    $scope.current = 0;
    $scope.currentNext = 0;
    $scope.currentPage = 1;
    $scope.pageLevel = 0;
    $scope.data = {};
    $scope.keyword = '&fq=*:*';

    function _getJSONP(start, cb) {
        $http.jsonp(server + path + '/select?q=*%3A*' + $scope.keyword + '&start=' + start + '&rows=100&sort=timegenerated+desc&wt=json&json.wrf=JSON_CALLBACK')
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
        $scope.goToPage($scope.pageLevel + 1);
        if ($scope.keyword === '') {
            $scope.keyword = '&fq=*:*';
            _getJSONP(0, _view);
        } else {
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
        if ($scope.keyword === '' || $scope.keyword === '&fq=*:*') {
            $scope.keyword = '&fq='+query;
        } else {
            $scope.keyword = $scope.keyword + '&fq=' + query;
        }
    }

    $scope.goToPage = function(number) {
        $scope.currentPage = number;
        if ($scope.keyword === '') $scope.keyword = '&fq=*:*';
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
