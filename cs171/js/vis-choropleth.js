"use strict";

var ex = { // global namespace
  margin: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  },
  padding: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 40
  },
  aspect: 0.6 // chart height = aspect * width
};

// Be responsive
window.addEventListener("resize", function() {
  updateChoropleth();
  updateFundingChart("#funding-area", ex.fundingSrc);
}, false);

(function() {
  // Sink form events
  d3.select("#chart-type").on("change", updateChoropleth);
  ex.fundingSrc = document.getElementById("funding-source").value;
  d3.select("#funding-source").on("change", function() {
      ex.fundingSrc = document.getElementById("funding-source").value;
      document.getElementById("funding-title").innerHTML = ex.fundingSrc;
      updateFundingChart("#funding-area", ex.fundingSrc);
    })
    // Use the Queue.js library to read all the files
  queue()
    .defer(d3.csv, "data/global-malaria-2015.csv")
    .defer(d3.csv, "data/global-funding.csv")
    .defer(d3.json, "data/malaria-parasites.json")
    .defer(d3.json, "data/africa.topo.json")
    .defer(d3.csv, "data.csv") // Test data for stacked bar chart
    .await(function(error, malariaDataCsv, globalFundingCsv,
      malariaParasites, africaTopo, testData) {
      if (error) return console.error(error);

      // --> PROCESS DATA

      // Used with stacked bar test data:
      // barTest(testData);

      // Save topographical data in the application object
      ex.topoData = topojson.feature(africaTopo, africaTopo.objects.collection).features;

      // Keep only data for Africa
      malariaDataCsv = malariaDataCsv.filter(function(d) {
        return d.WHO_region == "African"
      });
      // Convert numeric values
      malariaDataCsv.forEach(function(d) {
        // Convert numerical values
        d.At_high_risk = parseInt(d.At_high_risk) || 0;
        d.At_risk = parseInt(d.At_risk) || 0;
        d.Malaria_cases = parseInt(d.Malaria_cases) || 0;
        d.Suspected_malaria_cases = parseInt(d.Suspected_malaria_cases) || 0;
        d.UN_population = parseInt(d.UN_population) || 0;
      });
      // Save it in the application object
      ex.malData = malariaDataCsv;

      // Process the global funding data for the second visualization
      // (see vis-second.js)
      processGlobalFunding(globalFundingCsv);

      // Draw choropleth the first time
      updateChoropleth();

      // Draw funding chart the first time
      updateFundingChart("#funding-area", ex.fundingSrc);

    });
})();

function updateChoropleth() {
  // --> Choropleth implementation

  // Remove any prior vis.
  // TODO: enter / exit / transitions would be better if time permits
  d3.select("#choropleth-area").selectAll("svg").remove();

  var chartType = document.getElementById("chart-type").value;

  // Create map of lookup values for this type of chart
  // Ref: https://bl.ocks.org/mbostock/4060606
  var valueById = d3.map();
  ex.malData.forEach(function(d) {
    valueById.set(d.Code, d[chartType]);
  });
  // --> CREATE SVG DRAWING AREA
  var outerWidth = $("#choropleth-area").width(), // resize based on screen width
    outerHeight = outerWidth * ex.aspect, // maintain aspect ratio
    innerWidth = outerWidth - ex.margin.left - ex.margin.right,
    innerHeight = outerHeight - ex.margin.top - ex.margin.bottom,
    width = innerWidth - ex.padding.left - ex.padding.right,
    height = innerHeight - ex.padding.top - ex.padding.bottom;

  var svg = d3.select("#choropleth-area").append("svg")
    .attr("width", outerWidth)
    .attr("height", outerHeight);

  // Color scale
  var color = d3.scale.quantize()
    .domain(d3.extent(ex.malData, function(d) {
      return d[chartType];
    }))
    .range(colorbrewer.Reds[9]);

  // Responsively scale map according according to page width
  var mapScale = $("#choropleth-area").width() > 600 ? 250 : 150;

  // Projection
  var projection = d3.geo.equirectangular()
    .rotate([0, 0])
    .center([30, 10])
    .scale(mapScale)
    .translate([width / 2, height / 2])
    .precision(10);

  var path = d3.geo.path()
    .projection(projection);

  // Legend
  // Ref:  Third party legend library http://d3-legend.susielu.com/
  var legFormat, legTitle;
  switch (chartType) {
    case "UN_population":
      legFormat = ",.0f";
      legTitle = "UN Population"
      break;
    case "At_risk":
      legFormat = ".0f";
      legTitle = "At Risk %";
      break;
    case "At_high_risk":
      legFormat = ".0f";
      legTitle = "At high risk %";
      break;
    case "Suspected_malaria_cases":
      legFormat = ",.0f";
      legTitle = "Suspected Cases";
      break;
    case "Malaria_cases":
      legFormat = ",.0f";
      legTitle = "Malaria Cases";
      break;
    default:
      legFormat = ",.0f";
      legTitle = "";
  }

  var legend = d3.legend.color()
    .labelFormat(d3.format(legFormat))
    .title(legTitle)
    .scale(color);

  // Draw the map, including tooltip
  svg.selectAll("path")
    .data(ex.topoData)
    .enter().append("path")
    .attr("class", "country")
    .attr("d", path)
    .style("fill", function(d) {
      return color(valueById.get(d.properties.adm0_a3_is) || 0);
    })
    .append("title")
    .text(function(d) {
      var s = d3.format(",.0f")(valueById.get(d.properties.adm0_a3_is));
      if (s == "NaN") s = "N/A";
      return d.properties.brk_name + " (" + s +  ")";
    });

  // Draw the legend
  // Legend will disappear on very narrow devices
  svg.append("g")
    .attr("transform", "translate(" + parseInt(450) + "," + parseInt(100) + ")")
    .call(legend);
}
