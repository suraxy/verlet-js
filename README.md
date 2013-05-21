verlet-js
=========

不为别的就为了搞那么牛叉的效果

只用了620行js  这也该值得好好捣鼓捣鼓

首先vec2.js定义了向量对象和基本的向量操作

然后verlet.js定义了verlet世界（可以这样叫吧）

世界是由混合物和基本作用力组成

而混合物则是由基本粒子和约束关系组成

基本粒子同时受到世界的基本作用力 和 混合物内部粒子间的约束关系影响

此外verlet.js还定义了一些verlet世界的一些其他的基本规律

然后objects这是在verlet世界中演化出来的基本对象

点、线段、面 以及tire(额，目前还搞不懂这是个什么东西)

最后constraint.js则是定义了 混合物内部会出现的几种约束关系

DistanceConstraint 距离约束

AngleConstraint 角度约束

PinConstraint （中文就叫它 定点约束 吧）

其中的relax反复发是至今仍然没看懂的地方

猜想和verlet算法有关 正是verlet-js这个名字的由来

有兴趣在做进一步挖掘吧

http://www.crazycpp.com/?p=133




License
-------
You may use verlet-js under the terms of the MIT License (See [LICENSE](LICENSE)).


Examples
--------
1. [Shapes (verlet-js Hello world)](http://subprotocol.com/verlet-js/examples/shapes.html)
2. [Fractal Trees](http://subprotocol.com/verlet-js/examples/tree.html)
3. [Cloth](http://subprotocol.com/verlet-js/examples/cloth.html)
4. [Spiderweb](http://subprotocol.com/verlet-js/examples/spiderweb.html)


Code Layout
-----------
1. js/verlet-js/vec2.js: _2d vector implementation_
2. js/verlet-js/constraint.js: _constraint code_
3. js/verlet-js/verlet.js: _verlet-js engine_
4. js/verlet-js/objects.js: _shapes and objects (triangles, circles, tires..)_
