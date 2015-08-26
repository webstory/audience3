$(function() {
  if(window.localStorage.getItem("character_group")) {
    $("#character_group_def").val(window.localStorage.getItem("character_group"));
  }
})

function toggleCombine() {
  if($("#matrix .combined").css("opacity") == "0.5") {
    $("#matrix .combined").css("opacity",1.0).css("position","inherit");
  } else {
    $("#matrix .combined").css("opacity",0.5).css("position","absolute");	
  }
}