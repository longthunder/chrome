(function($, undefined) {
	
function findPattern(link) {
	var pattern = null;
	var id = null;
	for(var i=0;i<patterns_1.length;i++) {
		var p = patterns_1[i];
		var mt = matchLinksWithId(p.links, link);
		if(mt.rt) {
			pattern = p;
			id = mt.id;
			break;
		}
	}
	return {pattern:pattern,id:id};
}

function matchLinksWithId(links, link) {
	var id = null;
	for(var i=0;i<links.length;i++) {
		var _link = links[i];
		if(_link == link) {
			return {rt : true};
		} else {
			var m = link.match(new RegExp('^'+_link+'$'));
			if(m != null) {
				if(m.length > 1) 
					id = m[1]
				return {rt : true , id : id};
			}
		}
	}
	return {rt : false};
}

function pullDataFromDom(url, elements, pattern) {
	//if(elements.length>0)
	//console.log('HTML:'+elements[0].outerHTML)
	if(!pattern || !elements) {
		return {};
	}
	var data = {};
	if(typeof(pattern)=='string') {
		data[pattern] = elements;
		if(typeof(elements) != 'string') {
			elements.each(function(){
				if(/img.club.pchome.net/.test(this.src)) {
					this.src = this.src.replace(/_[0-9]+x[0-9]+/,'')
				}			
			})
		}
		
		return data;
	}	
	$.each(pattern,function(key,value){
		//value is sub pattern
		if(key.indexOf('<') != -1) {
			//list object
			var dataKey = key.split('<')[0];
			var selector = key.split('<')[1];
			if(dataKey=="") {
				throw new Error('dataKey is not null');
			} else {
				var tdata = [];
				$(selector,elements).each(function(){
					//console.log($(this).html())
					var ldata = pullDataFromDom(url, $(this), value)
					tdata.push(ldata);
				})
				data[dataKey] = data[dataKey] || [];
				$.merge(data[dataKey], tdata);
			}
		} else if(key.indexOf('/') == 0) {
			// get element attribute
			key = key.replace(/\//g,'')
			var result;
			if(key == 'href') {
				if(elements.length < 1) {
					//throw new Error('link not found.')
					return null;
				}
				result = elements[0][key];
			}
			else if(key == 'text') {
				result = elements.text();
				if(result == '') {
					result = elements.attr('title');
				}
			} else 
				result = elements.attr(key);
			$.extend(data, pullDataFromDom(url, result, value));
		} else if(key.indexOf('@') == 0) {
			// fn
			key = key.substring(1);
			result = FuncDef[key](elements, url);
			$.extend(data, pullDataFromDom(url, result, value));
		}else if(key.indexOf('$') == 0) {
			// get element
			key = key.substring(1);
			result = key?$(key,elements):elements;
			$.extend(data, pullDataFromDom(url, result, value));
		} else {
			selector = key;
			result = $(selector,elements);
			$.extend(data, pullDataFromDom(url, result, value));
		}
	});
	return data;
}

function stripCSS(html) {
	html = html.replace(/<meta[^>]+>/ig,'');
	html = html.replace(/<link[^>]+>/ig,'');
	html = html.replace(/<base[^>]+>/ig,'');
	html = html.replace(/<style[^>]*>[\d\D]+?<\/style>/ig,'');
	html = html.replace(/<script[^>]*>[\d\D]*?<\/script>/ig,'');
	html = html.replace(/<iframe[^>]*>[\d\D]*?<\/iframe>/ig,'');
	html = html.replace(/<!--[\d\D]*?-->/g,'');
	return html;
}
function toObj_(html) {
	swap = eCache.get('swap');
	html = stripCSS(html)
	//swap[0].innerHTML = html;
	try
	{
		swap.html(html);
	}
	catch (e)
	{
		console.log(html.replace(/\n/,''))
	}
	
	return swap;
}
function toObj(html) {		
	html = stripCSS(html);
	return $('<div>').html(html);
}
function Parser(url) {
	this.m_url = url;
	this.m_pattern = null;
	this.m_target = null;
	this.id = null;
}
Parser.prototype = {
	validate : function() {
		var patternWithId = findPattern(this.m_url);
		var pattern = patternWithId.pattern;
		if(pattern != null) {
			this.m_pattern = pattern;
			this.id = patternWithId.id;
			return true;
		}
		return false;
	},
	parse : function(html) {
		if(!this.m_pattern) {
			throw new Error('pattern not found.');
		}
		var data= pullDataFromDom(this.m_url, toObj(html), this.m_pattern.data);		
		return data;
	},
	target : function() {
		return this.m_pattern.target;
	},
	getId : function() {
		return this.id;
	},
	follow : function() {
		var follow = this.m_pattern.follow;
		if(follow && follow.indexOf('@')==0) {
			follow = follow.substring(1);
			var fn = FuncDef[follow];
			return fn;
		}
		return function(){};
	},
	encoding : function() {
		return this.m_pattern.encoding || 'GB2312';
	},
	autodisplay : function() {
		return !!this.m_pattern.autodisplay;
	}
}

$.extend({
	parser : function(url){		
		return new Parser(url);
	}
})

})(jQuery)