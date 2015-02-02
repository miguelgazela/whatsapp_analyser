function buildScatterplotMessagesByHour() {
  var conf = getSvgConf(defaultConfig.largeGraphWidth, defaultConfig.mediumGraphHeight, 20, 40, 30, 40);
  var color = getColorScale();

  var x = d3.time.scale()
    .rangeRound([0, conf.width])
    .domain([new Date(0, 0, 0, 0, 0, 0), new Date(0, 0, 0, 23, 59, 59)]);

  var y = d3.scale.linear()
    .range([conf.height, 0]);

  var xAxis = getSimpleAxis(x, "bottom");
  var yAxis = getSimpleAxis(y, "left");

  xAxis.scale(x)
    .ticks(d3.time.hour,1)
    .tickFormat(d3.time.format("%Hh"));

  var scatterplotChart = getSvgAddedTo("#scatterplotMessageByHour", conf);

  var raw_data = JSON.parse(document.getElementById('daysByUser').innerHTML);
  var data = {};

  _.each(Object.keys(raw_data), function (user) {

    _.each(raw_data[user], function (d) {
      var time = d.substr(11, 8);
      var hour = time.substr(0, 2);
      var minute = time.substr(3, 2);
      var second = time.substr(6, 2);

      var key = time.substr(0, 5);

      if (data.hasOwnProperty(key)) {
        data[key].count += 1;
      } else {
        data[key] = {date: new Date(0, 0, 0, hour, minute, second), count: 1};
      }
    });

  });

  var data_a = [];
  _.each(Object.keys(data), function (time) {
    data_a.push({date: data[time].date, count: data[time].count});
  });

  var maxNumMessages = _.max(data_a, function (d) { return d.count; }).count;

  y.domain([0, maxNumMessages]);

  data_a.sort(function(a, b) { 
    if (a.date > b.date) {
      return 1;
    }
    if (a.date < b.date) {
      return -1;
    }
    return 0;
  });

  scatterplotChart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + conf.height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", conf.width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Time");

    scatterplotChart.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("# messages");

    scatterplotChart.selectAll(".dot")
      .data(data_a)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function (d) { return x(d.date); })
        .attr("cy", function (d) { return y(d.count); })
        .style("fill", "steelblue")
        .style("opacity", 0.5);

    buildLineMessageByHour(data_a, maxNumMessages);
};

function buildLineMessageByHour(data, maxNumMessages) {
  var conf = getSvgConf(defaultConfig.largeGraphWidth, defaultConfig.mediumGraphHeight, 20, 40, 30, 40);
  var color = getColorScale();

  var x = d3.time.scale()
    .rangeRound([0, conf.width])
    .domain([new Date(0, 0, 0, 0, 0, 0), new Date(0, 0, 0, 23, 59, 59)]);

  var y = d3.scale.linear()
    .range([conf.height, 0])
    .domain([0, maxNumMessages]);

  var xAxis = getSimpleAxis(x, "bottom");
  var yAxis = getSimpleAxis(y, "left");

  xAxis.scale(x)
    .ticks(d3.time.hour,1)
    .tickFormat(d3.time.format("%Hh"));

  var scatterplotChart = getSvgAddedTo("#lineplotMessageByHour", conf);

  var line = d3.svg.line()
    .x(function (d) { return x(d.date); })
    .y(function (d) { return y(d.count); });

  scatterplotChart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + conf.height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", conf.width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Time");

    scatterplotChart.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("# messages");

    scatterplotChart.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);
};