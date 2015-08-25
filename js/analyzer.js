var module = {};

var Scene = function(title) {
  var self = {};

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
    }
  };


  return self;
};

var characters_tab = (function(module) {
  var self = {};

  self.update = function() {
    build_character_group();

    var doc1 = window.script1.getValue();
    var doc2 = window.script2.getValue();

    var script1 = parseScript(doc1);
    build_character_list_ui(script1, $("#all_characters1"));

    var script2 = parseScript(doc2);
    build_character_list_ui(script2, $("#all_characters2"));
  };

  var build_character_list_ui = function(parsed_script, elem) {
    $(elem).empty();
    var main = parsed_script.main;
    var sub = parsed_script.sub;
    var extra = parsed_script.extra;
    var ld = function(name) {
      return _.filter(parsed_script.listen_degree, function(n) { return n[0] == name; })[0];
    }

    $.each(main, function(i, character) {
      $(elem).append("<a href='#' class='col-xs-3 btn btn-sm btn-primary' role='button' data-toggle='tooltip' data-placement='top' title='"+ld(character)+"'>"+character+"</a>");
    });

    $.each(sub, function(i, character) {
      $(elem).append("<a href='#' class='col-xs-3 btn btn-sm btn-success' role='button' data-toggle='tooltip' data-placement='top' title='"+ld(character)+"'>"+character+"</a>");
    });

    $.each(extra, function(i, character) {
      $(elem).append("<a href='#' class='col-xs-3 btn btn-sm btn-default' role='button' data-toggle='tooltip' data-placement='top' title='"+ld(character)+"'>"+character+"</a>");
    });



    // $(elem).find("a:lt("+maxDeltaPosition+")").addClass("btn-primary");
    // $(elem).find("a:gt("+(maxDeltaPosition-1)+"):lt("+avgDeltaPosition+")").addClass("btn-success");
    // $(elem).find("a:gt("+avgDeltaPosition+")").addClass("btn-default");

    $('[data-toggle="tooltip"]').tooltip();
  }

  var build_character_group = function() {
    var groups = $("#character_group_def").val().split(",");
    var target = $("#character_groups1,#character_groups2").empty();

    _.each(groups, function(group) {
      $("<label class='col-xs-6'>"+group+" <input type='text' class='character_group'></label>").appendTo(target);
    });
  }

  var parseScript = function(doc) {
    var result = {};
    var scenes = [];

    var lines = doc.split('\n');

    var cur_scene = new Scene();
    var cur_character = 'NONAME';

    // Step 1: Character detection
    // Pass 1: Extract dialog character
    $.each(lines, function(i, e) {
      if(e.match(/^INT\.|EXT\.|INT\/EXT\./)) {
        scenes.push(cur_scene);
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
    var all_chars = _.uniq(_.flatten(_.map(scenes, function(scene) { return scene.characters; })));

    $.each(scenes, function(i, scene) {
      $.each(all_chars, function(j, character) {
        if(scene.action_script.toUpperCase().indexOf(character) != -1) {
          scene.add_character(character.trim());
        }
      });

      delete scene.sction_script;
    });

    // Pass 3: Make listen matrix
    var listen_matrix = math.zeros(all_chars.length, all_chars.length).valueOf();
    $.each(scenes, function(i, scene) {

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

    result.listen_degree = listen_degree;

    // Pass 5: Re-adjust all_characters(Degree order)
    all_chars = _.map(listen_degree, function(n) { return n[0]; });

    $.each(scenes, function(i, scene) {

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

    result.listen_matrix = listen_matrix;

    console.log(listen_degree);
    console.log(scenes);
    console.log(listen_matrix);

    result.all_characters = all_chars;


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

    result.main = _.slice(all_chars, 0, maxDeltaPosition);
    result.sub = _.slice(all_chars, maxDeltaPosition, avgDeltaPosition);
    result.extra = _.slice(all_chars, avgDeltaPosition, all_chars.length);

    return result;
  }

  return self;
})(module);





var matrix_tab = (function(module) {
  var self = {};
  var matrix_size = 6;


  var heat1 = function(heat) {
    var contrast = $("#contrast").val() - 0;
    var value = math.min(255, parseInt(heat * contrast));
    return "rgba("+value+",0,0,100)";
  }

  self.update = function() {
    var groups = [];

    $(".character_type").each(function(i, elem) {
      groups[i] = $(elem).val();
    });

    var degree = math.zeros(matrix_size, matrix_size).valueOf();

    module.listen_matrix

    for(var i=0; i<matrix_size; i++) {
      for(var j=0; j<matrix_size; j++) {
        var teller = groups[i];
        var listener = groups[j];

        var teller_index = module.all_characters.indexOf(teller);
        var listener_index = module.all_characters.indexOf(listener);
        
        if(teller_index != -1 && listener_index != -1) {
          degree[i][j] = module.listen_matrix[teller_index][listener_index];
        }
      }
    }

    var total_degree = math.sum(degree);
    var normalized_degree = math.multiply(degree, 1/total_degree).valueOf();

    for(var i=0; i<matrix_size; i++) {
      for(var j=0; j<matrix_size; j++) {
        degree[i][j] = i*10+j;
        $("#character_matrix tbody tr:nth("+(i)+") td:nth("+(j)+")")
          .css("background-color",heat1(normalized_degree[i][j]))
          .text((normalized_degree[i][j]*100).toFixed(1));
      }
    }

  };

  return self;
})(module);