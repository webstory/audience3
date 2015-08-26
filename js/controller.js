$(function() {
	if(window.localStorage.getItem("character_group")) {
		$("#character_group_def").val(window.localStorage.getItem("character_group"));
	}
})