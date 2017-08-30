/**
 * @type {?StarField}
 */
var starField = null;

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
	window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

window.onload = function() {
	starField = new StarField('main_canvas', {
		speed: 150,
		amount: 150,
		drawMethod: StarField.DrawMethod.RECTS,
		max_size: 10
	});
	_loop_();
};

window.addEventListener('resize', function() {
	starField.resize(window.innerWidth, window.innerHeight);
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
}


/**
 * @param {string} canvasClass
 * @param {{
 *     speed: number,
 *     amount: number,
 *     max_depth: number,
 *     max_size: number,
 *     drawMethod: StarField.DrawMethod
 * }} settings
 * @constructor
 */
var StarField = function(canvasClass, settings) {
	this.stars = [];

	/**
	 * @type {number}
	 */
	this.max_depth = settings.max_depth || 1000;

	/**
	 * @type {number}
	 */
	this.max_size = settings.max_size || 3;

	/**
	 * @type {number}
	 */
	this.speed = settings.speed || 150;

	/**
	 * @type {number}
	 */
	this.amount = settings.amount || 150;

	/**
	 * @type {StarField.DrawMethod}
	 */
	this.method = settings.drawMethod || StarField.DrawMethod.RECTS;

	this.last_frame = 0;
	this.fps_time = 0;
	this.fps_count = 0;
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
	var pos = 0, x, y;
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
	this.resize(window.innerWidth, window.innerHeight);
	this.ctx.font = '18px Arial';

	this.reset_origin();

	// clear the array
	this.stars.length = 0;
	this.init_stars();
};


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
	anim_id = window.requestAnimationFrame(_update_);
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

