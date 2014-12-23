var offset = 2000;

function scrollToBottom(e) {
	return e.scrollTop+$(e).height() >= e.scrollHeight-offset;
}
function bind(e) {
	e.bind('request',function(event, url, clean){
		var ele = $(this);
		ele.data('url', url);
		if(clean) {
			ele.emptyAll();
		}
		ele.data('loading').show();
		//if(!append) {
		//	this.scrollTop=this.scrollHeight;
		//}
	})
	e.bind('response',function(event, url, data, follow, clean){
		var ele = $(this);
		ele.data('loading').hide();
		ele.data('next',data.next);
		ele.trigger('data', [data, clean]);
		follow(url);		
	})
	e.bind('next',function(){
		console.log('receive next message.')
		var next = $(this).data('next');
		if(next) {
			parse(next, false);
		}
	});
	e.bind('scroll',function(){
		console.log('receive scroll message.')
		if(scrollToBottom(this)) {
			$(this).trigger('next');
		}
	});
	var container = $('<div>');
	e.data('container', container);
	e.append(container);

	var theLoading = loading.clone();	
	e.data('loading', theLoading);	
	e.append(theLoading);
}

function bindItem(item,listing) {
	item.bind({
		mouseenter : function(){
			var ele = $(this);
			if(!ele.equal(listing.data('sel'))) {
				ele.animate('.list_item_hover',100);
			}
		},
		mouseleave : function(){
			var ele = $(this);
			if(!ele.equal(listing.data('sel'))) {
				ele.animate('.list_item_normal',100);
			}
		},
		click : function() {
			var ele = $(this);
			var sel = listing.data('sel');
			if( !ele.equal(sel)) {
				if(sel != null) {
					sel.animate('.list_item_normal');
				}
				ele.animate('.list_item_selected');
				listing.data('sel',ele);
				parse(ele.data('url'), true);
			}
			return false;
		},
		contextmenu : function(){
			console.log('right click')
			window.open($(this).data('url'),'_blank');
			return false;
		}
	})	
}

function bindList(listing) {
	listing.bind('data',function(event,data,clean){
		var ele = $(this);
		console.log('get list size:' + data.list.length);
		$.each(data.list,function(i,idata){
			if(idata.title == undefined) return;
			//ps: type d.id is array[1]
			if(!ele.addId(idata.id + '')) {			
				return;
			}
			var reply = '';
			if(idata.reply != undefined &&!$.contains(idata.reply,'(')){
				reply = '('+idata.reply+')';
			}
			var item = E('div', 'list_item list_item_normal round_angle', idata.title + reply);
			item.data('url',idata.link);
			//console.log('item url:'+idata.link)
			bindItem(item, ele);
			ele.addItem(item);
		});
	})
}

function bindContent(content) {
	content.bind('data',function(event,data,clean){
		var ele = $(this);
		if(clean && data.title) {
			ele.addItem('<span class=title>'+data.title+'</span>')
			if(data.onlylz) {
				var alllz=$('<span class="btn_0 round_angle">All/Lz</span>');
				alllz.click(function(){
					parse(data.onlylz)
				})
				ele.addItem(alllz)
			}
		}
		$.each(data.list,function(i,idata){
			//ps: type d.id is array[1]
			if(!ele.addId(idata.id + '')) {			
				return;
			}
			var ep=function(s){return s==undefined?"":s;}
			var lou = E('div', 'content_item round_angle content_font', null);
			if(idata.floor==undefined) {
				if(i==0)idata.floor = 1;
				else idata.floor = '';
			}
			lou.append(E('span', 'floor_info', '#'+ep(idata.floor)));
			var def='http://bbsimg.meizu.net/topic/images/avatar/avatar_default.png';
			if(!idata.author_pic)
				idata.author_pic=def;
			var img= E('img','man_pic');
			img.attr('src', idata.author_pic);
			img.bind('error',function(){
				this.src = def;
			})
			lou.append(img);
			lou.append(E('span', null, ep(idata.user)));
			lou.append(E('span', 'time_info', ' ['+idata.time+']'));
			_content = E('div','content_info');
			_content.append(idata.content);
			if(idata.attach_pics){
				_content.append(idata.attach_pics);
			}
			scaleImage(_content);
			$('.x-loaded',_content).css('height','')
			lou.append(_content);
			
			//adjustImageParams(_content, link)
			ele.addItem(lou);
		});
	})
}


function scaleImage(ele) {	
	$('img', ele).each(function(){
		this.width = 50;
		//this.height = this.naturalHeight;
		$(this).bind('load',function(){
			this.width = Math.min(this.naturalWidth, ele.innerWidth());			
		});

		//hack for http://club.m.autohome.com.cn/bbs/thread-c-2944-23236337-1.html
		if($(this).attr('data-original')) {
			$(this).attr('src', $(this).attr('data-original'))
		}
	})

    $('a', ele).each(function(){
		this.href = this.href;		
	})
}


function E(tag, clazz, text) {
	var ele = $('<'+tag+'>');
	if(clazz) {
		ele.addClass(clazz);
	}
	if(text) {
		ele.text(text);
	}
	return ele;
}
