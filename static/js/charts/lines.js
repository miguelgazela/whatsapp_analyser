var messageByHourLineXScale,
  messageByHourLineYScale,
  messageByHourLineXAxis,
  messageByHourLineYAxis,
  valueLine,
  messageByHourLineOldData,
  oldMaxNumMessages;


function buildMessageByHourLine() {
  var conf = getSvgConf(defaultConfig.largeGraphWidth, defaultConfig.mediumGraphHeight, 20, 40, 30, 40),
    color = getColorScale();

  var raw_data = rawData.daysByUser,
    data = {};

  var minDate = moment(),
    maxDate = moment("1988-11-11");

  _.each(Object.keys(raw_data), function (user) {

    _.each(raw_data[user], function (d) {
      var time = d.substr(11, 8);
      var hour = time.substr(0, 2);
      var minute = time.substr(3, 2);
      var second = time.substr(6, 2);

      var key = time.substr(0, 5);

      // find min and max date
      var msgDate = moment(d);
      if(minDate.isAfter(d)) {
        minDate = msgDate;
      }

      if(maxDate.isBefore(d)) {
        maxDate = msgDate;
      }

      if (data.hasOwnProperty(key)) {
        data[key].count += 1;
      } else {
        data[key] = {date: new Date(0, 0, 0, hour, minute, second), count: 1, mdate: msgDate};
      }

    });
  });

  var data_a = [];
  _.each(Object.keys(data), function (time) {
    data_a.push({date: data[time].date, count: data[time].count, mdate: data[time].mdate});
  });

  var maxNumMessages = _.max(data_a, function (d) { return d.count; }).count;

  data_a.sort(compareDates);
  messageByHourLineOldData = data_a;
  oldMaxNumMessages = maxNumMessages;

  messageByHourLineXScale = d3.time.scale()
    .rangeRound([0, conf.width])
    .domain([new Date(0, 0, 0, 0, 0, 0), new Date(0, 0, 0, 23, 59, 59)]);

  messageByHourLineYScale = d3.scale.linear()
    .range([conf.height, 0])
    .domain([0, maxNumMessages]);

  messageByHourLineXAxis = getSimpleAxis(messageByHourLineXScale, "bottom");
  messageByHourLineYAxis = getSimpleAxis(messageByHourLineYScale, "left");

  messageByHourLineXAxis.scale(messageByHourLineXScale)
    .ticks(d3.time.hour,1)
    .tickFormat(d3.time.format("%Hh"));

  var scatterplotChart = getSvgAddedTo("#lineplotMessageByHour", conf);

  valueLine = d3.svg.line()
    .x(function (d) { return messageByHourLineXScale(d.date); })
    .y(function (d) { return messageByHourLineYScale(d.count); });

  valueLine2 = d3.svg.line()
    .x(function (d) { return messageByHourLineXScale(d.date); })
    .y(function (d) { return messageByHourLineYScale(d.count); });

  scatterplotChart.append("g")
      .attr("class", "messageByHour x axis")
      .attr("transform", "translate(0," + conf.height + ")")
      .call(messageByHourLineXAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", conf.width - 2)
      .attr("y", 12)
      .style("text-anchor", "end")
      .text("Hour");

    scatterplotChart.append("g")
        .attr("class", "messageByHour y axis")
        .call(messageByHourLineYAxis)
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("# messages");

    scatterplotChart.append("path")
      .attr("class", "messageByHour line")
      .attr("d", valueLine(data_a));

    scatterplotChart.append("path")
      .attr("class", "messageByHour oldline");

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

    $("#dateSlider").bind("valuesChanged", function(e, b_data){

      var min_date = moment(b_data.values.min);
      var max_date = moment(b_data.values.max);

      updateMessageByHourLineData(min_date, max_date, [0,1,2,3,4,5,6]);

    });
};


function compareDates (a, b) {
  if (a.date > b.date) {
    return 1;
  }
  if (a.date < b.date) {
    return -1;
  }
  return 0;
};


function updateMessageByHourLineChart() {
  var checkboxes = $('.btn-group input[type="checkbox"]:checked');
  var selectedDays = [];

  _.each(checkboxes, function (d) {
    selectedDays.push(+d.value);
  });

  var dateRangeValues = $("#dateSlider").dateRangeSlider("values");

  updateMessageByHourLineData(moment(dateRangeValues.min), moment(dateRangeValues.max), selectedDays);

};


function updateMessageByHourLineData (minDate, maxDate, selectedDays) {
  var raw_data = rawData.daysByUser,
    data = {};

  _.each(Object.keys(raw_data), function (user) {
    _.each(raw_data[user], function (d) {

      var msgDate = moment(d);
      var continueProcess = false;

      for(var i = 0; i < selectedDays.length; i++) {
        if (selectedDays[i] === msgDate.day()) {
          continueProcess = true;
          break;
        }
      }

      if (continueProcess && msgDate.isAfter(minDate) && msgDate.isBefore(maxDate)) {
        var time = d.substr(11, 8);
        var hour = time.substr(0, 2);
        var minute = time.substr(3, 2);
        var second = time.substr(6, 2);

        var key = time.substr(0, 5);

        if (data.hasOwnProperty(key)) {
          data[key].count += 1;
        } else {
          data[key] = {date: new Date(0, 0, 0, hour, minute, second), count: 1, mdate: msgDate};
        }
      }

    });
  });


  var data_a = [];
  _.each(Object.keys(data), function (time) {
    data_a.push({date: data[time].date, count: data[time].count, mdate: data[time].mdate});
  });

  var maxNumMessages = _.max(data_a, function (d) { return d.count; }).count;
  messageByHourLineYScale.domain([0, Math.max(maxNumMessages, oldMaxNumMessages)]);
  oldMaxNumMessages = maxNumMessages;

  data_a.sort(compareDates);

  var scatterplotChart = d3.select('#lineplotMessageByHour').transition();

  scatterplotChart.select('.messageByHour.oldline')
    .duration(750)
    .attr("d", valueLine(messageByHourLineOldData));

  scatterplotChart.select('.messageByHour.line')
    .duration(750)
    .attr("d", valueLine(data_a));

  messageByHourLineOldData = data_a;

  scatterplotChart.select(".messageByHour.y.axis").duration(750).call(messageByHourLineYAxis);
}


function setMessageByHourToWeekends() {
  var dateRangeValues = $("#dateSlider").dateRangeSlider("values");
  updateMessageByHourLineData(moment(dateRangeValues.min), moment(dateRangeValues.max), [0, 6]);

  var checkboxes = document.querySelectorAll('.messageByHour input[type="checkbox"]');

  _.each(checkboxes, function (d) {
    var checkbox = $(d);

    if (checkbox.val() == 0 || checkbox.val() == 6) {
      $(checkbox.parent('label')).addClass("active");
    } else {
      $(checkbox.parent('label')).removeClass("active");
    }
  });
};


function setMessageByHourToMondays () {
  var dateRangeValues = $("#dateSlider").dateRangeSlider("values");
  updateMessageByHourLineData(moment(dateRangeValues.min), moment(dateRangeValues.max), [1]);

  var checkboxes = document.querySelectorAll('.messageByHour input[type="checkbox"]');

  _.each(checkboxes, function (d) {
    var checkbox = $(d);

    if (checkbox.val() == 1) {
      $(checkbox.parent('label')).addClass("active");
    } else {
      $(checkbox.parent('label')).removeClass("active");
    }
  });
};