/* global math */
var Suggestion = (function(module) {
  // Random number generator with seed
  var seed = 1;
  function random() {
      var x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
  }
  
  module.setSeed = function(x) {
    seed = x;
  }
  
  module.makeMatrix = function() {
    var seed = $('#random_seed').val() - 0;
    var rated_movies = $('#rated_movies').val() - 0;
    var unrated_movies = $('#unrated_movies').val() - 0;
    setSeed(seed);

    // Make similarity matrix(depend on seed)
    // Row: Rated movie, Col: Unrated movie
    var m1 = math.map(math.zeros(rated_movies,unrated_movies),function(value) {
        return random();
    });

    return m1.valueOf();
  }

  module.makeRatingTable = function(target, data) {
    var user_count = $('#user_count').val() - 0;
    var rated_movies = $('#rated_movies').val() - 0;

    target.empty();

    var head = $("<thead>");
    var header_row = $("<tr>")

    header_row.append("<th>User</th>");

    for(var i=0; i<rated_movies; i++) {
      header_row.append("<th>M"+(i+1)+"</th>");
    }

    head.append(header_row);

    var body = $("<tbody>")
    for(var i=0; i<user_count; i++) {
      var row = $("<tr>");
      row.append("<th>U"+(i+1)+"</th>")

      for(var j=0; j<rated_movies; j++) {
        var rating;
        try {
          rating = data[i][j] || 0;
        } catch(err) {
          rating = 0;
        }
        row.append("<td><input type='text' value='"+rating+"'/></td>");
      }

      body.append(row);
    }

    target.append(head).append(body);
  }

  module.makeSimilarityTable = function(target, data) {
    var rated_movies = $('#rated_movies').val() - 0;
    var unrated_movies = $('#unrated_movies').val() - 0;

    target.empty();

    var head = $("<thead>");
    var header_row = $("<tr>")

    header_row.append("<th>Movie</th>");

    for(var i=0; i<unrated_movies; i++) {
      header_row.append("<th>M"+(i+6)+"</th>");
    }

    head.append(header_row);

    var body = $("<tbody>")
    for(var i=0; i<rated_movies; i++) {
      var row = $("<tr>");
      row.append("<th>M"+(i+1)+"</th>")

      for(var j=0; j<unrated_movies; j++) {
        var similarity = data[i][j];
        row.append("<td><input type='text' value='"+similarity+"'/></td>");
      }

      body.append(row);
    }

    target.append(head).append(body);
  }

  module.extractMatrix = function(target) {
    var data = [];

    $(target).find("tbody")
      .find("tr").each(function(i,d) {
        var row = [];
        $(d).find("input").each(function(i, d) {
          row.push($(d).val()-0);
        });
        console.log(row);
        data.push(row);
      });

    return data;
  }

  module.restoreMatrix = function(target, data) {

  }

  module.update = function() {
    var backup1 = extractMatrix($("#movie_rating_table"));
    var m1 = makeMatrix();
    makeRatingTable($("#movie_rating_table"), backup1);
    makeSimilarityTable($("#movie_similarity_table"), m1);
  }
  
  return module;

})(this);