verlet-js
=========

不为别的就为了搞那么牛叉的效果

只用了620行js  这也该值得好好捣鼓捣鼓

还不清楚内部是如何实现的

首先弄清楚和verlet算法是什么关系

http://www.crazycpp.com/?p=133

在自己感兴趣的地方加加中文注释 

反正代码不多  即便每句话都写注释也才620行嘛 ^ ^


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
