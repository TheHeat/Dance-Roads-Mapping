/* Load this script using conditional IE comments if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'dr-icons\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-venue' : '&#xe000;',
			'icon-show' : '&#xe001;',
			'icon-project' : '&#xe002;',
			'icon-team' : '&#xe003;',
			'icon-search' : '&#x73;',
			'icon-menu' : '&#x6d;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		attr = el.getAttribute('data-icon');
		if (attr) {
			addIcon(el, attr);
		}
		c = el.className;
		c = c.match(/icon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
};