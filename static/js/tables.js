/**
 * Builds the table with the most and least popular words used in the conversation
 **/
function populateMostAndLeastPopularWordsTable() {
	var data = rawData.wordHistogram,
    	tbodyPopular = $('#mostPopularWords'),
    	tbodyUnpopular = $('#leastPopularWords');

    for(var i = 0; i < Math.min(10, data.length); i++) {
      tbodyPopular.append("<tr><td>" + (i + 1) + "</td><td>" + data[i].text + "</td><td>" + data[i].size + "</td>");
      tbodyUnpopular.append("<tr><td>" + (i + 1) + "</td><td>" + data[data.length - 1 - i].text + "</td><td>" + data[data.length - 1 - i].size + "</td>");
    }
};


/**
 * Builds the table with the most popular emoticons used in the conversation
 **/
function populateEmoticonTable() {
	var tbodyEmoticon = $('#mostPopularEmoticons'),
		data = rawData.smileHistogram;

	for(var i = 0; i < Math.min(10, data.length); i++) {
	  tbodyEmoticon.append("<tr><td>" + (i + 1) + "</td><td>" + data[i].text + "</td><td>" + data[i].size + "</td></tr>")
	}
};