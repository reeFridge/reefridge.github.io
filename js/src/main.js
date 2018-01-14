/**
 * @type {?StarField}
 */
var starField = null;

function main() {
	starField = new StarField('main_canvas', {
		max_size: 10
	});

	var pinned = document.getElementById('pinned_top');
	pinned.style.top = Math.floor(window.innerHeight / 2 - pinned.getBoundingClientRect().height / 2) + 'px';

	var content = document.getElementById('content');
	content.classList.add('glow');

	_loop_();
}

function updateHeader() {
	var pinned = document.getElementById('pinned_top');
	var content = document.getElementById('content');
	var header = document.getElementById('header');

	var yOffset = window.pageYOffset;
	var padding = 200;

	if (yOffset === 0) {
		content.classList.add('glow');
	} else {
		content.classList.remove('glow');
	}

	if (yOffset < window.innerHeight - padding) {
		pinned.classList.remove('substrate');
		pinned.style.top = Math.floor((window.innerHeight - yOffset) / 2 - pinned.getBoundingClientRect().height / 2) + 'px';
		header.classList.remove('visible');
	} else {
		pinned.classList.add('substrate');
		header.classList.add('visible');
	}
}

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
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
function rand_range(min, max) {
	return min + Math.random() * (max-min);
}

window.requestAnimationFrame =
	window.requestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.msRequestAnimationFrame;

window.addEventListener('load', main);

window.addEventListener('resize', function() {
	starField.resize(window.innerWidth, window.innerHeight - 50);

	updateHeader();
});

window.addEventListener('scroll', updateHeader);
