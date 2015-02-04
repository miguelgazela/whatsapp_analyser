function buildDailyDistributionAreaChart() {
    var conf = getSvgConf(defaultConfig.largeGraphWidth, defaultConfig.mediumGraphHeight, 20, 40, 80, 40),
      conf2 = getSvgConf(defaultConfig.largeGraphWidth, defaultConfig.smallGraphHeight / 3, 30, 40, 20, 40)

    var parseDate = d3.time.format("%Y-%m-%d").parse,
      formatDate = d3.time.format("%Y");

    var color = getColorScale();

    var mostActiveDay = { date: null, num_messages: 0 },
      leastActiveDay = { date: null, num_messages: Math.pow(2, 53)-1 };

    var data = rawData.messagesByDay;
    var lastDate = null;

    var totalNumMessages = 0;
    var numberDays = data.length;

    // the following code adds missing days with 0 messages sent

    for(var i = 0; i < data.length; ) {
      data[i].date = moment(parseDate(data[i].date));

      var currentDate = moment(data[i].date),
        daysDiff = 1;

      if (lastDate !== null) {
        daysDiff = currentDate.diff(lastDate, 'days');

        if (daysDiff > 1) { // needs to add missing days
          for(var j = 1; j < daysDiff; j++) {
            var newDate = moment(currentDate);
            newDate.subtract(j, 'days');
            data.splice(i, 0, {date: newDate, num_messages: 0});
          }
        }
      } 

      lastDate = currentDate;

      totalNumMessages += data[i].num_messages;

      // calculate the most and least active days

      if (data[i].num_messages > mostActiveDay.num_messages) {
        mostActiveDay = data[i];
      }
      if (data[i].num_messages < leastActiveDay.num_messages && data[i].num_messages !== 0) {
        leastActiveDay = data[i];
      }

      i += daysDiff;  // due to the adition of new elements
    }

    // fill in section with most and least active days
    $('#mostActiveDay').html("<p class='main-stat'>" + mostActiveDay.date.format("dddd, MMMM Do YYYY") + "</p><p class='secondary-stat'>" + mostActiveDay.num_messages + " messages</p>");
    $('#leastActiveDay').html("<p class='main-stat'>" + leastActiveDay.date.format("dddd, MMMM Do YYYY") + "</p><p class='secondary-stat'>" + leastActiveDay.num_messages + " messages</p>");
    $('#averageNumMessagesDay').html("<p class='main-stat'>" + Math.round(totalNumMessages / numberDays)  + "</p><p class='secondary-stat'>messages</p>")

    var minDate = data[0].date;
    var maxDate = data[data.length - 1].date;

    // build scales and axes

    var x = d3.time.scale()
      .range([0, conf.width])
      .domain(d3.extent(data, function (d) { return d.date; }));

    var y = d3.scale.linear()
      .range([conf.height, 0])
      .domain([0, d3.max(data, function (d) { return d.num_messages; })]);

    var x2 = d3.time.scale()
      .range([0, conf.width])
      .domain(x.domain());

    var y2 = d3.scale.linear()
      .range([conf2.height, 0])
      .domain(y.domain());

    var xAxis = getSimpleAxis(x, "bottom")
      .tickPadding(6);

    var xAxis2 = getSimpleAxis(x2, "bottom")
      .tickPadding(6);

    var yAxis = getSimpleAxis(y, "left")
      .tickPadding(6);

    // create brush for the overview graph

    var brush = d3.svg.brush()
      .x(x2)
      .on("brush", brush);

    // create areas and line

    var line = d3.svg.line()
      .x(function (d) { return x(d.date); })
      .y(function (d) { return y(d.num_messages); });

    var area = d3.svg.area()
      .interpolate("linear")  // can also be linear or step-after
      .x(function (d) { return x(d.date); })
      .y0(conf.height)  // or y(0)
      .y1(function (d) { return y(d.num_messages); });

    var area2 = d3.svg.area()
      .interpolate("linear")  // can also be linear or step-after
      .x(function (d) { return x2(d.date); })
      .y0(conf2.height)
      .y1(function (d) { return y2(d.num_messages); });

    // add chart to the dom

    var svg = d3.select("#dailyDistAreaSvg").append("svg")
      .attr("width", conf.width + conf.margin.left + conf.margin.right)
      .attr("height", conf.height + conf.margin.top + conf2.height + conf.margin.bottom)

    // add focus and overview elements to the chart

    var focus = svg.append("g")
      .attr("transform", "translate(" + conf.margin.left + "," + conf.margin.top + ")");

    var context = svg.append("g")
      .attr("transform", "translate(" + conf2.margin.left + "," + (conf.height + 60) + ")");

    // build the main area chart

    focus.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + conf.height + ")")
      .call(xAxis);

    focus.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("font-size", "10px")
        .text("# Messages");

    // needs a clipping area for the brush function

    var plotArea = focus.append('g')
      .attr('clip-path', 'url(#plotAreaClip)');

    plotArea.append('clipPath')
      .attr('id', 'plotAreaClip')
      .append('rect')
      .attr({ width: conf.width + conf.margin.left + conf.margin.right, height: conf.height });

    plotArea.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", area);

    plotArea.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);

    // build the context area chart

    context.append("path")
      .datum(data)
      .attr("class", "overview-area")
      .attr("d", area2);

    context.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0, " + conf2.height + ")")
      .call(xAxis2);

    context.append("g")
        .attr("class", "x brush")
        .call(brush)
      .selectAll("rect")
        .attr("y", -6)
        .attr("height", conf.height + 7);


    // Add hover line for the display of information

    var hoverLineGroup = focus.append("g") //the vertical line across the plots
      .attr("class", "hover-line");

    // var dateLabel = focus.append("g")
    //   .attr("class", "dateLabel");

    // var messagesLabel = focus.append("g")
    //   .attr("class", "messagesLabel");

    var container = document.querySelector('#dailyDistAreaSvg');
    $(container).mouseleave(function(event) {
      handleMouseOutGraph(event);
    });
    $(container).mousemove(function(event) {
      handleMouseOverGraph(event);
    });

  
    function handleMouseOverGraph (event) {


      if(brush.empty()) {

        var container = $(document.querySelector('#dailyDistAreaSvg'));
        var offset = container.offset();

        var mouseX = event.pageX - offset.left - conf.margin.left;
        var mouseY = event.pageY - offset.top;
      
        if(mouseX >= 0 && mouseX <= 1058 && mouseY >= 0 && mouseY <= 320) {
          // console.log(mouseX+"  "+mouseY);

          // show the hover line
          hoverLineGroup.select('line').remove();
          hoverLineGroup.append("line")
            .attr("x1", mouseX).attr("x2", mouseX) 
            .attr("y1", 0).attr("y2", conf.height) 
            .style("stroke", "DarkViolet")
            .style("stroke-width", 0.2);

          //update info label
          displayInfoForPositionX(mouseX);

        } else { // out of the bounds that we want
          handleMouseOutGraph(event);
        }
      }
    }

    function handleMouseOutGraph (event) {
      // hide the hover-line
      hoverLineGroup.select('line').remove();
      $('#dailyDistMainStat').html("");
      $('#dailyDistSecondaryStat').html("");
      // dateLabel.select("text").remove();
      // messagesLabel.select("text").remove()
    }


    function displayInfoForPositionX(xPosition) {
      // console.log("xPos:"+xPosition);

      var numMessages = 0;
      var dateStr;

      // get the date on x-axis for the current location
      var xValue = x.invert(xPosition);
      // console.log(xValue);

      for(var i = 0; i < data.length; i++) {
        if (data[i].date.date() === xValue.getDate() && data[i].date.month() === xValue.getMonth() && data[i].date.year() === xValue.getFullYear()) {
          numMessages = data[i].num_messages;
          dateStr = data[i].date.format("ddd, D MMM YYYY"); 
          break;
        }
      }

      $('#dailyDistMainStat').html("# Messages: " + numMessages);
      $('#dailyDistSecondaryStat').html(dateStr);

      // showLabel(messagesLabel, xPosition - 10, -6, numMessages, "14px");
      // showLabel(dateLabel, conf.width - 100, 0, dateStr, "16px");

      // function showLabel(label, xPos, yPos, text, fontSize) {
      //   label.select("text").remove();
      //   label.append("text")
      //     .attr("x", xPos)
      //     .attr("y", yPos)
      //     .text(text)
      //       .attr("font-family", "sans-serif")
      //       .attr("font-size", fontSize)
      //       .attr("fill", "Gray");
      // };

    }

    function brush () {

      // console.log(brush.extent());
      x.domain(brush.empty() ? x2.domain() : brush.extent());

      focus.select(".area").attr("class", "area").attr("d", area);
      focus.select(".line").attr("class", "line").attr("d", line);
      focus.select(".x.axis").call(xAxis);
    };

    // document.getElementById("stackedAreaResetBrush").addEventListener("click", function () {
    //   brush
    //     .clear()
    //     .event(d3.select(".brush"));
    // });    

  };