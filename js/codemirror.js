$(function() {
  CodeMirror.defineMode("finaldraft", function() {
    return {
      token: function (stream, state) {
        var token = null;

        if(stream.sol() == true) {
          state.indent = stream.indentation();

          if(state.indent == 0) {
            if(stream.match(/^INT\.|EXT\.|INT\/EXT\./)) {
              token = "sceneheading";
            } else {
              token = "action";
            }
            stream.skipToEnd()
            return token;
          } else {
            stream.eatSpace();
            return null;
          }
        }

        var indent = state.indent;

        if(indent >= 10 && indent <=12) {
          token = "dialogue";
        } else if(indent >= 16 && indent <=18) {
          if(stream.match(/^\(.*\)?/) && stream.match(/\)\s*$/)) {
            token = "parenthetical";
          }
        } else if(indent >= 20 && indent <= 24) {
          if(stream.match(/^\S/)) {
            token = "character";
          }
        }

        stream.skipToEnd();
        return token;
      },

      startState: function() {
        return { escaped: false };
      }
    };
  });

  CodeMirror.defineMIME("text/x-finaldraft", "txt");

  window.script1 = CodeMirror.fromTextArea(
    document.getElementById("script1"),
    {
      lineNumbers: true,
      lineWrapping: true,
      mode: "finaldraft",
      theme:"paraiso-light"
    });

  window.script2 = CodeMirror.fromTextArea(
    document.getElementById("script2"),
    {
      lineNumbers: true,
      lineWrapping: true,
      mode: "finaldraft",
      theme:"paraiso-light"
    });
});