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

function addSeparator(tr) {
	if (tr != null) {
		var children = tr.childNodes;
		for (var i = 0; i < children.length; ++i) {
			node = children.item(i);
			if (node.tagName.toLowerCase() == "td") {
				if (node.className.length != 0) {
					node.className += " ";
				}
				node.className += "sep";
			}
		}
	}
}

function displayBookmarks() {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", bookmarksXML, true);
	xhr.onreadystatechange = useBookmarks;
	xhr.send();
}

function useBookmarks(xhr) {
	if (xhr.target.readyState == xhr.target.DONE) {
		xml = xhr.target.responseXML.documentElement;
		var div = document.getElementById("towrite");
		var table = document.createElement("table");
		div.appendChild(table);
		var tr = document.createElement("tr");
		table.appendChild(tr);
		var td = document.createElement("td");
		tr.appendChild(td);
		div = document.createElement("div");
		td.appendChild(div);
		div.className = "inner";
		table = document.createElement("table");
		div.appendChild(table);
		table.className = "inner";

		var add = menuItem(table, "Add Bookmark", mouseDownAddText, null, "", true, getFavIcon("http://www.google.com"));
		var lastLabel = getLabels(xml, table);
		var woLab = getBookmarksWOLabels(xml, table);
		if (woLab != null) {
			addSeparator(lastLabel);
		}
		if (woLab != null || lastLabel != null) {
			addSeparator(add);
		}

		td = document.createElement("td");
		tr.appendChild(td);
		div = document.createElement("div");
		td.appendChild(div);
		div.className = "inner";
		div.id = "submenu";
	}
}

function localesort(str1, str2) {
	return str1.toLowerCase().localeCompare(str2.toLowerCase());
}

function getLabels(xml, table) {
	var set = {};
	var nodes = xml.getElementsByTagName("label");
	for (var i = 0; i < nodes.length; ++i) {
		var label = nodes[i].firstChild.nodeValue;
		if (label != null) {
			set[label] = true;
		}
	}
	var array = [];
	for (key in set) {
		array.push(key);
	}
	array = array.sort(localesort);
	var linesep = false;
	var ret = null;
	for (var i = 0; i < array.length; ++i) {
		if (i == array.length - 1) {
			linesep = true;
		}
		ret = menuItem(table, array[i], mouseDownLabelText, array[i], ">", linesep, "folder.png");
	}
	return ret;
}

function getBookmarksWOLabels(xml, table) {
	var nodes = xml.getElementsByTagName("bookmark");
	var ret = null;
	for (var i = 0; i < nodes.length; ++i) {
		var label = nodes[i].getElementsByTagName("label");
		if (label[0] == null) {
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
			ret = menuItem(table, titlet, mouseDownBookmarkText, urlt, "", false, getFavIcon(urlt));
		}
	}
	return ret;
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
	var array = getBookmarksForLabel(par);

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
	var array = [];

	for (var i = 0; i < nodes.length; ++i) {
		var l = nodes[i].getElementsByTagName("label");
		for (var j = 0; j < l.length; ++j) {
			if (l[j].firstChild.nodeValue == label) {
				var url = nodes[i].getElementsByTagName("url");
				if (!url.length) {
					continue;
				}
				var pair = {};
				pair.url = url[0].firstChild.nodeValue;
				var title = nodes[i].getElementsByTagName("title");
				if (title.length) {
					pair.title = title[0].firstChild.nodeValue;
				} else {
					pair.title = pair.url;
				}
				array.push(pair);
				break;
			}
		}
	}
	
	return array.sort(pairSort);
}

function createSubMenu(label) {
	var table = document.createElement("table");
	table.className = "inner";
	table.id = "subtable";

	var array = getBookmarksForLabel(label)

	for (var i = 0; i < array.length; ++i) {
		var tr = document.createElement("tr");
		tr.className = "inner";
		mouseDownBookmarkText(tr, array[i].url);
		tr.addEventListener("mouseout", white);

		var td = document.createElement("td");
		td.className = "img";
		var img = document.createElement("img");
		img.src = getFavIcon(array[i].url);
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
	tr.className = "inner";
	table.appendChild(tr);
	var td = document.createElement("td");
	tr.appendChild(td);
	td.className = "img";
	var img = document.createElement("img");
	td.appendChild(img);
	img.src = imgsrc;
	td = document.createElement("td");
	tr.appendChild(td);
	td.appendChild(document.createTextNode(title));
	td = document.createElement("td");
	tr.appendChild(td);
	td.appendChild(document.createTextNode(separator));
	mousefunc(tr, mouseparam);
	tr.addEventListener("mouseout", white);
	return tr;
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

