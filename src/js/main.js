// var req = new XMLHttpRequest();

// req.onreadystatechange = function () {
// 	if (req.readyState === 4) {
// 		console.log(JSON.parse(req.responseText));
// 	}
// };

// req.open('GET', 'https://www.rijksmuseum.nl/api/nl/collection/sk-c-5?key=GIf851yx&format=json');

// req.send(null);

var App = {
	activeThumbnail: null,
	apiUrl: function (p, ps) {
		// Each group of ten artworks is paginated by number.
		return 'https://www.rijksmuseum.nl/api/en/collection?p=' + p + '&ps=' + ps + '&key=GIf851yx&format=json';
	},
	apiDetailUrl: function (objNum) {
		return 'https://www.rijksmuseum.nl/api/en/collection/' + objNum + '?key=GIf851yx&format=json';
	},
	request: function (method, url, data, callback) {
		var req = new XMLHttpRequest();
		req.open(method || 'GET', url);
		req.onreadystatechange = function () {
			if (req.readyState === 4) {
				callback(JSON.parse(req.responseText));
			}
		}
		req.send(data || null);
	}
};

function View (data, tagName) {
	this.el = document.createElement(tagName || 'div');
	this.data = data;
}

View.prototype.render = function () {};
View.prototype.bindEvents = function () {};

// AppView
function AppView (data) {
	View.call(this, data);
	this.pageNumber = 0;
	this.pageSize = 10;
}

AppView.prototype = Object.create(View.prototype);

AppView.prototype.render = function () {
	var _this = this;
	if (!_this.data) {
		this.el.innerHTML = '<p class="loader">Loading</p>';
		App.request('GET', App.apiUrl(this.pageNumber, this.pageSize), null, function (data) {
			_this.data = data.artObjects;
			_this.render();
		});
		return;
	}

	this.el.innerHTML = `
		<div class="thumbnailBoxes"></div>
		<button class="see-more">See More Art!</button>
	`;
	this.renderThumbnailBoxes();
	this.bindEvents();
};

AppView.prototype.renderThumbnailBoxes = function () {
	var _this = this
	var group = _this.el.querySelector('.thumbnailBoxes');
	group.classList.add('clearfix');
	var length;

	var offset = this.pageNumber * this.pageSize;
	var view;

	for (var i = offset; i < offset + this.pageSize; i++) {

		// console.log( i );
		view = new ThumbView(_this.data[i]);
		group.appendChild(view.el);
		view.render();
	}
};

AppView.prototype.bindEvents = function () {
	var _this = this;
	var button = this.el.querySelector('.see-more');
	button.addEventListener('click', function () {
		_this.pageNumber++;
		App.request('GET', App.apiUrl(_this.pageNumber, _this.pageSize), null, function (data) {
			_this.data = _this.data.concat(data.artObjects);
			_this.renderThumbnailBoxes();
		});
	});
};

// ThumbView

function ThumbView (data) {
	View.call(this, data, 'div');

	// console.log( "Thumbview.constructor called" );
}

ThumbView.prototype = Object.create(View.prototype);

ThumbView.prototype.render = function () {
	var _this = this;
	var objNum = this.data.objectNumber;
	this.el.classList.add('thumbView');
	// console.log(objNum);
	// console.log( "Thumbview.render called" );
	if (typeof this.data === 'number') {
		this.el.innerHTML = '<p class="loader">Loading</p>';
		App.request('GET', App.apiUrl(), null, function (data) {
			_this.data = data;
			// console.log( data );
			_this.render();
		});
		return;
	}
	// console.log(this.data);
	if (this.data.webImage === null) {
		this.el.innerHTML = '<div class="thumbnail"><div class="thumbnail-image" style="background-image: url(build/assets/placeholder.svg)"></div>';
	} else {
		this.el.innerHTML = '<div class="thumbnail"><div class="thumbnail-image" style="background-image: url(' + this.data.webImage.url + ')"></div>';
	}
	this.bindEvents();
};

ThumbView.prototype.bindEvents = function () {
	var _this = this;
	var showDetail = this.el.querySelector('.thumbnail');
	showDetail.addEventListener('click', function () {
		var detailViewEl;

		// If there is an active thumbnail
		if (App.activeThumbnail) {
			// Get the child detail view
			detailViewEl = App.activeThumbnail.el.querySelector('.detailView');
			// Remove it from the DOM
			detailViewEl.parentElement.removeChild(detailViewEl);
			if (App.activeThumbnail === _this) {
				// Toggle it off
				App.activeThumbnail = null;
				// Return early
				return;
			}
		}

		// If it's not the same one, show the next detail view
		App.activeThumbnail = _this;
		_this.renderDetail();
	});
};

ThumbView.prototype.renderDetail = function () {
	var view = new DetailView(this.data.objectNumber);
	// console.log('renderDetail ' + view);
	view.render();
	this.el.appendChild(view.el);
};

// DetailView

function DetailView (data) {
	View.call(this, data, 'div');
}

DetailView.prototype.render = function () {
	var _this = this;
	this.el.classList.add('detailView');
	if (typeof this.data === 'string') {
		this.el.innerHTML = '<p class="loader">Loading...</p>';
		App.request('GET', App.apiDetailUrl(this.data), null, function (data) {
			_this.data = data;
			_this.render();
		});
		return;
	}
	console.log(this.data);
	this.el.innerHTML = `
		<div class="info">
			<h3>${this.data.artObject.title}</h3>
			<p>${this.data.artObject.principalOrFirstMaker}</p>
			<p>${this.data.artObject.dating.year}</p>
			<p>${this.data.artObject.description}</p>
			<img class="bigPicture" src="${this.data.artObject.webImage.url}">
		</div>
	`;
};

var appView = new AppView();

console.log( appView );

// appView.bindEvents();
appView.render();

document.body.appendChild(appView.el);