var defaultConfig = {
  smallGraphHeight: 260,
  smallGraphWidth: 500,
  mediumGraphWidth: 660,
  mediumGraphHeight: 320,
  largeGraphWidth: 1108,
  largeGraphHeight: 500,

  wordCloudHeight: 580,
  wordCloudMaxFontSize: 220
};


function getSvgAddedTo(id, conf) {
  return d3.select(id).append("svg")
    .attr("width", conf.width + conf.margin.left + conf.margin.right)
    .attr("height", conf.height + conf.margin.top + conf.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + (conf.margin.left + 20) + "," + conf.margin.top + ")");
};


function getSimpleAxis(scale, orientation) {
  return d3.svg.axis()
    .scale(scale)
    .orient(orientation);
};


function getSvgConf(w, h, vertical, horizontal, bottom_opt, left_opt) {

  if(arguments.length != 4 && arguments.length != 6) {
      throw "Illegal number of arguments. Was expecting 4 or 6, received " + arguments.length + ".";
  }

  var margin = {top: vertical, right: horizontal, bottom: bottom_opt ? bottom_opt : vertical, left: left_opt ? left_opt : horizontal},
  width = w - margin.left - margin.right,
  height = h - margin.top - margin.bottom;

  return {
      margin: margin,
      width: width,
      height: height
  }
};