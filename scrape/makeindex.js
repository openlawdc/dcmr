var et = require('elementtree');
var fs = require('fs');
var walk = require('walkdir');
var _ = require('underscore');
var path = require('path')
var beautify_html = require('js-beautify').html;

function start () {
	run("code-xml/code-text/", [], function (titles) {
		makeTitlesIndex(titles, function (xml) {
			fs.writeFileSync('code-xml/code-text/index.xml', beautify_html(xml, {indent_size: 2}), {encoding:"utf8"})
		});
		_.each(titles, function (t) {
			run(t, [], function (chapters) {
				makeChapterIndex(path.basename(t), "", chapters, function (xml) {
					fs.writeFileSync(t + "/index.xml", beautify_html(xml, {indent_size: 2}), {encoding:"utf8"})
				})
				_.each(chapters, function (c) {
					runfiles(c, [], function (r) {
						makeRuleIndex(path.basename(c), "", r, function (xml) {
							fs.writeFileSync(c + '/index.xml', beautify_html(xml, {indent_size: 2}), {encoding:"utf8"})
						})
					})
				})
			})
		})
	})
}

function run (dir, array, callback) {
	var emitter = walk(dir, {"no_recurse":true})
	emitter.on('directory', function (path, stat) {
		array.push(path)
	})
	emitter.on('end', function () {
		callback(array)
	})
}


function runfiles (dir, array, callback) {
	var emitter = walk(dir, {"no_recurse":true})
	emitter.on('file', function (path, stat) {
		array.push(path)
	})
	emitter.on('end', function () {
		callback(array)
	})
}



function makeTitlesIndex (titles, callback) {
	root = et.Element("level")
	et.SubElement(root, "type").text = "toc"
	et.SubElement(root, "heading").text = "D.C. Municipal Regulations"
	var meta = et.SubElement(root, "meta")
	et.SubElement(meta, "recency").text = new Date().toJSON().slice(0,10)
	_.each(titles, function (t){
		url = path.basename(t) + '/index.xml'
		var title = et.Element("{http://www.w3.org/2001/XInclude}include")
		title.attrib["href"] = url
		root.append(title)
	})
	etree = new et.ElementTree(root);
	xml = etree.write({'xml_declaration': false});
	callback(xml)
}

function makeChapterIndex (title, heading, chapters, callback) {
	root = et.Element("level")
	et.SubElement(root, "type").text = "toc"
	et.SubElement(root, "prefix").text = "Title"
	et.SubElement(root, "num").text = title
	et.SubElement(root, "heading").text = heading
	_.each(chapters, function (c){
		url = path.basename(c) + '/index.xml'
		var ch = et.Element("{http://www.w3.org/2001/XInclude}include")
		ch.attrib["href"] = url
		root.append(ch)
	})
	etree = new et.ElementTree(root);
	xml = etree.write({'xml_declaration': false});
	callback(xml)
}

function makeRuleIndex (chapter, heading, rules, callback) {
	root = et.Element("level");
	et.SubElement(root, "type").text = "toc"
	et.SubElement(root, "prefix").text = "Chapter"
	et.SubElement(root, "num").text = chapter
	et.SubElement(root, "heading").text = heading
	_.each(rules, function (r) {
		url = path.basename(r)
		var rule = et.Element("{http://www.w3.org/2001/XInclude}include")
		rule.attrib["href"] = url
		root.append(rule)
	})
	etree = new et.ElementTree(root);
	xml = etree.write({'xml_declaration': false});
	callback(xml)
}

start()