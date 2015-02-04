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

  var minDate = moment();
  var maxDate = moment("1995-12-25");

  

  // console.log(minDate);
  // console.log(maxDate);

  var data_a = [];
  _.each(Object.keys(data), function (time) {
    data_a.push({date: data[time].date, count: data[time].count, mdate: data[time].mdate});
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

  var circles = scatterplotChart.selectAll("circle")
    .data(data_a)
    .enter()
    .append("circle");

  var circleAttributes = circles
    .attr("class", "dot")
    .attr("r", 3.5)
    .attr("cx", function (d) { return x(d.date); })
    .attr("cy", function (d) { return y(d.count); })
    .style("fill", "steelblue")
    .style("opacity", 0.5);

  $('#dateSlider').dateRangeSlider({
    bounds: {
      min: minDate,
      max: maxDate
    },
    defaultValues: {
      min: minDate,
      max: maxDate
    },
    arrows: false,
    formatter: function(val){
      var days = val.getDate(),
        month = val.getMonth() + 1,
        year = val.getFullYear();
      return days + "/" + month + "/" + year;
    },
    range: {min: {days: 1}}
  });

  buildMessageByHourLine(raw_data, data_a, maxNumMessages);    
};