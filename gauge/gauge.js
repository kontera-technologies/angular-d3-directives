'use strict';

// adopted from here: http://jsfiddle.net/mr23/vJuNU/

angular.module('d3.directives.gauge', [])
  .directive('gauge', function () {
  return {
    restrict: 'E',
    scope: {
      val: '@',
      displayFormatter: '&',
      greenZones: '=',
      yellowZones: '=',
      redZones: '='
    },
    link: function(scope, element, attrs) {
      var config = {};

      config.label = attrs.label;

      config.size = attrs.size * 0.9;

      config.radius = config.size * 0.97 / 2;
      config.cx     = config.size / 2;
      config.cy     = config.size / 2;

      config.min   = attrs.min || 0;
      config.max   = attrs.max || 100;
      config.range = config.max - config.min;

      config.majorTicks = attrs.majorTicks || 5;
      config.minorTicks = attrs.minorTicks || 2;

      config.bezelColor     = attrs.bezelColor     || "#EEEEEE";
      config.greenColor     = attrs.greenColor     || "#107618";
      config.yellowColor    = attrs.yellowColor    || "#FFC900";
      config.redColor       = attrs.redColor       || "#EC4922";
      config.faceColor      = attrs.faceColor      || "#EEEEEE";
      config.lightColor     = attrs.lightColor     || "#EEEEEE";
      config.greyColor      = attrs.greyColor      || "#101010";
      config.lightBlueColor = attrs.lightBlueColor || "#6085A0";

      var body = d3.select(element[0])
        .append("svg:svg")
        .attr("class", "gauge")
        .attr("width", config.size)
        .attr("height", config.size);

      var render = function () {
        console.log("Rendering " + config.label);
        body.append("svg:circle") // outer shell
          .attr("cx", config.cx)
          .attr("cy", config.cy)
          .attr("r", config.radius)
          .style("fill", "#ccc")
          .style("stroke", "#000000")
          .style("stroke-width", "0.5px");
        body.append("svg:circle") // bezel
          .attr("cx", config.cx)
          .attr("cy", config.cy)
          .attr("r", 0.9 * config.radius)
          .style("fill", config.bezelColor)
          .style("stroke", "#E0E0E0")
          .style("stroke-width", "2px");

        body.append("svg:g").attr("class", "faceContainer");
        body.append("svg:g").attr("class", "bandsContainer");
        body.append("svg:g").attr("class", "ticksContainer");

        drawFace(config.faceColor, config.greyColor);

        body.append("svg:g").attr("class", "pointerContainer");
        drawPointer(0);
        body.selectAll(".pointerContainer").append("svg:circle")
          .attr("cx", config.cx)
          .attr("cy", config.cy)
          .attr("r", 0.12 * config.radius)
          .style("fill", "#4684EE")
          .style("stroke", "#666")
          .style("opacity", 1);
      };

      var drawFace = function(colorFace, colorTicks) {
        var arc0 = d3.svg.arc()
          .startAngle(0)
          .endAngle(2 * Math.PI)
          .innerRadius(0.0 * config.radius)
          .outerRadius(0.9 * config.radius);

        var faceContainer    = body.selectAll(".faceContainer");
        var bandsContainer   = body.selectAll(".bandsContainer");
        var ticksContainer   = body.selectAll(".ticksContainer");
        var pointerContainer = body.selectAll(".pointerContainer");

        if (faceContainer.selectAll("path").empty()) {
          faceContainer.append("svg:path")
            .attr("d", arc0)
            .style("fill", colorFace)
            .style("fill-opacity", 0.7)
            .attr("transform", "translate(" + config.cx + "," + config.cy + ")");

          drawBands(bandsContainer);
          drawTicks(ticksContainer, colorTicks);

          var fontSize = Math.round(config.size / 9);
          faceContainer.append("svg:text")
            .attr("x", config.cx)
            .attr("y", config.cy - config.size / 6 - fontSize / 2)
            .attr("dy", fontSize / 2)
            .attr("text-anchor", "middle")
            .text(config.label)
            .style("font-size", fontSize + "px")
            .style("fill", colorTicks)
            .style("stroke-width", "0px");
        } else {
          faceContainer.selectAll("path").style("fill", colorFace);
          faceContainer.selectAll("text").style("fill", colorTicks);
          pointerContainer.selectAll("text").style("fill", colorTicks);
          ticksContainer.selectAll("line").style("stroke", colorTicks);
          ticksContainer.selectAll("text").style("fill", colorTicks);
        }
      };

      var drawPointer = function(value) {
        var delta = config.range / 13;

        var head  = valueToPoint(value, 0.85);
        var head1 = valueToPoint(value - delta, 0.12);
        var head2 = valueToPoint(value + delta, 0.12);

        var tailValue = value - (config.range * (1 / (270 / 360)) / 2);
        var tail      = valueToPoint(tailValue, 0.28);
        var tail1     = valueToPoint(tailValue - delta, 0.12);
        var tail2     = valueToPoint(tailValue + delta, 0.12);

        var data = [head, head1, tail2, tail, tail1, head2, head];

        var line = d3.svg.line()
          .x(function(d) { return d.x; })
          .y(function(d) { return d.y; })
          .interpolate("basis");

        var pointerContainer = body.selectAll(".pointerContainer");

        var pointer = pointerContainer.selectAll("path").data([data]);
        pointer.enter()
          .append("svg:path")
          .attr("d", line)
          .style("fill", "#DC3912")
          .style("stroke", "#C63310")
          .style("fill-opacity", 0.7);
        pointer.transition().attr("d", line).duration(500);

        var fontSize = Math.round(config.size / 10);
        var displayVal = scope.displayFormatter ? scope.displayFormatter(value) : Math.round(value);
        pointerContainer.selectAll("text")
          .data([value])
          .text(displayVal)
          .enter()
          .append("svg:text")
          .attr("x", config.cx)
          .attr("y", config.cy)
          .attr("dy", fontSize / 2 + config.size / 3)
          .attr("text-anchor", "middle")
          .text(displayVal)
          .style("font-size", fontSize + "px")
          .style("fill", "#000")
          .style("stroke-width", "0px");
      };

      var drawBands = function(bandsContainer) {
        _.each(scope.greenZones, function(zone) {
          drawBand(bandsContainer, zone.from, zone.to, config.greenColor);
        });
        _.each(scope.yellowZones, function(zone) {
          drawBand(bandsContainer, zone.from, zone.to, config.yellowColor);
        });
        _.each(scope.redZones, function(zone) {
          drawBand(bandsContainer, zone.from, zone.to, config.redColor);
        });
      };

      var drawBand = function(bandsContainer, start, end, color) {
        if ((end - start) <= 0) return;

        var arc = d3.svg.arc()
          .startAngle(valueToRadians(start))
          .endAngle(valueToRadians(end))
          .innerRadius(0.70 * config.radius)
          .outerRadius(0.85 * config.radius);

        bandsContainer.append("svg:path")
          .style("fill", color)
          .attr("d", arc)
          .attr("transform",
                "translate(" + config.cx + "," + config.cy + ") rotate(270)");
      };

      var drawTicks = function(ticksContainer, color) {
        var fontSize   = Math.round(config.size / 16);
        var majorDelta = config.range / (config.majorTicks - 1);
        for (var major = config.min; major <= config.max; major += majorDelta) {
          var minorDelta = majorDelta / config.minorTicks;
          for (var minor = major + minorDelta;
               minor < Math.min(major + majorDelta, config.max);
               minor += minorDelta) {
            var minorPoint1 = valueToPoint(minor, 0.75);
            var minorPoint2 = valueToPoint(minor, 0.85);

            ticksContainer.append("svg:line")
              .attr("x1", minorPoint1.x)
              .attr("y1", minorPoint1.y)
              .attr("x2", minorPoint2.x)
              .attr("y2", minorPoint2.y)
              .style("stroke", color)
              .style("stroke-width", "1px");
          }

          var majorPoint1 = valueToPoint(major, 0.7);
          var majorPoint2 = valueToPoint(major, 0.85);

          ticksContainer.append("svg:line")
            .attr("x1", majorPoint1.x)
            .attr("y1", majorPoint1.y)
            .attr("x2", majorPoint2.x)
            .attr("y2", majorPoint2.y)
            .style("stroke", color)
            .style("stroke-width", "2px");

          if (major == config.min || major == config.max) {
            var point = valueToPoint(major, 0.63);

            ticksContainer.append("svg:text")
              .attr("x", point.x)
              .attr("y", point.y)
              .attr("dy", fontSize / 3)
              .attr("text-anchor", major == config.min ? "start" : "end")
              .text(major)
              .style("font-size", fontSize + "px")
              .style("fill", color)
              .style("stroke-width", "0px");
          }
        }
      };

      var redraw = function(value) {
        drawPointer(value);
      };

      var valueToPoint = function(value, factor) {
        var len       = config.radius * factor;
        var inRadians = valueToRadians(value);

        var point = {
          x: config.cx - len * Math.cos(inRadians),
          y: config.cy - len * Math.sin(inRadians)
        };

        return point;
      };

      var valueToRadians = function(value) {
        return valueToDegrees(value) * Math.PI / 180;
      };

      var valueToDegrees = function(value) {
        return value / config.range * 270 - 45;
      };

      render();

      scope.$watch('val', function(newVal, oldVal) {
        if (newVal) {
          redraw(Number(newVal));
        }
      });
    }
  };
});
