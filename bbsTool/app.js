//Add by Ramon.
var box,swap,listing,content,loading,back,openBtn,baseHost;
//var scale = 0.95;
var margin = 15;
var stack = [];
var cache = {};
var eCache = new Cache(Cache.ELE_ID);
var MAX_WIDTH = 0;

$(function() {
	init();	
	start();
})

$(window).bind('resize',function(){
	resize();
});

function init() {
	$(window).trigger('resize');
	loading = $('.loading');
	var img =$('img',loading);
	img.attr('src',img[0].src);
	bind(eCache.get('listing'));
	bindList(eCache.get('listing'));

	bind(eCache.get('content'));
	bindContent(eCache.get('content'));
	$('#open').click(function(){
		if(str = prompt('Fire in the hole')) {
			parse(str);
		}
	})
}
function resize() {
	var height = (document.documentElement.clientHeight- 2 * margin);
	var width = (document.documentElement.clientWidth - 2 * margin);
	var marginTop = margin;
	var param = {
		height : Math.floor(height)+"px",
		width : Math.floor(width)+"px",
		marginTop : Math.floor(marginTop)+"px"
	};
	eCache.get('container').animate(param,200);

	var left	= $('.left9');
	var right	= $('.right9');
	eCache.get('listing').css('height',height-$('.header',left).height()-2);
	eCache.get('content').css('height',height-$('.header',right).height()-2);
	MAX_WIDTH = eCache.get('content').width();
	console.log('content width:'+MAX_WIDTH);
}

function parse(url, clean) {
	console.log('start to parse url', url)
	if(url.indexOf('javascript') == 0) {
		return;
	}
	if(url.indexOf('#') != -1) {
		url = url.substr(0, url.indexOf('#'))
	}
	console.log('------------------------------------------');
	if(!url) {
		console.log('url is null');
		return ;
	}
	if(clean == undefined) { clean = true; }
	console.log('parse url:' + url+ '/ clean:'+ clean);
	var parser = $.parser(url);
	if(parser.validate()) {
		console.log('get parser for url:' + url);
		var target = parser.target();
		if(target.data('url') != url) {			
			target.trigger('request',[url, clean]);
			console.log('ajax request for url:' + url);
			var success = function(html) {
				if(target.data('url') != url) {
					console.log('skip response for url:' + url);
					return;
				}
				console.log('get response for url:' + url);
				eCache.get('base0').attr('href',url);
				var data = parser.parse(html);		
				target.trigger('response', [url, data, parser.follow(), clean]);
				eCache.get('base0').attr('href','');
				target.trigger('scroll');
			}
			$.ajax(url, {
				beforeSend : function(xhr) {
					xhr.overrideMimeType("text/html;charset="+parser.encoding());
					xhr.setRequestHeader("If-Modified-Since","0");			
				},
				success : success
			});
		}
	} else {
		window.open(url,'_blank');
	}
}

