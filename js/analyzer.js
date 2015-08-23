var Scene = function(title) {
  var self = this;

  self.title = ""+title;
  self.characters = [];
  self.dialogs = {};
  self.action_script = "";

  self.add_character = function(character) {
    if(!!character && character.match(/\S+/).length >= 1) {
      if(!_.contains(self.characters, character)) {
        self.characters.push(character.trim());
        self.dialogs[character] = 0;
      }
      if(!_.contains(Scene.all_characters, character)) {
        Scene.all_characters.push(character.trim());
      }
    }
  };


  return self;
};

Scene.all_characters = [];
Scene.get_all_characters = function() {
    return Scene.all_characters.sort();
};



var characters_tab = (function() {
  var self = this;

  self.update = function() {
    var doc = window.editor.getValue();

    window.scenes = [];

    lines = doc.split('\n');

    var cur_scene = new Scene();
    var cur_character = 'NONAME';

    // Step 1: Character detection
    // Pass 1: Extract dialog character
    $.each(lines, function(i, e) {
      if(e.match(/^INT\.|EXT\.|INT\/EXT\./)) {
        window.scenes.push(cur_scene);
        cur_scene = new Scene(e);
      } else {
        indent = e.match(/^\s*/)[0].length;

        // Character
        if(indent >= 20 && indent <= 24) {
          cur_character = e.match(/^\s*([a-zA-Z0-9 .]+)/)[1];
          cur_scene.add_character(cur_character.trim());
        }

        // Dialog
        if(indent >= 10 && indent <= 12) {
          var dialog_len = e.match(/^\s*(.*)$/)[1].length;
          cur_scene.dialogs[cur_character] += dialog_len;
        }

        // Action
        if(indent >= 0 && indent <= 4) {
          cur_scene.action_script += e.trim() + " ";
        }

      }
    });

    // Pass 2: Extract additional character in action tag
    all_chars = Scene.get_all_characters();
    $.each(window.scenes, function(i, scene) {
      $.each(all_chars, function(j, character) {
        if(scene.action_script.toUpperCase().indexOf(character) != -1) {
          scene.add_character(character.trim());
        }
      });

      delete scene.sction_script;
    });

    // Pass 3: Make listen matrix
    var listen_matrix = math.zeros(all_chars.length, all_chars.length).valueOf();
    $.each(window.scenes, function(i, scene) {

      $.each(scene.characters, function(i, teller) {
        var teller_index = _.indexOf(all_chars, teller);
        if(teller_index != -1) {
          $.each(scene.characters, function(i, listener) {
            var listener_index = _.indexOf(all_chars, listener);
            listen_matrix[teller_index][listener_index] += scene.dialogs[teller];
          });
        }
      });
    });

    // Pass 4: Character sort by listen degree
    var listen_degree = math.zeros(all_chars.length).valueOf();
    for(var i=0; i<all_chars.length; i++) {
      for(var j=0; j<all_chars.length; j++) {
        listen_degree[i] += listen_matrix[i][j];
      }
    }

    listen_degree = _.zip(all_chars, listen_degree);
    listen_degree = _.sortBy(listen_degree, function(n) { return n[1]; }).reverse();

    // Re-adjust all_characters
    all_chars = _.map(listen_degree, function(n) { return n[0]; });
    console.log(listen_degree);
    console.log(window.scenes);
    console.log(listen_matrix);


    // Pass 5: Make character groups
    var degrees1 = _.map(listen_degree, function(n) { return n[1]; });
    var degrees2 = _.map(listen_degree, function(n) { return -n[1]; });

    degrees1.unshift(0);
    degrees2.push(0);

    var delta = _.map(_.zipWith(degrees1, degrees2, _.add), Math.abs);
    delta[0] = 0;

    console.log(delta);

    degrees1.shift();
    delete degress2;

    var maxDeltaPosition = _.indexOf(delta, math.max(delta)) + 1;
    var avgDeltaPosition = _.takeWhile(degrees1, function(n) { return n >= math.mean(degrees1); }).length;

    console.log(maxDeltaPosition);
    console.log(avgDeltaPosition);

    var main = _.slice(all_chars, 0, maxDeltaPosition);
    var sub = _.slice(all_chars, maxDeltaPosition, avgDeltaPosition);
    var extra = _.slice(all_chars, avgDeltaPosition, all_chars.length);


    // Display Block
    $.each(listen_degree, function(i, character) {
      $("#all_characters").append("<a href='#'class='col-xs-3 btn btn-sm' role='button' data-toggle='tooltip' data-placement='top' title='"+character[1]+"''>"+character[0]+"</a>");
    });


    $("#all_characters a:lt("+maxDeltaPosition+")").addClass("btn-primary");
    $("#all_characters a:gt("+(maxDeltaPosition-1)+"):lt("+avgDeltaPosition+")").addClass("btn-success");
    $("#all_characters a:gt("+avgDeltaPosition+")").addClass("btn-default");

    $('[data-toggle="tooltip"]').tooltip();
  }

  return self;
})();