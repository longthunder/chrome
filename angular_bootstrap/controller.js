function AppController($scope, $http, $sce) {
	$scope["listing"]= {list:[], listing:true,loading:true};
	$scope["content"]= {list:[], content:true,top: 0};
	$scope["skip"] = 0;
	parse($scope, $http, $sce, 'data.html');    
   	$scope.openUrl = function(url) {
   		parse($scope, $http, $sce, url, true);
  	}
  	$scope.winOpenUrl = function(url) {
   		window.open(url,'_blank');
  	}  	
  	$scope.openNext = function(target) {
  		if(target.next) {
	  		console.log('start to next page', target)
	  		var nextUrl = target.next;
	  		parse($scope, $http, $sce, nextUrl , false);
  		}
  	}
  	$scope.tryOpen = function() {
  		if(str = prompt('Open URL:')) {
			parse($scope, $http, $sce, str, true);
		}
  	}
}

function parse($scope, $http, $sce, url, clean) {
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
		var id = parser.getId();
		if(id && localStorage.getItem(id)) {
			$scope['skip'] ++ ;
			console.log("skip that :", id)
			return;
		}
		console.log('get parser for url:' + url, parser.target());
		var target = $scope[parser.target()];
		if(target.url != url) {
			//target.trigger('request',[url, clean]);
			target.url = url;			
			target.loading = true;
			//$scope.$apply()
			console.log('ajax request for url:' + url);
			var success = function(html) {
				target.loading = false;
				if(target.url != url && !parser.autodisplay()) {
					console.log('Response is dropped, url:' + url);
					return;
				}
				console.log('get response for url:' + url);		
				$("#nowUrl").attr('href',url);
				//$scope.$digest()
				var data = parser.parse(html);
				if(clean) {
					target.list = [];
					target.top = 0;
				}
				//console.log(JSON.stringify(data,'','    '))
				triggerResponse($scope, $http, $sce, target, url, data, parser.autodisplay(),id)
				//target.trigger('response', [url, data, parser.follow(), clean]);
				$("#nowUrl").attr('href',url);
				//target.trigger('scroll');
			}
			$.ajax(url, {
				beforeSend : function(xhr) {
					xhr.overrideMimeType("text/html;charset="+parser.encoding());
					xhr.setRequestHeader("If-Modified-Since","0");			
				},
				success : function(html){
					$scope.$apply(function(){
						success(html)
					})
				}
			});
		}
	} else {
		window.open(url,'_blank');
	}
}

function triggerResponse($scope, $http, $sce, target, url, data, autodisplay,id){	
	console.log('get list size:' + data.list.length);
	target.next = data.next
	if(target.listing) {
		$.each(data.list,function(i,idata){
			if(idata.title == undefined) return;

			var reply = '';
			if(idata.reply != undefined &&!$.contains(idata.reply,'(')){
				reply = '('+idata.reply+')';
			}
			target.list.push({
				title : idata.title + reply,
				url : idata.link
			})
			if(autodisplay) {
				parse($scope, $http, $sce, idata.link, false)	
			}
		});
	} else {
		//content
		//var id = data.id
		/*if(id) {
			id = id.replace(/.+\//g,'')
			id = id.replace(/[^0-9]+/g,'')
			console.log('id',id)
			if(localStorage.getItem(id)) {
				$scope['skip'] ++ ;
				console.log("skip content :", id)
				return;
			}
		}*/
		$.each(data.list,function(i,idata){
			
			var ep=function(s){return s==undefined?"":s;}
			if(idata.floor==undefined) {
				if(i==0)idata.floor = 1;
				else idata.floor = '';
			}
			var def='http://bbsimg.meizu.net/topic/images/avatar/avatar_default.png';
			if(!idata.author_pic)
				idata.author_pic=def;
			_content = E('div','content_info');
			_content.append(idata.content);
			if(idata.attach_pics){
				_content.append(idata.attach_pics);
			}
			scaleImage(_content);
			$('.x-loaded',_content).css('height','')
			
			var ct = {
				user : idata.user,
				time : idata.time,
				content: $sce.trustAsHtml(_content.html()),
				close : function(i) {
					console.log('close id', id)
					target.list.splice(i,1)
					localStorage.setItem(id,  new Date())
				}
			}
			target.list.push(ct)
		});
	}
}

function scaleImage(ele) {	
	$('img', ele).each(function(){
		//this.width = 50;
		//this.height = this.naturalHeight;
		$(this).bind('load',function(){
			this.width = Math.min(this.naturalWidth, ele.innerWidth());			
		});

		//hack for http://club.m.autohome.com.cn/bbs/thread-c-2944-23236337-1.html
		if($(this).attr('data-original')) {
			$(this).attr('src', $(this).attr('data-original'))
		}
		if($(this).attr('file')) {
			$(this).attr('src', $(this).attr('file'))
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
/*
function merge(u1, u2) {
	if(/^http/.test(u2)) {
		return u2;
	}
	var upart = u1.split("/")
	if(/^\//.test(u2)) {
		return upart[0] +'//' + upart[2] + u2;
	}
	return u1.replace(/.+\//,'') + u2;
}*/