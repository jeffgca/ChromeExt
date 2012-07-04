var bookmarksXML = "http://www.google.com/bookmarks/?output=xml&num=100000";
var xhr = new XMLHttpRequest();
var xml;
var style = "font-family:Arial;font-size:12;color:black;cursor:default";
var debgcolor = 'white';
var divstyle = "overflow:auto;width:220;background-color:" + debgcolor;
var tablestyle = "border-style:groove;border-color:lightgrey;width:200";

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
	var color = debgcolor;
	if (on) {
		color = 'lightblue';
	}
	obj.style.backgroundColor = color;
}

function displayBookmarks() {
	xhr.open("GET", bookmarksXML, true);
	xhr.onreadystatechange = useBookmarks;
	xhr.send(null);
}

function useBookmarks() {
	if (xhr.readyState == 4) {
		xml = xhr.responseXML.documentElement;
		document.write("<table><tr valign=\"top\"><td><div style=\"" + divstyle + "\"><table cellspacing=0 cellpadding=0 style=\"" + tablestyle + "\">");
		menuItem("Add Bookmark", mouseDownAddText, null, "", true);
		getLabels(xml);
		getBookmarksWOLabels(xml);
		document.write("</table></div></td><td><div id=\"submenu\" style=\"" + divstyle + "\"></div></td></tr></table>");
	}
}

function localesort(str1, str2) {
	return str1.toLowerCase().localeCompare(str2.toLowerCase())
}

function getLabels(xml) {
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
		menuItem(array[i], mouseDownLabelText, array[i], ">", linesep);
	}
}

function getBookmarksWOLabels(xml) {
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
			menuItem(titlet, mouseDownBookmarkText, urlt, "", false);
		}
	}
}

function bookmarkSelection(event, par) {
	chrome.tabs.create({url: par});
	window.close();
}

function labelSelection(event, par) {
	blue(event);
	sm = document.getElementById("submenu");
	j = document.getElementById("subtable");
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
	table = document.createElement("table");
	table.setAttribute("id", "subtable");
	table.setAttribute("style", tablestyle);
	table.setAttribute("cellspacing", "0");
	table.setAttribute("cellpadding", "0");

	var array = getBookmarksForLabel(label)

	for (var i = 0; i < array.length; ++i) {
		tr = document.createElement("tr");
		tr.setAttribute("style", style);
		mouseDownBookmarkText(tr, array[i].url);
		tr.addEventListener("mouseout", white);
		td = document.createElement("td");
		text = document.createTextNode(array[i].title);
		td.appendChild(text);
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

function menuItem(title, mousefunc, mouseparam, separator, lineseparator) {
	var ret = "<tr ";
	ret += "style=" + style + " id='" + title + "' ";
	ret += "><td>" + title + "</td><td>" + separator +"</td></tr>";
	if (lineseparator) {
		ret += "<tr style=\"background-color:black;font-size:1\"><td><br></td><td></td></tr>";
	}
	document.write(ret);
	var item = document.getElementById(title);
	mousefunc(item, mouseparam);
	item.addEventListener("mouseout", white);
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

