function buildCalendarViewGraph() {

  var width = defaultConfig.largeGraphWidth,
    height = 136,
    cellSize = 16; // cell size

  var day = d3.time.format("%w"),
    week = d3.time.format("%U"),
    format = d3.time.format("%Y-%m-%d");

  color = d3.scale.quantize()
    .domain([0, 10])
    .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));

  var data = rawData.messagesByDay;
  var data_a = {};

  var minYear = 3145;
  var maxYear = 1988;
  var maxValue = 0;

  _.each(data, function (d) {
    // data_a.push({key: d.date.format("YYYY-MM-DD"), values: d.num_messages});
    data_a[d.date.format("YYYY-MM-DD")] = {key: d.date.format("YYYY-MM-DD"), values: d.num_messages};
    minYear = Math.min(minYear, d.date.year());
    maxYear = Math.max(maxYear, d.date.year());
    maxValue = Math.max(maxValue, d.num_messages);
  });

  var calendarChart = d3.select("#calendarViewSvg").selectAll("svg")
    .data(d3.range(minYear, maxYear + 1))
  .enter().append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "YlGn")
  .append("g")
    .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

  calendarChart.append("text")
    .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
    .style("text-anchor", "middle")
    .text(function(d) { return d; });

  var rect = calendarChart.selectAll(".day")
    .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  .enter().append("rect")
    .attr("class", "calendarView day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function(d) { return week(d) * cellSize; })
    .attr("y", function(d) { return day(d) * cellSize; })
    .datum(format);
  
  rect.append("title")
    .text(function(d) { return d; });

  calendarChart.selectAll(".month")
    .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  .enter().append("path")
    .attr("class", "calendarView month")
    .attr("d", monthPath);
  
  rect.filter(function (d) { return d in data_a; })
    .attr("class", function (d) { 
      return "calendarView day " + color(Math.round( (data_a[d].values / maxValue) * 8 )); });

  //  Tooltip Object
    var tooltip = d3.select("body")
      .append("div")
      .attr("id", "calendarViewTooltip")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .text("a simple tooltip");

  //  Tooltip
  rect.on("mouseover", mouseover);
  rect.on("mouseout", mouseout);
  
  function mouseover(d) {
    tooltip.style("visibility", "visible");

    if (typeof data_a[d] !== 'undefined') {
      tooltip.transition()        
        .duration(200)      
        .style("opacity", .9);      
      tooltip.html("<div class='well'>" + d + "<span>Messages: " + data_a[d].values + "</span></div>")  
        .style("left", (d3.event.pageX)+30 + "px")     
        .style("top", (d3.event.pageY) + "px"); 
    }

  }
  function mouseout (d) {
    tooltip.transition()        
            .duration(500)      
            .style("opacity", 0); 
    var $tooltip = $("#calendarViewTooltip");
    $tooltip.empty();
  }

  function monthPath(t0) {
    var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
        d0 = +day(t0), w0 = +week(t0),
        d1 = +day(t1), w1 = +week(t1);
    return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
        + "H" + w0 * cellSize + "V" + 7 * cellSize
        + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
        + "H" + (w1 + 1) * cellSize + "V" + 0
        + "H" + (w0 + 1) * cellSize + "Z";
  };
};