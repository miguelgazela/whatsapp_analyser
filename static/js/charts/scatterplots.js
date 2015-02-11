function buildDistributionOverTimeGraph() {

  var raw_data = JSON.parse(document.getElementById('daysByUser').innerHTML);

  var data = []
  var minDate = moment();
  var maxDate = moment("1995-12-25");

  _.each(Object.keys(raw_data), function(d) {
    data.push({
      name: d,
      dates: _.map(raw_data[d], function (d) {
        var msgDate = moment(d);

        // determine the starting date
        if(minDate.isAfter(d)) {
          minDate = msgDate;
        }

        if(maxDate.isBefore(d)) {
          maxDate = msgDate;
        }

        return msgDate;
      })
    });
  });

  var color = getColorScale();

  var eventDropsChart = d3.chart.eventDrops()
    .margin({top: 70, left: 200, bottom: 0, right: 50})
    .width(defaultConfig.largeGraphWidth)
    .start(minDate)
    .end(maxDate)
    .eventHover(function(el){
      // console.log(d3.select(el.parentNode).data()[0].name);
      // console.log(d3.select(el).data());
      // console.log(d3.select(el).data()[0].format('YYYY-MM-DDT'));
    })
    .eventLineColor(function (datum, index) {
        return color(index);
    });

  d3.select('#distributionOverTimeSvg')
    .datum(data)
    .call(eventDropsChart);
};