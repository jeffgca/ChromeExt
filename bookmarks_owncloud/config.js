function start() {
	var input = document.getElementById("url");
	input.value = localStorage["ocb_url"];
	input = document.getElementById("skip");
	input.checked = localStorage["ocb_bracks"] == '1'
	var form = document.getElementById("form");
	form.addEventListener("submit", handleClick);
}

function handleClick(event) {
	var input = document.getElementById("url");
	localStorage["ocb_url"] = input.value;
	input = document.getElementById("skip");
	if (input.checked) {
		localStorage["ocb_bracks"] = '1';
	} else {
		localStorage["ocb_bracks"] = '0';
	}
	event.preventDefault();
}

document.addEventListener('DOMContentLoaded', start);

