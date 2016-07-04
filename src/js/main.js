// var req = new XMLHttpRequest();

// req.onreadystatechange = function () {
// 	if (req.readyState === 4) {
// 		console.log(JSON.parse(req.responseText));
// 	}
// };

// req.open('GET', 'https://www.rijksmuseum.nl/api/nl/collection/sk-c-5?key=GIf851yx&format=json');

// req.send(null);

var index = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var iterator = 0;

var App = {
	apiUrl: function () {

		console.log( "INDEX: ", index[iterator] );
		// Each group of ten artworks is paginated by letter.
		return 'https://www.rijksmuseum.nl/api/nl/collection?q=' + index[iterator] + '&key=GIf851yx&format=json';
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
		App.request('GET', App.apiUrl(), null, function (data) {
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
	var group = this.el.querySelector('.thumbnailBoxes');
	group.classList.add('clearfix');
	var length;

	// console.log( "this.data ", this.data );

	if ( this.data.length > this.thumbsPerPage) {
		length = this.thumbsPerPage;
		// console.log( "First: ", this.data.length, length );
	} else {
		length = this.data.length;
		// console.log( "Last: ", this.data.length, length );
	}

	console.log( length, this.data );

	var view;
	for (var i = this.offset; i < length + this.offset; i++) {

		// console.log( i );

		view = new ThumbView(this.data[i]);
		group.appendChild(view.el);
		view.render();
	}
};

AppView.prototype.bindEvents = function () {
	var _this = this;
	var button = this.el.querySelector('.see-more');
	button.addEventListener('click', function () {
		iterator++;
		// App.apiUrl();
		this.thumbsPerPage += 10;
		// _this.offset += this.thumbsPerPage;
		_this.renderThumbnailBoxes();
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
	// console.log( "Thumbview.render called" );
	if (typeof this.data === 'number') {
		this.el.innerHTML = '<p>Loading</p>';
		App.request('GET', App.apiUrl(), null, function (data) {
			_this.data = data;
			// console.log( data );
			_this.render();
		});
		return;
	}
	// console.log(this.data);
	if (this.data.webImage === null) {
		this.el.innerHTML = '<div class="thumbnail"><img src="build/assets/placeholder.svg"></div>';
	} else {
		this.el.innerHTML = '<div class="thumbnail"><img src="' + this.data.webImage.url + '"></div>';
	}
	this.bindEvents();
};

ThumbView.prototype.bindEvents = function () {
	var _this = this;
	var showDetail = this.el.querySelector('.thumbnail');
	showDetail.addEventListener('click', function () {
		_this.renderDetail();
	});
};

ThumbView.prototype.renderDetail = function () {
	var view = new DetailView(this.data);
	// for (var i = 0; i < this.data.kids.length; i++) {
	// 	view = new DetailView(this.data.kids[i]);
	// 	view.render();
	// }
	console.log('renderDetail ' + view);
	view.render();
};

// ThumbView

function DetailView (data) {
	View.call(this, data, 'div');
}

DetailView.prototype.render = function () {
	var _this = this;
	if (typeof this.data === 'number') {
		this.el.innerHTML = '<p>Loading...</p>';
		App.request('GET', App.apiUrl(), null, function (data) {
			_this.data = data;
			_this.render();
		});
		return;
	}
	this.el.innerHTML = `
		<div class="detail-view">
			<p>${this.data.title}</p>
			<p>${this.data.principalOrFirstMaker}</p>
			<p>${this.data.}</p>
			<p>Medium</p>
			<p>Description</p>
			<img class="bigPicture" src="' + this.data.webImage.url + '">
		</div>
	`;
};

var appView = new AppView();

console.log( appView );

// appView.bindEvents();
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