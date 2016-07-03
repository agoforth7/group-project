// var req = new XMLHttpRequest();

// req.onreadystatechange = function () {
// 	if (req.readyState === 4) {
// 		console.log(JSON.parse(req.responseText));
// 	}
// };

// req.open('GET', 'https://www.rijksmuseum.nl/api/nl/collection/sk-c-5?key=GIf851yx&format=json');

// req.send(null);


// Each group of ten artworks is paginated by letter.
// var index = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
// for (var i = 0; i < index.length; i++) {
// 	str = index[i];
// }

var App = {
	apiUrl: function (str) {
		return 'https://www.rijksmuseum.nl/api/nl/collection?q=' + str + '&key=GIf851yx&format=json';
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
	this.offset = 0;
	this.thumbsPerPage = 10;
}

AppView.prototype = Object.create(View.prototype);

AppView.prototype.render = function () {
	var _this = this;
	if (!_this.data) {
		this.el.innerHTML = '<p>Loading</p>';
		App.request('GET', App.apiUrl('A'), null, function (data) {
			_this.data = data;
			_this.render();
		});
		return;
	}
	this.el.innerHTML = '<button class="see-more">See More Art!</button>';
	this.renderThumbs();
	this.bindEvents();
};

AppView.prototype.renderThumbs = function () {
	var group = this.el.querySelector('.thumbnail');
	var length;
	if (this.data.length > this.thumbsPerPage) {
		length = this.thumbsPerPage;
	} else {
		length = this.data.length;
	}
	var view;
	for (var i = this.offset; i < length + this.offset; i++) {
		view = new ThumbView(this.data[i]);
		group.appendChild(view.el);
		view.render();
	}
};

AppView.prototype.bindEvents = function () {
	var _this = this;
	var button = this.el.querySelector('button');
	button.addEventListener('click', function () {
		_this.offset += this.thumbsPerPage;
		_this.renderThumbs();
	});
};

// ThumbView

function ThumbView (data) {
	View.call(this, data, 'div');
}

ThumbView.prototype = Object.create(View.prototype);

ThumbView.prototype.render = function () {
	var _this = this;
	if (typeof this.data === 'number') {
		this.el.innerHTML = '<p>Loading</p>';
		App.request('GET', App.apiUrl('item/' + this.data), null, function (data) {
			_this.data = data;
			_this.render();
		});
		return;
	}
	this.el.innerHTML = '<div class="thumbnail"><img src="App.ApiUrl()")>';
	this.bindEvents();
};

ThumbView.prototype.bindEvents = function () {
	var _this = this;
	var showDetail = this.el.querySelector('.detail');
	showDetail.addEventListener('click', function () {
		_this.renderDetail();
	});
};

ThumbView.prototype.renderDetail = function () {
	var view;
	for (var i = 0; i < this.data.kids.length; i++) {
		view = new DetailView(this.data.kids[i]);
		view.render();
	}
};

// ThumbView

function DetailView (data) {
	View.call(this, data, 'div');
}

DetailView.prototype.render = function () {
	var _this = this;
	if (typeof this.data === 'number') {
		this.el.innerHTML = '<p>Loading...</p>';
		App.request('GET', App.apiUrl('item/' + this.data), null, function (data) {
			_this.data = data;
			_this.render();
		});
		return;
	}
	this.el.innerHTML = '<p>Title of Artwork</p><p>Artist Name</p><p>Date</p><p>Medium</p><p>Description</p>';
};

var appView = new AppView();

appView.render();

document.body.appendChild(appView.el);







// key = GIf851yx

// // search the collection using a JSON call
//       function search(query) {
//         return $.getJSON("https://www.rijksmuseum.nl/api/nl/collection?q=Q&key=fpGQTuED&format=json".replace("Q", query));
//       }

//       // creates a thumbnail image for the specified art object
//       function thumbnail(object) {
//         return $("<div>")
//           .addClass("thumb")
//           .css("background-image", "url(" + object.webImage.url.replace("s0", "s128") +")");
//       }

//       // fire the search query
//       search($("#query").val())
//         .done(function(results) {
//           $("#example3-container").empty();

//           var $table = $("#example3-container");
//           $table.html("");

//           // create a row for each art object found
//           $.each(results.artObjects, function(index, object) {
//             console.log(object);   
          
//             var $row = $('<tr class="child"><td>' 
//               + object.objectNumber
//               +'</td><td class="thumbnail">'
//               +'</td><td>'
//               + object.title
//               +'</td></tr>').appendTo($table);
            
//             $row.find(".thumbnail").append(thumbnail(object));

//             // make each row clickable, navigating to the relevant page on the Rijksmuseum website
//             $row.on("click", function() {
//               document.location = object.links.web;
//             });
//           })
//         });