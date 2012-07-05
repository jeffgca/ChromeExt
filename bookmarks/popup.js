var bookmarksXML = "http://www.google.com/bookmarks/?output=xml&num=100000";
var xml;
var favicon = "chrome://favicon/"

function getFavIcon(url) {
	return favicon + url;
}

function blue(event) {
	setBgColor(event.target, true);
}

function white(event) {
	setBgColor(event.target, false);
}

function setBgColor(obj, on) {
	while (obj.tagName.toLowerCase() != "tr") {
		obj = obj.parentNode;
	}
	var color = 'white';
	if (on) {
		color = 'lightblue';
	}
	obj.style.backgroundColor = color;
}

function displayBookmarks() {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", bookmarksXML, true);
	xhr.onreadystatechange = useBookmarks;
	xhr.send();
}

function useBookmarks() {
	if (this.readyState == this.DONE) {
		xml = this.responseXML.documentElement;
		var div = document.getElementById("towrite");
		var table = document.createElement("table");
		div.appendChild(table);
		var tr = document.createElement("tr");
		table.appendChild(tr);
		var td = document.createElement("td");
		tr.appendChild(td);
		div = document.createElement("div");
		td.appendChild(div);
		div.setAttribute("class", "inner");
		table = document.createElement("table");
		div.appendChild(table);
		table.setAttribute("class", "inner");

		menuItem(table, "Add Bookmark", mouseDownAddText, null, "", true, getFavIcon("http://www.google.com"));
		getLabels(xml, table);
		getBookmarksWOLabels(xml, table);

		td = document.createElement("td");
		tr.appendChild(td);
		div = document.createElement("div");
		td.appendChild(div);
		div.setAttribute("class", "inner");
		div.setAttribute("id", "submenu");
	}
}

function localesort(str1, str2) {
	return str1.toLowerCase().localeCompare(str2.toLowerCase())
}

function getLabels(xml, table) {
	var array = new Array();
	var nodes = xml.getElementsByTagName("label");
	for (var i = 0; i < nodes.length; ++i) {
		var label = nodes[i].firstChild.nodeValue;
		if (label != null) {
			for (var j = 0; j < array.length; ++j) {
				if (array[j] == label) {
					break;
				}
			}
			if (j == array.length) {
				array[j] = label;
			}
		}
	}
	array = array.sort(localesort)
	var linesep = false;
	for (var i = 0; i < array.length; ++i) {
		if (i == array.length - 1) {
			linesep = true;
		}
		menuItem(table, array[i], mouseDownLabelText, array[i], ">", linesep, "folder.png");
	}
}

function getBookmarksWOLabels(xml, table) {
	var nodes = xml.getElementsByTagName("bookmark");
	for (var i = 0; i < nodes.length; ++i) {
		var label = nodes[i].getElementsByTagName("label");
		var title = nodes[i].getElementsByTagName("title");
		var url = nodes[i].getElementsByTagName("url");
		if (!url.length) {
			continue;
		}
		var urlt = url[0].firstChild.nodeValue;
		var titlet;
		if (title.length) {
			titlet = title[0].firstChild.nodeValue;
		} else {
			titlet = urlt;
		}
		if (label[0] == null) {
			menuItem(table, titlet, mouseDownBookmarkText, urlt, "", false, getFavIcon(urlt));
		}
	}
}

function bookmarkSelection(event, par) {
	chrome.tabs.create({url: par});
	window.close();
}

function labelSelection(event, par) {
	blue(event);
	var sm = document.getElementById("submenu");
	var j = document.getElementById("subtable");
	if (j != null) {
		sm.removeChild(j);
	}
	sm.appendChild(createSubMenu(par));
}

function labelClicked(event, par) {
	var array = getBookmarksForLabel(par)

	for (var i = 0; i < array.length; ++i) {
		chrome.tabs.create({url: array[i].url});
	}
	window.close();
}

function pairSort(a, b) {
	return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
}

function getBookmarksForLabel(label) {
	var nodes = xml.getElementsByTagName("bookmark");
	var array = new Array();
	var ind = 0;

	for (var i = 0; i < nodes.length; ++i) {
		var l = nodes[i].getElementsByTagName("label");
		for (var j = 0; j < l.length; ++j) {
			if (l[j].firstChild.nodeValue == label) {
				var title = nodes[i].getElementsByTagName("title");
				var url = nodes[i].getElementsByTagName("url");
				var pair = new Object();
				if (!url.length) {
					continue;
				}
				pair.url = url[0].firstChild.nodeValue;
				if (title.length) {
					pair.title = title[0].firstChild.nodeValue;
				} else {
					pair.title = pair.url;
				}
				array[ind++] = pair;
				break;
			}
		}
	}
	
	return array.sort(pairSort);
}

function createSubMenu(label) {
	var table = document.createElement("table");
	table.setAttribute("class", "inner");
	table.setAttribute("id", "subtable");

	var array = getBookmarksForLabel(label)

	for (var i = 0; i < array.length; ++i) {
		var tr = document.createElement("tr");
		tr.setAttribute("class", "inner");
		mouseDownBookmarkText(tr, array[i].url);
		tr.addEventListener("mouseout", white);

		var td = document.createElement("td");
		td.setAttribute("class", "img");
		var img = document.createElement("img");
		img.setAttribute("src", getFavIcon(array[i].url));
		td.appendChild(img);
		tr.appendChild(td);

		td = document.createElement("td");
		td.appendChild(document.createTextNode(array[i].title));
		tr.appendChild(td);

		table.appendChild(tr);
	}
	return table;
}

function mouseDownLabelText(item, par) {
	item.addEventListener("mouseover", function(event) {labelSelection(event, par)});
	item.addEventListener("click", function(event) {labelClicked(event, par)});
}

function mouseDownBookmarkText(item, par) {
	item.addEventListener("mouseover", blue);
	item.addEventListener("click", function(event) {bookmarkSelection(event, par)});
}

function mouseDownAddText(item, par) {
	item.addEventListener("mouseover", blue);
	item.addEventListener("click", addBookmark);
}

function menuItem(table, title, mousefunc, mouseparam, separator, lineseparator, imgsrc) {
	var tr = document.createElement("tr");
	tr.setAttribute("class", "inner");
	table.appendChild(tr);
	var td = document.createElement("td");
	tr.appendChild(td);
	td.setAttribute("class", "img");
	var img = document.createElement("img");
	td.appendChild(img);
	img.setAttribute("src", imgsrc);
	td = document.createElement("td");
	tr.appendChild(td);
	td.appendChild(document.createTextNode(title));
	td = document.createElement("td");
	tr.appendChild(td);
	td.appendChild(document.createTextNode(separator));
	mousefunc(tr, mouseparam);
	tr.addEventListener("mouseout", white);
	if (lineseparator) {
		tr = document.createElement("tr");
		table.appendChild(tr);
		tr.setAttribute("class", "sep");
		td = document.createElement("td");
		td.appendChild(document.createElement("br"));
		tr.appendChild(td);
		tr.appendChild(document.createElement("td"));
		tr.appendChild(document.createElement("td"));
	}
}

function addCallback(tab) {
	var url = "http://www.google.com/bookmarks/mark?op=edit&bkmk=" + encodeURIComponent(tab.url) + "&title=" + encodeURIComponent(tab.title);
	chrome.tabs.create({url: url});
	window.close();
}

function addBookmark() {
	chrome.tabs.getSelected(null, addCallback);
}

document.addEventListener('DOMContentLoaded', displayBookmarks);

