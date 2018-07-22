/**
 * management of file fd
 *
 */
const fs = require("fs");
const LRU = require("./lru");
const Mutex = require("./mutex");

const lru = new LRU(10);

const mutex = new Mutex();

const ToRelased = {};

const LockFiles = {};

function lockFile(filePath, func) {
	if (!Array.isArray(LockFiles[filePath])) {
		LockFiles[filePath] = [];
	}
	func(function () {
		let funcs = LockFiles[filePath];
		for (let i = 0; i < funcs.length; i++) {
			if ("function" == typeof funcs[i]) {
				funcs[i]();
			}
		}
		delete LockFiles[filePath];
	});
};

function whenFileUnlock(filePath, func) {
	if (!Array.isArray(LockFiles[filePath])) {
		func();
	} else {
		LockFiles[filePath].push(func);
	}
}

function makeFd(filePath, fd) {
	return {
		file: filePath,
		fd: fd,
		ref: 0,
		toRelease: false,
		releasing: false,
		free: function () {
			this.ref = this.ref - 1;

			if (true === this.toRelease && this.ref < 1) {

				let self = this;

				self.releasing = true;

				lockFile(this.file, function (done) {
					fs.close(self.fd, function () {
						delete ToRelased[self.file];
						done();
					});
				})

			}

		},
		alloc: function () {
			this.ref = this.ref + 1;
		}
	};
}

function freeFd(fdObj) {
	fdObj.toRelease = true;
	ToRelased[fdObj.file] = fdObj;
}

function get(filePath, callback) {
	mutex.Lock(function (done) {
		function reply(err, fd) {
			done();
			callback(err, fd);
		}

		let fd = lru.get(filePath);

		if (fd) {
			fd.alloc();
			return reply(null, fd);
		}

		if (filePath in ToRelased) {
			if (true !== ToRelased[filePath].releasing) {
				ToRelased[filePath].toRelease = false;
				let fdObj = ToRelased[filePath];
				delete ToRelased[filePath];
				let tr = lru.add(filePath, fdObj);
				if (null != tr) {
					freeFd(fdObj);
				}
				return reply(null, fdObj);
			}

		}

		whenFileUnlock(filePath, function () {
           
			fs.open(filePath, "r+", function (err, fd) {
              
				if (err) {
					return reply(err);
                }  

				let fdObj = makeFd(filePath,fd);

				let fdToRelease = lru.add(filePath, fdObj);

				if (null != fdToRelease) {
					freeFd(fdToRelease);
				}

				reply(null, fdObj);

			});
		});
	});
}

exports.get = get;

