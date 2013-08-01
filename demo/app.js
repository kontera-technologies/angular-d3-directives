'use strict';

angular.module('demo', ['ui.bootstrap', 'd3.directives.gauge'])
  .controller('GaugeCtrl', function($scope, $log) {
    var valueGenerator = function(model, delay, interval, base, range) {
      setTimeout(function () {
        var cancel = setInterval(function () {
          $scope.$apply(function () {
            $scope[model] = base + Math.round(Math.random() * range);
          });
        }, interval);
        $scope.$on("$destroy", function () {
          $log.log("Canceling valueGenerator for [" + model + "]");
          clearInterval(cancel);
        });
      }, delay);
    };

    valueGenerator("gauge0_value", 0, 1000, 30, 30);
    valueGenerator("gauge1_value", 300, 1000, 40, 30);
    valueGenerator("gauge2_value", 600, 1000, 50, 30);
  });
