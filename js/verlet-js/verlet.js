
/*
Copyright 2013 Sub Protocol and other contributors
http://subprotocol.com/

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*
  这写法有趣 
  1.看requestAnimationFrame是否存在
  2.requestAnimation不存在 则根据浏览器不同引用到她
  3.如果浏览器不支持requestAnimation 就做降级处理 定义每秒60的帧频率
  ps:这段代码写得好有文化 牛叉！
  link: requestAnimation用法  http://mzhou.me/article/95467/
*/

window.requestAnimFrame = window.requestAnimationFrame
|| window.webkitRequestAnimationFrame
|| window.mozRequestAnimationFrame
|| window.oRequestAnimationFrame
|| window.msRequestAnimationFrame
|| function(callback) {
	window.setTimeout(callback, 1000 / 60);
};

/*
 particle:粒子 (单词翻译咱都写上了，哥们多够意思！ - -)
 等等 这里一个粒子为什么要用两个向量来表示???
 、
*/

function Particle(pos) {
	this.pos = (new Vec2()).mutableSet(pos);
	this.lastPos = (new Vec2()).mutableSet(pos);
}

Particle.prototype.draw = function(ctx) {
	ctx.beginPath();
	//莫非 这是在画圆？
	ctx.arc(this.pos.x, this.pos.y, 2, 0, 2*Math.PI);
	ctx.fillStyle = "#2dad8f";
	ctx.fill();
}

var VerletJS = function(width, height, canvas) {
	this.width = width;
	this.height = height;
	this.canvas = canvas;
	this.ctx = canvas.getContext("2d");
	this.mouse = new Vec2(0,0);
	this.mouseDown = false;
	this.draggedEntity = null;
	this.selectionRadius = 20;//传说中的鲁棒？
	this.highlightColor = "#4f545c";
	
	this.bounds = function (particle) {  //看不懂了...
		if (particle.pos.y > this.height-1)
			particle.pos.y = this.height-1;
		
		if (particle.pos.x < 0)
			particle.pos.x = 0;

		if (particle.pos.x > this.width-1)
			particle.pos.x = this.width-1;
	}
	
	var _this = this;
	
	// prevent context menu
	this.canvas.oncontextmenu = function(e) {
		e.preventDefault();
	};
	
	this.canvas.onmousedown = function(e) {
		_this.mouseDown = true;
		var nearest = _this.nearestEntity();
		if (nearest) {
			_this.draggedEntity = nearest;
		}
	};
	
	this.canvas.onmouseup = function(e) {
		_this.mouseDown = false;
		_this.draggedEntity = null;
	};
	
	this.canvas.onmousemove = function(e) {
		var rect = _this.canvas.getBoundingClientRect();
		_this.mouse.x = e.clientX - rect.left;
		_this.mouse.y = e.clientY - rect.top;
	};	
	
	// simulation params
	this.gravity = new Vec2(0,0.2); //重力加速度  12/60 ??
	this.friction = 0.99;//摩擦力
	this.groundFriction = 0.8;//地面摩擦力
	
	// holds composite entities
	this.composites = [];//混合物体？？？
}

//物体由粒子和约束构成？？
VerletJS.prototype.Composite = function() {
	this.particles = []; //粒子
	this.constraints = [];//约束
	
	this.drawParticles = null;
	this.drawConstraints = null;
}

VerletJS.prototype.Composite.prototype.pin = function(index, pos) {
	pos = pos || this.particles[index].pos;
	var pc = new PinConstraint(this.particles[index], pos);
	this.constraints.push(pc);
	return pc;
}


//重点到了 真正的计算方法
VerletJS.prototype.frame = function(step) {
	var i, j, c;

	//在一个frame力物体的运功
	//所有物体同同时受重力和惯性的影响
	//另外地面上的运动物体还受地面摩擦力影响
	for (c in this.composites) {
		for (i in this.composites[c].particles) {
			var particles = this.composites[c].particles;//遍历世界中的所有粒子
			
			// calculate velocity  //计算速率
			//和上一个位置减 然后乘以约束
			var velocity = particles[i].pos.sub(particles[i].lastPos).scale(this.friction);
		
			// ground friction //计算地面摩擦
			//粒子距离地面只有一个像素 并且速率的平方和大于 0.000001 计算地摩擦力
			if (particles[i].pos.y >= this.height-1 && velocity.length2() > 0.000001) {
				var m = velocity.length();
				velocity.x /= m;
				velocity.y /= m;  //x y都除以m 转换为单位向量？ 
				//距离地面的粒子乘以约束的单位向量  乘以摩擦力
				//在单位时间内物体的运动距离 即速度  ？单位向量是加速度？
				//速度乘以加速度乘以地面摩擦力 是这个单位时间内的速度？
				velocity.mutableScale(m*this.groundFriction);
			}
		

			// save last good state
			particles[i].lastPos.mutableSet(particles[i].pos);
		
			// gravity
			particles[i].pos.mutableAdd(this.gravity);  //重力
		
			// inertia	
			particles[i].pos.mutableAdd(velocity);  //惯性
		}
	}
	
	// handle dragging of entities
	if (this.draggedEntity)
		this.draggedEntity.pos.mutableSet(this.mouse);
		
	// relax  //什么意思呢。。  没看懂
	var stepCoef = 1/step;
	for (c in this.composites) {
		var constraints = this.composites[c].constraints;
		for (i=0;i<step;++i)
			for (j in constraints)
				constraints[j].relax(stepCoef);
	}
	
	// bounds checking
	for (c in this.composites) {
		var particles = this.composites[c].particles;
		for (i in particles)
			this.bounds(particles[i]);
	}
}

VerletJS.prototype.draw = function() {
	var i, c;
	
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);	
	
	for (c in this.composites) {  //约束也能画么？？？
		// draw constraints
		if (this.composites[c].drawConstraints) {
			this.composites[c].drawConstraints(this.ctx, this.composites[c]);
		} else {
			var constraints = this.composites[c].constraints;
			for (i in constraints)
				constraints[i].draw(this.ctx);
		}
		
		// draw particles
		if (this.composites[c].drawParticles) {
			this.composites[c].drawParticles(this.ctx, this.composites[c]);
		} else {
			var particles = this.composites[c].particles;
			for (i in particles)
				particles[i].draw(this.ctx);
		}
	}

	// highlight nearest / dragged entity
	//高亮正在被拖拽的 或者最近的实体 （如果有）
	var nearest = this.draggedEntity || this.nearestEntity();
	if (nearest) {
		this.ctx.beginPath();
		this.ctx.arc(nearest.pos.x, nearest.pos.y, 8, 0, 2*Math.PI);
		this.ctx.strokeStyle = this.highlightColor;
		this.ctx.stroke();
	}
}


//这个方法还没研究明白
VerletJS.prototype.nearestEntity = function() {
	var c, i;
	var d2Nearest = 0;
	var entity = null;
	var constraintsNearest = null;
	
	// find nearest point
	for (c in this.composites) {
		var particles = this.composites[c].particles;
		for (i in particles) {
			var d2 = particles[i].pos.dist2(this.mouse);
			if (d2 <= this.selectionRadius*this.selectionRadius && (entity == null || d2 < d2Nearest)) {
				entity = particles[i];
				constraintsNearest = this.composites[c].constraints;
				d2Nearest = d2;
			}
		}
	}
	
	// search for pinned constraints for this entity
	for (i in constraintsNearest)
		if (constraintsNearest[i] instanceof PinConstraint && constraintsNearest[i].a == entity)
			entity = constraintsNearest[i];
	
	return entity;
}

