function AppController($scope, $http, $sce) {
	$scope["listing"]= {list:[], listing:true};
	$scope["content"]= {list:[], content:true};
	$scope.$watch("content.top",function() {
		console.log('reset top');
		
	})
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
	console.log('start to parse url', url, $scope)
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
		console.log('get parser for url:' + url, parser.target());
		var target = $scope[parser.target()];
		if(target.url != url) {
			//target.trigger('request',[url, clean]);
			target.url = url;
			if(clean) {
				target.list = [];
			}
			target.loading = true;
			//$scope.$apply()
			console.log('ajax request for url:' + url);
			var success = function(html) {
				target.loading = false;
				if(target.url != url) {
					console.log('skip response for url:' + url);
					return;
				}
				console.log('get response/nowUrl for url:' + url);				
				$("#nowUrl").attr('href',url);
				//$scope.$digest()
				var data = parser.parse(html);
				//console.log(JSON.stringify(data,'','    '))
				triggerResponse($scope, $sce, target, url, data)
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

function triggerResponse($scope, $sce, target, url, data){	
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
		});
	} else {
		//content
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
			
			target.list.push({
				user : idata.user,
				time : idata.time,
				content: $sce.trustAsHtml(_content.html())
			})
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