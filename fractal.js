Function.prototype.method = function (name, func) {
    if (!this.prototype[name]) {
	this.prototype[name] = func;
	return this;
    }
};

Object.method('superior', function (name) {
	var that = this, method = that[name];
	return function () {
	    return method.apply(that, argumets);
	};
    });


var circle = {};

(function () {
    //
    //  Complex Numbers:  z = a + i*b
    //  Arithmetic operators for complex numbers
    //  JavaScript type conversion operator
    //
    function Complex(real, imaginary) {
	this.a = real;
	this.b = imaginary;
    }
    Complex.prototype.add  = function(z) { return new Complex(this.a + z.a, this.b + z.b); };
    Complex.prototype.sub  = function(z) { return new Complex(this.a - z.a, this.b - z.b); };
    Complex.prototype.mul  = function(z) { return new Complex(this.a * z.a - this.b * z.b, this.a * z.b + this.b * z.a);  };
    Complex.prototype.div  = function(z) { var d=this.abs2(); return new Complex((this.a*z.a+this.b*z.b)/d, (this.b*z.a-this.a*z.b)/d); };
    Complex.prototype.abs2 = function() { return this.a*this.a + this.b*this.b; };
    Complex.prototype.abs  = function() { return Math.sqrt(this.abs2()); };
    Complex.prototype.neg  = function() { return new Complex(-this.a, - this.b); };
    Complex.prototype.toString = function() { return this.a.toString().substring(0,6) + (this.b>=0?"+":"") + this.b.toString().substring(0,6) + "&middot;i"; };

    var pallet = [];
    pallet.build = function () {
	var max = document.getElementById('pallet').height;
	var o = 2*Math.PI/max;
	var p = 1/3*2*Math.PI;
	var q = 2/3*2*Math.PI;
	for (var i=0; i < max; i++) {
	    var a = i*o;
	    var r = Math.floor(128 + 128*Math.sin( a + q));
	    var g = Math.floor(128 + 128*Math.sin( a    ));
	    var b = Math.floor(128 + 128*Math.sin( a + p));
	    pallet[i] = 'rgb('+r+','+g+','+b+')';
	}
    };
    pallet.show = function () {
	var max = document.getElementById('pallet').height;
	var ctx = document.getElementById('pallet').getContext('2d');
	for (var i=0; i < max; i++) {
	    ctx.fillStyle = pallet[i];
	    ctx.fillRect(0,i,ctx.canvas.width,1);
	}
    };


    var draw_pixel = function (ctx, x, y, fs) {
	ctx.fillStyle = fs;
	ctx.fillRect(x,y,1,1);
    };
    var mouse_to_xy = function (event) {
	var x = event.offsetX || (event.pageX - event.currentTarget.offsetLeft);
	var y = event.offsetY || (event.pageY - event.currentTarget.offsetTop);
	return {x:x, y:y};
    };

    var fractal = function (spec, my) {
	spec = spec || {};
	spec.itrMax  = spec.itrMax  || 1024;
	spec.pallet  = spec.pallet  || pallet;
	spec.bound   = spec.bound   || 2.0;
	spec.id      = spec.id      || "fractal";
	spec.idPts   = spec.idPts   || spec.id+"Pts";
	spec.idItr   = spec.idItr   || spec.id+"Itr";
	spec.set     = spec.set     || document.getElementById(spec.id).getContext('2d');
	spec.pts     = spec.pts     || document.getElementById(spec.idPts).getContext('2d');
	spec.itr     = spec.itr     || document.getElementById(spec.idItr).getContext('2d');
	spec.tl      = spec.tl      || new Complex(-2,+2);
	spec.br      = spec.br      || new Complex(+2,-2);
	spec.func    = spec.func    || function(z) { return z; };

	spec.set.canvas.setAttribute('onclick', spec.id + '.click(event)');
	spec.set.canvas.setAttribute('onmousemove', spec.id + '.mousemove(event)');

	var that = {};
	my = my || {}

	var xy_to_z = function (x, y) {
	    x = x / (spec.set.canvas.width-1) * (spec.br.a - spec.tl.a) + spec.tl.a;
	    y = y / (spec.set.canvas.height-1) * (spec.br.b - spec.tl.b) + spec.tl.b;
	    return new Complex(x, y);
	};
	var z_to_xy = function (z) {
	    var x = (z.a - spec.tl.a) / (spec.br.a - spec.tl.a) * (spec.set.canvas.width-1);
	    var y = (z.b - spec.tl.b) / (spec.br.b - spec.tl.b) * (spec.set.canvas.height-1);
	    return {x:x, y:y};
	};

	my.iterate = function (z, c, inspect) {
	    var bound2 = spec.bound * spec.bound;
	    var zPrev;
	    for (var i=0; i < spec.itrMax; i++) {
		if (inspect) { inspect(i, z, c); }
		if (z.abs2() > bound2) {
		    break;
		}
		zPrev = z;
		z = spec.func(z, c);
	    }
	    return {i:i, z:z, zPrev:zPrev};
	};
	my.inspect_setup = function(z, c) {
	    spec.pts.fillStyle = "#ffffff";
	    spec.pts.fillRect(0, 0, spec.pts.canvas.width, spec.pts.canvas.height);

	    spec.pts.fillStyle = "#0000ff";
	    var x = (z.a+2)/4*(spec.pts.canvas.width-1);
	    var y = (z.b-2)/-4*(spec.pts.canvas.height-1);
	    spec.pts.fillRect(x, y, 1, 1);

	    spec.pts.strokeStyle = "#0000ff";
	    spec.pts.beginPath();
	    spec.pts.moveTo(x, y);

	    spec.itr.fillStyle = "#ffffff";
	    spec.itr.strokeStyle = "#00ff00";
	    spec.itr.fillRect(0, 0, spec.itr.canvas.width, spec.itr.canvas.height);
	    spec.itr.beginPath();
	    var mag = (spec.itr.canvas.height-1) - (z.abs())/spec.bound*(spec.itr.canvas.height-1);
	    spec.itr.moveTo(0, mag);
	};
	my.inspect_step = function(i, z, c) {
	    var x = (z.a - -2) / (+2 - -2) * (spec.pts.canvas.width-1);
	    var y = (z.b - +2) / (-2 - +2) * (spec.pts.canvas.height-1);
	    spec.pts.lineTo(x, y);

	    var mag = (spec.itr.canvas.height-1) - (z.abs())/spec.bound*(spec.itr.canvas.height-1);
	    spec.itr.lineTo(i, mag);
	};
	my.inspect_stroke = function() {
	    spec.pts.stroke();
	    spec.itr.stroke();

	    spec.pts.strokeStyle = "#ff0000";
	    spec.pts.beginPath();
	    var x = (spec.pts.canvas.width-1)/2;
	    var y = (spec.pts.canvas.height-1)/2;
	    spec.pts.arc(x,y,x,0,Math.PI*2,true);
	    spec.pts.stroke();
	};
	my.colorize = function(z, c, i, zPrev) {
	    if (i == spec.itrMax) {
		return '#000000';
	    }
	    var deband=0;
	    if (zPrev) {
		var scale = new Complex(spec.bound/zPrev.abs(), 0);
		var max = zPrev.mul(scale);
		max = spec.func(max, c);
		var minpower = max.abs();
		var maxpower = spec.bound;
		deband = (minpower - z.abs())/(minpower - maxpower);
	    }
	    //return pallet[Math.floor(10*(i + deband)) % pallet.length];
	    return pallet[i*13 % pallet.length];
	};
	my.show_vars = function (z0, c, n, zn) {
	    var set = function(name, value) {
		(document.getElementById(spec.id+"_"+name) || {}).innerHTML = (value || "").toString(); 
	    };
	    set("z0", z0);
	    set("c", c);
	    set("n", n);
	    set("zn", zn);
	};
	my.grid = function () {
	    var a, b, from, to;

	    spec.set.strokeStyle = "rgba(200,200,200,0.9)";
	    for (a=-2; a <= 2; a += 1) {
		from = z_to_xy(new Complex(a, +2));
		to = z_to_xy(new Complex(a, -2));

		spec.set.beginPath();
		spec.set.moveTo(from.x, from.y);
		spec.set.lineTo(to.x, to.y);
		spec.set.stroke();
	    }
	    for (b=-2; b <= 2; b += 1) {
		from = z_to_xy(new Complex(-2, b));
		to = z_to_xy(new Complex(+2, b));

		spec.set.beginPath();
		spec.set.moveTo(from.x, from.y);
		spec.set.lineTo(to.x, to.y);
		spec.set.stroke();
	    }
	};

	that.set_c = function(z) {
	    return new Complex(0, 0);
	};
	that.draw = function() {
	    my.line = 0;
	    my.draw_line();
	};
	my.draw_line = function() {
	    for (var x=0; x <= spec.set.canvas.width; x++) {
		var z = xy_to_z(x, my.line);
		var c = that.set_c(z);
		var r = my.iterate(z, c);
		var color = my.colorize(r.z, c, r.i, r.zPrev);
		draw_pixel(spec.set, x, my.line, color);
	    }
	    if (++my.line <= spec.set.canvas.height-1) {
		setTimeout(my.draw_line, 0);
	    } else {
		my.grid();
	    }
	};
	that.click = function(event) {
	    var xy = mouse_to_xy(event);
	    var z = xy_to_z(xy.x, xy.y);
	    var dx = spec.br.a - spec.tl.a;
	    var dy = spec.tl.b - spec.br.b;

	    dx = dx/2;
	    dy = dy/2;

	    spec.tl = new Complex(z.a - dx/2, z.b + dy/2);
	    spec.br = new Complex(z.a + dx/2, z.b - dy/2);

	    that.draw();
	};
	that.mousemove = function(event) {
	    var xy = mouse_to_xy(event);
	    var z = xy_to_z(xy.x, xy.y);
	    var c = that.set_c(z);
	    my.inspect_setup(z, c);
	    var r = my.iterate(z, c, my.inspect_step);
	    my.inspect_stroke();
	    my.show_vars(z, c, r.i, r.z);
	};

	that.get_name = function() {return spec.id;};
	that.says = function() {return spec.saying || '';};

	return that;
    };

    var mandlebrot = function(spec, my) {
	spec.func  = spec.func || function(z, c) { return z.mul(z).add(c); };
	var that = fractal(spec);
	that.set_c = function(z) { return z; };
	return that;
    };

    load = function () {
	pallet.build();
	pallet.show();

	circle = fractal({id:'circle', itrMax:3});
	// circle.draw();

	mb = mandlebrot({id:'mb', itrMax:2048});
	mb.draw();

    };
})();