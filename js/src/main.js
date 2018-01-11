/**
 * @type {?StarField}
 */
var starField = null;

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
	window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

window.onload = function() {
	starField = new StarField('main_canvas', {
		max_size: 10
	});

	var pinned = document.getElementById('pinned_top');
	pinned.style.top = Math.floor(window.innerHeight / 2 - pinned.getBoundingClientRect().height / 2) + 'px';

	var content = document.getElementById('content');
	content.classList.add('glow');

	_loop_();
};

window.addEventListener('resize', function() {
	starField.resize(window.innerWidth, window.innerHeight - 50);

	var pinned = document.getElementById('pinned_top');
	var content = document.getElementById('content');

	var yOffset = window.pageYOffset;

	var padding = 300;

	if (yOffset === 0) {
		content.classList.add('glow');
	} else {
		content.classList.remove('glow');
	}

	if (yOffset < window.innerHeight - padding) {
		pinned.classList.remove('substrate');
		pinned.style.top = Math.floor((window.innerHeight - yOffset) / 2 - pinned.getBoundingClientRect().height / 2) + 'px';
	} else {
		pinned.classList.add('substrate');
	}
});

window.addEventListener('scroll', function() {
	var pinned = document.getElementById('pinned_top');
	var content = document.getElementById('content');

	var yOffset = window.pageYOffset;

	var padding = 300;

	if (yOffset === 0) {
		content.classList.add('glow');
	} else {
		content.classList.remove('glow');
	}

	if (yOffset < window.innerHeight - padding) {
		pinned.classList.remove('substrate');
		pinned.style.top = Math.floor((window.innerHeight - yOffset) / 2 - pinned.getBoundingClientRect().height / 2) + 'px';
	} else {
		pinned.classList.add('substrate');
	}
});

/**
 * @param {number} x
 * @param {number} y
 * @constructor
 */
var Vector2 = function(x, y) {
	this.x = x;
	this.y = y;
};


/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @constructor
 */
var Vector3 = function(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
};


/**
 * @param {string} canvasClass
 * @param {StarField.OptionalSettings=} opt_settings
 * @constructor
 */
var StarField = function(canvasClass, opt_settings) {
	this.stars = [];
	/**
	 * @type {StarField.Settings}
	 */
	var default_settings = {
		speed: 150,
		amount: 150,
		max_depth: 1000,
		max_size: 3,
		drawMethod: StarField.DrawMethod.RECTS
	};
	var settings = opt_settings || {};

	/**
	 * @type {number}
	 */
	this.max_depth = settings.max_depth || default_settings.max_depth;

	/**
	 * @type {number}
	 */
	this.max_size = settings.max_size || default_settings.max_size;

	/**
	 * @type {number}
	 */
	this.speed = settings.speed || default_settings.speed;

	/**
	 * @type {number}
	 */
	this.amount = settings.amount || default_settings.amount;

	/**
	 * @type {StarField.DrawMethod}
	 */
	this.method = settings.drawMethod || default_settings.drawMethod;

	/**
	 * @type {number}
	 */
	this.last_frame = 0;

	/**
	 * @type {number}
	 */
	this.fps_time = 0;

	/**
	 * @type {number}
	 */
	this.fps_count = 0;

	/**
	 * @type {number}
	 */
	this.fps = 0;

	/**
	 * @type {Vector2}
	 */
	this.origin = new Vector2(0, 0);

	this._init(canvasClass);
};


/**
 * @param {number} amount
 * @return {void}
 */
StarField.prototype.set_amount = function(amount) {
	this.amount = Math.floor(amount);

	if (this.amount < this.stars.length) {
		this.stars.length = this.amount;
	}
	else {
		var amt = this.amount - this.stars.length;

		for (var i = 0; i < amt; i++)
			this.stars.push(new Vector3(
				rand_range(-this.canvas.width, this.canvas.width),
				rand_range(-this.canvas.height, this.canvas.height),
				rand_range(1, this.max_depth)
			));
	}
};


/**
 * @return {void}
 */
StarField.prototype.init_stars = function() {
	// init the stars
	for (var i = 0; i < this.amount; i++)
		this.stars.push(new Vector3(
			rand_range(-this.canvas.width, this.canvas.width),
			rand_range(-this.canvas.height, this.canvas.height),
			rand_range(1, this.max_depth)
		));
};


/**
 * @param {number} time
 * @return {void}
 */
StarField.prototype.update = function(time) {
	var delta_time = (time - this.last_frame) * 0.001;
	this.update_stars(delta_time);

	if (this.method === 'rects') {
		this.draw_rects();
	} else {
		this.draw_buffer();
	}

	this.last_frame = time;
};


/**
 * @param {number} delta_time
 * @return {void}
 */
StarField.prototype.update_stars = function(delta_time) {
	var distance = this.speed * delta_time;

	for (var i = 0; i < this.stars.length; i++) {
		var star = this.stars[i];

		star.z -= distance;

		if (star.z <= 0) {
			star.x = rand_range(-this.canvas.width, this.canvas.width);
			star.y = rand_range(-this.canvas.height, this.canvas.height);
			star.z = this.max_depth;
		}
	}
};


/**
 * @param {number} width
 * @param {number} height
 * @return {void}
 */
StarField.prototype.resize = function(width, height) {
	this.canvas.width = width;
	this.canvas.height = height;

	this.canvas.style.width = width + 'px';
	this.canvas.style.height = height + 'px';

	// get the buffer
	this.img_data = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

	this.reset_origin();
};



/**
 * @return {void}
 */
StarField.prototype.draw_rects = function() {
	this.ctx.fillStyle = 'rgb(255,255,255)';
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

	for (var i = 0; i < this.stars.length; i++) {
		var star = this.stars[i];
		var k = 256 / star.z;
		var x = star.x * k + this.origin.x;
		var y = star.y * k + this.origin.y;

		var size = ((this.max_depth - star.z) / this.max_depth) * this.max_size;
		this.ctx.fillRect(x, y, size, size);
	}
};


/**
 * @return {void}
 */
StarField.prototype.draw_buffer = function() {
	var pos = 0;
	var length = this.img_data.data.length;
	var width = this.img_data.width * 4;

	for (pos = 0; pos < length; pos++)
		this.img_data.data[pos] = 0;

	for (var i = 0; i < this.stars.length; i++) {
		var star = this.stars[i];

		var k = 256 / star.z;
		var x = Math.floor(star.x * k + this.origin.x);
		var y = Math.floor(star.y * k + this.origin.y);

		if (x > 0 && x < this.canvas.width && y > 0 && y < this.canvas.height) {
			pos = y * width + (x * 4);

			this.img_data.data[pos] = 255;
			this.img_data.data[pos + 1] = 255;
			this.img_data.data[pos + 2] = 255;
			this.img_data.data[pos + 3] = ((this.max_depth - star.z) / this.max_depth) * 255;
		}
	}

	this.ctx.putImageData(this.img_data, 0, 0);
};


/**
 * @param {number} delta_time
 * @return {void}
 */
StarField.prototype.draw_fps = function(delta_time) {
	this.fps_time += delta_time;
	this.fps_count++;

	// update the fps count every second
	if (this.fps_time > 1) {
		this.fps = Math.floor(this.fps_count / this.fps_time);
		this.fps_time = 0;
		this.fps_count = 0;
	}

	this.ctx.fillText('FPS: ' + this.fps, 10, 25);
};


/**
 * @return {void}
 */
StarField.prototype.set_origin = function(x, y) {
	this.origin.x = x;
	this.origin.y = y;
};


/**
 * @return {void}
 */
StarField.prototype.reset_origin = function() {
	this.origin.x = this.canvas.width / 2;
	this.origin.y = this.canvas.height / 2;
};


/**
 * @param {string} canvasClass
 * @private
 */
StarField.prototype._init = function(canvasClass) {
	this.canvas = document.getElementById(canvasClass);
	this.ctx = this.canvas.getContext('2d');
	this.resize(window.innerWidth, window.innerHeight - 50);
	this.ctx.font = '18px Arial';

	this.reset_origin();

	// clear the array
	this.stars.length = 0;
	this.init_stars();
};


/**
 * @typedef {{
 *     speed: number,
 *     amount: number,
 *     max_depth: number,
 *     max_size: number,
 *     drawMethod: StarField.DrawMethod
 * }}
 */
StarField.Settings;


/**
 * @typedef {{
 *     speed: (undefined|number),
 *     amount: (undefined|number),
 *     max_depth: (undefined|number),
 *     max_size: (undefined|number),
 *     drawMethod: (undefined|StarField.DrawMethod)
 * }}
 */
StarField.OptionalSettings;


/**
 * @enum {string}
 */
StarField.DrawMethod = {
	BUFFER: 'buffer',
	RECTS: 'rects'
};


/**
 * @return {void}
 */
function _loop_() {
	window.requestAnimationFrame(_update_);
}


/**
 * @param {number} time
 * @return {void}
 */
function _update_(time) {
	starField.update(time);
	_loop_();
}


/**
 *
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
function rand_range(min, max) {
	return min + Math.random() * (max-min);
}

