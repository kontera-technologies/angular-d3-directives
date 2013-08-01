'use strict';

angular.module('demo', ['ui.bootstrap', 'd3.directives.gauge'])
  .controller('GaugeCtrl', function($scope) {
    setTimeout(function () {
      setInterval(function () {
        $scope.$apply(function () {
          $scope.gauge0_value = 30 + Math.round(Math.random() * 30);
        });
      }, 1000);
    }, 0);
    setTimeout(function () {
      setInterval(function () {
        $scope.$apply(function () {
          $scope.gauge1_value = 40 + Math.round(Math.random() * 30);
        });
      }, 1000);
    }, 300);
    setTimeout(function () {
      setInterval(function () {
        $scope.$apply(function () {
          $scope.gauge2_value = 50 + Math.round(Math.random() * 30);
        });
      }, 1000);
    }, 600);
  });
