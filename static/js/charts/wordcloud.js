function buildWordCloud() {

  var data = rawData.wordHistogram,  
    maxFrequency = data[0].size;

  d3.layout.cloud().size([defaultConfig.largeGraphWidth, defaultConfig.wordCloudHeight])
    .words(data)
    .padding(6)
    .rotate(function() { return ~~(Math.random() * 2) * 90; })
    .fontSize(function (d) { return calculateFontSizeForWord(d.size, maxFrequency); })
    .on("end", drawWordCloud)
    .start();

  var tid = null;

  $('#searchWord').keyup(searchWord);

  function searchWord (e) {

    // if user is still writing the word, prevent code run
    if (tid !== null) {
      clearTimeout(tid);
    }

    var input = $(e.target).val();

    tid = setTimeout(function() {

      var data = rawData.wordHistogram; 

      for(var i = 0; i < data.length; i++) {

        // if any of the words matches the query
        if (data[i].text === input) {
          
          document.getElementById('wordCounter').innerHTML = "The word <strong>" + data[i].text + "</strong> has been used <strong>" + data[i].size + "</strong> times";
          
          $('#wordCloudSvg').addClass("filtered");

          var words = $('#wordCloudSvg text');

          for(var j = 0; j < words.length; j++) {
            var word = $(words[j]);

            // activate the matched word in the word cloud
            if ( word.html() === input ) {
              word.attr("class", "active");
              return; // break the wordcloud word search
            }
          }
          return; // break search for the word in the data
        }
      }

      if (input !== "")
        document.getElementById('wordCounter').innerHTML = "That word is not on the Top 150 used words"
      else
        document.getElementById('wordCounter').innerHTML = ""

      $('#wordCloudSvg').removeClass("filtered");
      var words = $('#wordCloudSvg text');

      for(var j = 0; j < words.length; j++) {
        var word = $$(words[j]);
        word.attr("class", "");
      }

    }, 200);

  };

};


function drawWordCloud (words) {
  var colors = d3.scale.category20();

  d3.select("#wordCloudSvg").append("svg")
    .attr("width", defaultConfig.largeGraphWidth)
    .attr("height", 630)
    .append("g")
    .attr("transform", "translate(" + (defaultConfig.largeGraphWidth / 2) +", 340)")
    .selectAll("text")
      .data(words)
    .enter().append("text")
      .style("font-size", function(d) { return d.size + "px"; })
      .style("font-family", "Impact")
      .style("fill", function(d, i) { return colors(i); })
      .attr("text-anchor", "middle")
      .attr("transform", function(d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
      })
      .text(function(d) { return d.text; });
};


function calculateFontSizeForWord (frequency, maxFrequency) {
  return (frequency * defaultConfig.wordCloudMaxFontSize) / maxFrequency;
};