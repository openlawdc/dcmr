var fs = require("fs");
var path = require("path")
var rr = require('readdir-recursive');
var _ = require("underscore");
var et = require('elementtree');

function run () {
	rr.file("code-test", function(file) {
		readReg(file, function () {
		});
	})
} 

function test () {
	readReg("./code-test/1/1-1/1-102.txt", function () {
		console.log("Done!")
	})
}

//Open the directory

//For each file, read the text and fire off the parser
function readReg (f, callback) {
	var fname = path.basename(f, '.txt')
	var out = fs.readFileSync(f, 'utf-8');
	// Combine the lines together
	combineLines(out, function (r) {
		buildRegTree(r, fname, function (rt) {
			fs.writeFileSync("./code-xml/" + fname + ".xml", rt, {encoding:"utf8"})
			callback();
		})
	})
}

function combineLines (txt, callback) {
	var combined = txt.replace(/([^\s])(\n)([^\n])/g, "$1");
	
	//Clean up double-spaces
	while (combined.match(/  /g)) {
		combined = combined.replace(/  /g," ")
	}
	// Clean up leading whitespace
	while (combined.match(/\n\s/g)) {
		combined = combined.replace(/\n\s/g,"\n")
	}
	//Clean up double lines
	while (combined.match(/\n\s?\n/g)) {
		combined = combined.replace(/\n\s?\n/g,"\n")
	}
	callback(combined)
}

function buildRegTree (r, name, callback) {
	var XML = et.XML;
	var ElementTree = et.ElementTree;
	var element = et.Element;
	var subElement = et.SubElement;
	var root, etree, level, sublevel, xml;

	//Initialize the tree
	var root = element("level");
	subElement(root, "type").text = "section";
	subElement(root, "num").text = name;

	//Now we traverse the tree
	var lines = r.split(/\n/)
	_.each(lines, function (line, index, err) {
		if (index == 0) {
			// Ignore the first line
		} else if (index == 1) {
			// The second line is the section header 
			subElement(root, "heading").text = line
		} else if (line.match(/^(\d+\.\d+)/)) {
			// This is a subsection
			var level = subElement(root, "level");
			var num = et.Element("num")
			num.text = line.match(/^(\d+\.\d+\.)/)[0]
			level.append(num)
			var text = et.Element("text");
			text.text = line.replace(/^(\d+\.\d+\.)/,"");
			level.append(text);
		} else if (line.match(/^\(\w\).*/g)) {
			// This is a paragraph 
			var sublevel = et.Element("level");
			var num = et.Element("num")
			num.text = line.match(/^\(\w\)/)[0]
			console.log(line.match(/^\(\w\)/))
			sublevel.append(num)
			var text = et.Element("text");
			text.text = line.replace(/^\(\w\)/,"");
			sublevel.append(text);
			level = root.getchildren()[root.getchildren().length-1];
			level.append(sublevel)
		} else {
			// TODO: Add subparagraphs and errors
			console.log("None!")
		}
	})

	etree = new ElementTree(root);
	xml = etree.write({'xml_declaration': false});
	callback(xml)
}

test()