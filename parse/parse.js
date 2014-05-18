var fs = require("fs");
var path = require("path")
var rr = require('readdir-recursive');
var _ = require("underscore");
var et = require('elementtree');
var mkdirp = require('mkdirp');
var beautify_html = require('js-beautify').html;

function run () {
	//Open the directory and, for each file, parse the reg
	rr.file("code-text", function(file) {
		readReg(file, function () {
		});
	})
} 

function test () {
	readReg("./code-test/1/1-31/1-3199.txt", function () {
		console.log("Done!")
	})
}

function readReg (f, callback) {
	//For the file, read the text and fire off the parser
	var fname = path.basename(f, '.txt')
	var dir = path.dirname(f).replace('./code-test/',"")
	mkdirp.sync("code-xml/" + dir)
	var out = fs.readFileSync(f, 'utf-8');
	// Combine the lines together
	combineLines(out, function (r) {
		buildRegTree(r, fname, function (rt) {
			fs.writeFileSync("./code-xml/" + dir + "/" + fname + ".xml", beautify_html(rt, {indent_size: 2}), {encoding:"utf8"})
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
	var anno = et.Element("level");
	var type = et.Element("type");
	type.text = "annotations";
	anno.append(type)

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
			num.text = line.match(/^(\d+\.\d+(\.)?)/)[0]
			level.append(num)
			var text = et.Element("text");
			text.text = line.replace(/^(\d+\.\d+\.)/,"");
			level.append(text);
		} else if (line.match(/^\(\w\).*/g)) {
			// This is a paragraph or a subparagraph
			// TODO: Differentiate between the two...
			var sublevel = et.Element("level");
			var num = et.Element("num")
			num.text = line.match(/^\(\w\)/)[0]
			sublevel.append(num)
			var text = et.Element("text");
			text.text = line.replace(/^\(\w\)/,"");
			sublevel.append(text);
			level = root.getchildren()[root.getchildren().length-1];
			level.append(sublevel)
		} else if (line.match(/^[A-Z]+\:/) || line.match(/^[A-Z]{2}.*\:/)) {
			// Annotation
			var note = et.Element("level")
			var head = et.Element("heading")
			head.text = line.match(/^[A-Z].*\:/)[0].replace("\:","")
			note.append(head);
			var text = et.Element("text");
			text.text = line.replace(/[A-Z].*\:/,"");
			note.append(text);
			anno.append(note);
		} else if (line == "") {
			//Skip the line
		} else if (line.match(/^.*/)) {
			var level = root.getchildren()[root.getchildren().length-1]
			var text = et.Element("text")
			text.text = line
			level.append(text)
			root.insert(root.getchildren().length-1, level)
		} else {
			//Uncaught
			console.log(name + ": line " + index + " -- " + line);
		}
	})
	root.append(anno)
	etree = new ElementTree(root);
	xml = etree.write({'xml_declaration': false});
	callback(xml)
}

run()