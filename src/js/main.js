var req = new XMLHttpRequest();

req.onreadystatechange = function () {
	if (req.readyState === 4) {
		console.log(JSON.parse(req.responseText));
	}
};

req.open('GET', 'https://www.rijksmuseum.nl/api/nl/collection/sk-c-5?key=GIf851yx&format=json');

req.send(null);

