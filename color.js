// color

// r, g, and b are in range [0, 1]
function Color(r, g, b) {
	this.r = r;
	this.g = g;
	this.b = b;
}

Color.prototype = {
	brightness: function() {
		return (this.r + this.g + this.b) / 3;
	},
	
	grayscale: function() {
		var b = this.brightness();
		return new Color(b, b, b);
	},
	
	random: function() {
		return new Color(Math.random(), Math.random(), Math.random());
	},

	saturated: function(nm) {
		// if no hue, then nothing can change it
		if (this.r == this.g && this.g == this.b) {
			return this;
		}
		
		// get portion of each color beyond the shared whiteness
		var wh = 1 - this.saturation();
		var r = this.r - wh;
		var g = this.g - wh;
		var b = this.b - wh;
		
		// make sure the end color is equally bright as the original
		var whNew = wh * nm; ////
		var br = this.brightness();
		var c = br / (r + g + b);
		return new Color(r * c, g * c, b * c);
	},
	
	saturation: function() {
		var min = this.r;
		if (this.g < min) {
			min = this.g;
		}
		if (this.b < min) {
			min = this.b;
		}
		return 1 - min;
	},
	
	toString: function() {
		return 'rgb(' + Math.floor(this.r * 256) + ', ' + Math.floor(this.g * 256) + ', ' + Math.floor(this.b * 256) + ')';
	},
};

Color.fromString = function(s) {
};
	
