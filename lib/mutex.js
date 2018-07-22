/**
 * 基于该锁实现一个执行队列
 *
 * 互斥锁，用来做串行化操作
 */
"use strict";

function Mutex() {
	this._mutex = false;
	this._funcQueue = [];
	
}
Mutex.prototype._run=function (func) {
	var self=this;
	var flag=false;
	var done=function () {
		if(!flag){
			flag=true;
			self._mutex=false;
			self._awake();
		}
	};

	if("function" === typeof func){
		func(done);
	}else{
		this._funcQueue.length>0 ? (done()):this._mutex=false;
	}
};

Mutex.prototype.Lock = function (func) {
	 this._funcQueue.push(func);
	 this._awake();
};

Mutex.prototype._locked = function () {
	return this._mutex;
};

Mutex.prototype._awake = function () {
	if (!this._locked()) {
		this._mutex = true;
		var func = this._funcQueue.shift();
		this._run(func);
	}
};

module.exports = Mutex;

