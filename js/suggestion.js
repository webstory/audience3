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
  
  module.makeMatrix = function(size) {
	if(!size) size = [5,25];
	// Make similarity matrix(depend on seed)
	var m1 = math.map(math.zeros(size[0],size[1]),function(value) {
		return random();
	});
	
	console.log(m1.valueOf());
	  
  }
  
  return module;

})(this);