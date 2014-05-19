var crypto = require('crypto');
var fs = require('fs');
var rr = require('readdir-recursive');

function run () {
	//Open the directory and, for each file, parse the reg
	rr.file("code-test", function(file) {
		hash(file, function (f) {
			fs.stat(file, function (err, stats) {
				f["mtime"] = stats.mtime
				console.log(f)
//				console.log(stats.mtime)
			})
		});
	})
}

function hash (filename, callback) {
	
	var shasum = crypto.createHash('sha256');
	var s = fs.ReadStream(filename);
	s.on('data', function(d) {
	  shasum.update(d);
	});
	s.on('end', function() {
	  var d = shasum.digest('hex');
//	});
//	s.on('close', function (){
	  callback({"sha256":d, "f": filename});
	})
}

run()