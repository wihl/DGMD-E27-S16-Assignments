"use strict";
// Uses ex global object defined in vis-choropleth.js

function processGlobalFunding(globalFundingCsv) {
  // Pivot the global funding data:
  //   Show the change in year-over-year funding rather absolute
  //   dollar amount
  var diffPerSource = [];
  var deltaFunding = d3.map();
  var m = d3.map(globalFundingCsv, function(d) {
    return d.Source;
  });
  // we don't need the totals and dollar format is inconsistent
  m.remove("Total");

  // Create a new datastructure
  // The resulting data structure is an object
  // where key: "funding source", value = [ {x/year: 2006, y/delta: -11},... ]
  m.forEach(function(d) {
    diffPerSource = [];
    for (var i = 2006; i < 2014; i++) {
      diffPerSource.push({
        x: i,
        y: (m.get(d)[i] - m.get(d)[i - 1])
      });
    }
    deltaFunding[d] = diffPerSource;
  });
  // Store the result in the global object
  ex.deltaFunding = deltaFunding;
}


function updateFundingChart(el,region) {
  // Upon resize, rebuild the visualization to be responsive
  d3.select(el).selectAll("svg").remove();

  // --> CREATE SVG DRAWING AREA
  var outerWidth = $(el).width(), // resize based on screen width
    outerHeight = outerWidth * ex.aspect, // maintain aspect ratio
    innerWidth = outerWidth - ex.margin.left - ex.margin.right,
    innerHeight = outerHeight - ex.margin.top - ex.margin.bottom,
    width = innerWidth - ex.padding.left - ex.padding.right,
    height = innerHeight - ex.padding.top - ex.padding.bottom;

  var svg = d3.select(el).append("svg")
    .attr("width", outerWidth)
    .attr("height", outerHeight);

  // Scales
  var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], 0.05);

  var y = d3.scale.linear()
    .rangeRound([height, 0]);

  // Axes
  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

  // Container
  var g = svg.append("g")
    .attr("width", width + ex.padding.left + ex.padding.right)
    .attr("height", height + ex.padding.top + ex.padding.bottom)
    .append("g")
    .attr("transform", "translate(" + ex.padding.left + "," + ex.padding.top + ")");
  /*
   ALL THIS COMMENTED CODE IS RELATED TO STACK BAR WITH NEGATIVE VALUES

   So I wasted about 10 hours trying to get a stacked bar chart with
   negative values to work. It is not built into D3 as per the github
   issue below. There are workarounds on the Internet.

   I tried this https://github.com/mbostock/d3/issues/2265
   and this: http://stackoverflow.com/questions/18644946/d3-js-stacked-bar-chart-with-positive-and-negative-values
   and this: https://bl.ocks.org/micahstubbs/a40254b6cb914018ff81
   as well as my own solution (shown below).

   But none worked for all conditions.

   That's why the resulting bar chart for funding is a dropdown
   rather than stacked.

   Here's my code:
    var layers = d3.layout.stack()(ex.deltaFunding);

    // For different color values of each bar stack
    var z = d3.scale.category10();

    rescaleLayers(layers);

    x.domain(layers[0].map(function(d) { return d.x; }));
    y.domain(d3.extent(layers[layers.length - 1], function(d) { return d.y0 + d.y; }));

    var layer = svg.selectAll(".layer")
        .data(layers)
      .enter().append("g")
        .attr("class", "layer")
        .style("fill", function(d, i) { return z(i); });

        layer.selectAll("rect")
        .data(function(d) { return d; })
      .enter().append("rect")
        .attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) {
          return (d.y0+d.y) < 0 ? y(d.y0) :
                           y(d.y + d.y0);
        })
        .attr("height", function(d) {
          return (d.y0 + d.y) < 0 ? Math.abs(y(d.y0) - y(d.y + d.y0)) :
                            y(d.y0) - y(d.y + d.y0);
        })
        .attr("width", x.rangeBand() - 1)
            .append("title")
              .text(function(d) {
                return "y0:"+d.y0+" y:"+d.y;
              });
   Back to the working code for a single bar chart...
  */
  x.domain(ex.deltaFunding[region].map(function(d) {
      return d.x;
    }));
  y.domain(d3.extent(ex.deltaFunding[region].map(function(d) {
      return d.y;
    })))

  var bar = g.selectAll(".bar")
    .data(ex.deltaFunding[region])
    .enter().append("rect")
    .attr("class", "bar")
    .attr("y", function(d) {
      return y(Math.max(d.y, 0));
    })
    .attr("x", function(d) {
      return x(d.x);
    })
    .attr("height", function(d) {
      return Math.abs(y(d.y) - y(0));
    })
    .attr("width", x.rangeBand())
    .append("title")
    .text(function(d) {
      return d3.format("$,.0f")(d.y);
    });;

  // Display axes
  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + y(0) + ")")
    .call(xAxis);

  g.append("g")
    .attr("class", "axis axis--y")
    .call(yAxis);
}

/*
 * More cruft from attempting the stacked bar with negative
 * values
 */
function rescaleLayers(layers) {
  // handle error in d3 layers with a mix of positive and negative values
  // go through each point
  // Inspired by // Ref: https://github.com/mbostock/d3/issues/2265
  // (which did not work for me)
  var negOffset, posOffset;
  for (var point = 0; point < layers.length; point++) {
    // examine all values at that point
    negOffset = 0;
    posOffset = 0;
    for (var i = 0; i < layers[0].length; i++) {
      var y = layers[point][i].y;
      var y0 = layers[point][i].y0
      if ((y * y0) < 0) {
        // there has been an unexpected change in sign. Fix it
        if (y0 < 0 && y > 0) {
          layers[point][i].y0 = posOffset;
          console.log("+offset was:" + posOffset + " now:" + parseInt(posOffset + y0));
          posOffset += y0
        } else if (y0 > 0 && y < 0) {
          layers[point][i].y0 = negOffset;
          console.log("-offset was:" + negOffset + " now:" + parseInt(negOffset - y0));
          negOffset -= y0;
        }
      }
    }
  }
}

// Test data for stacked bar chart
function barTest(data) {
  data.forEach(function(d) {
    d.x = +d.x;
    d.a = +d.a;
    d.b = +d.b;
    d.c = +d.c;
  });
  var arr = ['a', 'b', 'c'].map(function(c) {
    return data.map(function(d) {
      return {
        x: d.x,
        y: d[c]
      };
    })
  });
  ex.deltaFunding = arr;
  updateFundingChart();
}
