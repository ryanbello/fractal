/*
 *  Complex Numbers, two components!
 */
function Complex(real, imaginary) {
    this.x = real;
    this.y = imaginary;
}
/*
 *  Arithmetic operators for complex numbers
 */
Complex.prototype.add = function(b) { return new Complex(this.x + b.x, this.y + b.y); };
Complex.prototype.sub = function(b) { return new Complex(this.x - b.x, this.y - b.y); };
Complex.prototype.mul = function(b) { return new Complex(this.x * b.x - this.y * b.y, this.x * b.y + this.y * b.x);  };
Complex.prototype.div = function(b) { var d=(b.x*b.x+b.y*b.y); return new Complex((this.x*b.x+this.y*b.y)/d, (this.y*b.x-this.x*b.y)/d); }
    Complex.prototype.abs = function() { return Math.sqrt(this.x*this.x + this.y*this.y); };
Complex.prototype.neg = function() { return new Complex(-this.x, -this.y); };
/*
 *  JavaScript type conversion operator
 */
Complex.prototype.toString  = function() { return this.x.toString().substring(0,6) + (this.y>=0?"+":"") + this.y.toString().substring(0,6) + "·i"; };


/*
 *  Utility functions
 */
var busy = 0;
function xy_to_z(x, y, width, height) {
    var w = (width-1)/2;
    var h = (height-1)/2;
    x = 2 * (x - w)/w;
    y = 2 * (h - y)/h;
    return new Complex(x, y);
}
function click_to_z(event) {
    var x = event.offsetX || (event.pageX - event.currentTarget.offsetLeft);
    var y = event.offsetY || (event.pageY - event.currentTarget.offsetTop);
    var z = xy_to_z(x, y, event.currentTarget.width, event.currentTarget.height);
    return z;
}
function show_var_m(z0, c, n, zn) {
    n++;
    document.getElementById("m_z0").innerHTML = z0.toString();
    document.getElementById("m_c").innerHTML = c.toString();
    document.getElementById("m_n").innerHTML = n.toString();
    document.getElementById("m_zn").innerHTML = zn.toString();
}
function show_var_j(z0, c, n, zn) {
    n++;
    document.getElementById("j_z0").innerHTML = z0.toString();
    document.getElementById("j_c").innerHTML = c.toString();
    document.getElementById("j_n").innerHTML = n.toString();
    document.getElementById("j_zn").innerHTML = zn.toString();
}
function draw_pixel(ctx, x, y, r) {
    var fs = r;
    if (typeof(fs) != "string") {
	if (r.iterations == 256) {
            fs = "#000000";
	} else {
            var b = Math.floor(255-r.z.abs());
            if (b > 255) b = 255;
            if (b < 0) b = 0;
            var i = Math.floor(255-16*Math.sqrt(r.iterations));
            fs = 'rgb(' + i + ',' + i + ','+ b +')';
	}
    }
    ctx.fillStyle = fs;
    ctx.fillRect(x,y,1,1);
}
function grid_draw(graph, c) {
    var canvas = graph.canvas
        var ctx = graph.ctx;
    ctx.strokeStyle = "rgba(200,200,200,0.9)";
    ctx.fillStyle = "rgba(200,200,200,0.9)";
    for (var i=0; i <= 4; i++) {
	var x = (canvas.width-1)/4*i + 0.5;
	ctx.beginPath();
	ctx.moveTo(x, 0);
	ctx.lineTo(x, canvas.height);
	ctx.stroke();
    }
    for (var i=0; i <= 4; i++) {
	var y = (canvas.width-1)/4*i + 0.5;
	ctx.beginPath();
	ctx.moveTo(0, y);
	ctx.lineTo(canvas.width, y);
	ctx.stroke();
    }
    if (c) {

    }
}

/*
 *  Fractal essence: does z = z^2 + c diverge?
 */
function fractal_inner_loop(z, c, max_iterations, max_magnitude) {
    var mm2 = max_magnitude * max_magnitude;
    var i;
    for (i=0; i < max_iterations; i++) {
	z = z.mul(z).add(c);
	var m2 = z.x*z.x + z.y*z.y;
	if (m2 > mm2) {
            break;
	}
    }
    return { "iterations": i, "z": z }
}

mandelbrot = {
    draw: function() {
	this.canvas = document.getElementById('mandelbrot');
	this.ctx = this.canvas.getContext('2d');
	this.y = 0;
	this.draw_line();
	busy++;
    },
    draw_line: function() {
	for (var x=0; x <= this.canvas.width; x++) {
            var z = xy_to_z(x, this.y, this.canvas.width, this.canvas.height);
            var r = fractal_inner_loop(z, z, 256, 2);
            draw_pixel(this.ctx, x, this.y, r);
	}
	if (++this.y < this.canvas.height) {
            var _this = this;
            setTimeout(function(){_this.draw_line();}, 0);
	} else {
            grid_draw(this);
            busy--;
	}
    },
    click: function(event) {
	var z = click_to_z(event);
	julia.draw(z);
	var r = iterate_draw_j(z, z);
	show_var_j(z, z, r.iterations, r.z);
    },
    mousemove: function(event) {
	if (!busy) {
            var z = click_to_z(event);
            var r = iterate_draw_m(z, z);
            show_var_m(z, z, r.iterations, r.z);
	}
    }
};

julia = {
    c: new Complex(0,0),
    draw: function(c) {
	document.getElementById("point").innerHTML = c;
	this.canvas = document.getElementById('julia');
	this.ctx = this.canvas.getContext('2d');
	this.y = 0;
	this.c = c;
	this.draw_line();
	busy++;
    },
    draw_line: function() {
	for (var x=0; x <= this.canvas.width; x++) {
            var z = xy_to_z(x, this.y, this.canvas.width, this.canvas.height);
            var r = fractal_inner_loop(z, this.c, 256, 2);
            draw_pixel(this.ctx, x, this.y, r);
	}
	if (++this.y < this.canvas.height) {
            var _this = this;
            setTimeout(function(){_this.draw_line();}, 0);
	} else {
            grid_draw(this);
            busy--;
	}
    },
    click: function(event) {
      var z = click_to_z(event);
      julia.draw(z);
      var r = iterate_draw_j(z, julia.c);
      show_var_j(z, julia.c, r.iterations, r.z);
    },
    mousemove: function(event) {
	if (!busy) {
            var z = click_to_z(event);
            var r = iterate_draw_j(z, julia.c);
            show_var_j(z, julia.c, r.iterations, r.z);
	}
    }
};

function iterate_draw_m(z, c) {
    // Poles
    var poles = {};
    poles.canvas = document.getElementById('mpoles');
    poles.ctx = poles.canvas.getContext('2d');
    poles.ctx.fillStyle = "#ffffff";
    poles.ctx.strokeStyle = "#0000ff";
    poles.ctx.fillRect(0, 0, poles.canvas.width, poles.canvas.height);
    poles.mid = (poles.canvas.width-1)/2;

    // Iters
    var iters = {};
    iters.canvas = document.getElementById('miters');
    iters.ctx = iters.canvas.getContext('2d');
    iters.ctx.fillStyle = "#ffffff";
    iters.ctx.strokeStyle = "#00ff00";
    iters.ctx.fillRect(0, 0, iters.canvas.width, iters.canvas.height);
    iters.mid = (iters.canvas.width-1)/2;

    // Fractal inner loop exposed
    var max_magnitude = 2;
    var max_iterations = 1000;
    var mm2 = max_magnitude * max_magnitude;
    poles.ctx.beginPath();
    poles.ctx.moveTo(poles.mid+poles.mid*z.x/2, poles.mid-poles.mid*z.y/2)
        iters.ctx.beginPath();
    iters.ctx.moveTo(0, iters.mid-iters.mid*z.abs()/2)
        var i;
    for (i=0; i < max_iterations; i++) {
	z = z.mul(z).add(c);

	poles.ctx.lineTo(poles.mid+poles.mid*z.x/2, poles.mid-poles.mid*z.y/2);
	iters.ctx.lineTo(i, iters.mid-iters.mid*z.abs()/2);

	var m2 = z.x*z.x + z.y*z.y;
	if (m2 >= mm2) {
            break;
	}
    }
    poles.ctx.stroke();
    iters.ctx.stroke();
    grid_draw(poles);
    grid_draw(iters);

    poles.ctx.strokeStyle = "#ff0000";
    poles.ctx.beginPath();
    poles.ctx.arc(poles.mid,poles.mid,poles.mid,0,Math.PI*2,true);
    poles.ctx.stroke();

    iters.ctx.strokeStyle = "#ff0000";
    iters.ctx.beginPath();
    iters.ctx.moveTo(0, 0.5);
    iters.ctx.lineTo(iters.canvas.width, 0.5);
    iters.ctx.moveTo(0, iters.canvas.width-0.5);
    iters.ctx.lineTo(iters.canvas.width, iters.canvas.width-0.5);
    iters.ctx.stroke();

    return { "iterations": i, "z": z }
}

function iterate_draw_j(z, c) {
    // Poles
    var poles = {};
    poles.canvas = document.getElementById('jpoles');
    poles.ctx = poles.canvas.getContext('2d');
    poles.ctx.fillStyle = "#ffffff";
    poles.ctx.strokeStyle = "#0000ff";
    poles.ctx.fillRect(0, 0, poles.canvas.width, poles.canvas.height);
    poles.mid = (poles.canvas.width-1)/2;

    // Iters
    var iters = {};
    iters.canvas = document.getElementById('jiters');
    iters.ctx = iters.canvas.getContext('2d');
    iters.ctx.fillStyle = "#ffffff";
    iters.ctx.strokeStyle = "#00ff00";
    iters.ctx.fillRect(0, 0, iters.canvas.width, iters.canvas.height);
    iters.mid = (iters.canvas.width-1)/2;

    // Fractal inner loop exposed
    var max_magnitude = 2;
    var max_iterations = 1000;
    var mm2 = max_magnitude * max_magnitude;
    poles.ctx.beginPath();
    poles.ctx.moveTo(poles.mid+poles.mid*z.x/2, poles.mid-poles.mid*z.y/2)
        iters.ctx.beginPath();
    iters.ctx.moveTo(0, iters.mid-iters.mid*z.abs()/2)
        var i;
    for (i=0; i < max_iterations; i++) {
	z = z.mul(z).add(c);

	poles.ctx.lineTo(poles.mid+poles.mid*z.x/2, poles.mid-poles.mid*z.y/2);
	iters.ctx.lineTo(i, iters.mid-iters.mid*z.abs()/2);

	var m2 = z.x*z.x + z.y*z.y;
	if (m2 >= mm2) {
            break;
	}
    }
    poles.ctx.stroke();
    iters.ctx.stroke();
    grid_draw(poles);
    grid_draw(iters);

    poles.ctx.strokeStyle = "#ff0000";
    poles.ctx.beginPath();
    poles.ctx.arc(poles.mid,poles.mid,poles.mid,0,Math.PI*2,true);
    poles.ctx.stroke();

    iters.ctx.strokeStyle = "#ff0000";
    iters.ctx.beginPath();
    iters.ctx.moveTo(0, 0.5);
    iters.ctx.lineTo(iters.canvas.width, 0.5);
    iters.ctx.moveTo(0, iters.canvas.width-0.5);
    iters.ctx.lineTo(iters.canvas.width, iters.canvas.width-0.5);
    iters.ctx.stroke();

    return { "iterations": i, "z": z }
}


function onload() {
    //var z = new Complex(-0.5, 0.55);
    var z = new Complex(-0.092, 0.996);
    mandelbrot.draw();
    julia.draw(z);
    iterate_draw_m(z, z);
    iterate_draw_j(z, z);
    show_var_m(z, z, 1000, 1/0);
    show_var_j(z, z, 1000, 1/0);

}