function start() {
	var input = document.getElementById("url");
	input.value = localStorage["ocb_url"];
	var form = document.getElementById("form");
	form.addEventListener("submit", handleClick);
}

function handleClick(event) {
	var input = document.getElementById("url");
	localStorage["ocb_url"] = input.value;
	event.preventDefault();
}

document.addEventListener('DOMContentLoaded', start);

