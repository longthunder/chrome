Array.prototype.contain = function(val) {
	for (i = 0; i < this.length; i++) {
		if (this[i] == val) {
			return true;
		}
	}
	return false;
}

var defImage = 'http://img.zhigou.com/images/04/3939/57563303_200_200.jpg'

$(function() {
	init();
	start();
})

function init() {

}

var filterImgs = ['/neaDm.jpg', '/bmw9.gif', '/2009413090144.gif'];

jQuery.easing.tk = function(p) {
	return 1 - Math.sin(Math.acos(p));
}

function start() {
	var imageArr = $('img')
	imageArr.each(function(index) {
		//click scroll
		var image = $(this);
		var timer = null; 

		//console.log("bind image")
		image.bind('click', function() {
			console.log('preclick')
		    timer && clearTimeout(timer); 
			timer = setTimeout(function(){
				console.log('click')
		        var scrollTop = getLastScrollTop(image,imageArr,index) - 20
				$(document.body).animate({
					scrollTop: scrollTop
				}, {
					easing: 'tk'
				});
		    },300)
			
		})
		image.bind('dblclick', function() {
			timer && clearTimeout(timer); 
			console.log('dbclick')		
			var scrollTop = getFirstScrollTop(image,imageArr,index) - 20
			$(document.body).animate({
				scrollTop: scrollTop
			}, {
				easing: 'tk'
			});
		})

		//filter out image
		var src = this.getAttribute('src')
		if (filterImgs.contain(src)) {
			console.log('filter image src:' + src)
			this.setAttribute('src', defImage)
		}
	})

	$('input[type=submit]').each(function() {
		var onclick = this.getAttribute('onclick');
		if (onclick == "openpage()") {
			this.setAttribute('onclick', "");
		}

		console.log("onclick" + onclick)
	})
	
	//for goxiazai.cc
	// convert link to thunder:
	$('a').each(function(){
		if(this.href.indexOf('http://goxiazai.cc/xiazai.html?cid=')>=0) {
			var href = this.href.split('f=')
			if(href.length>1) {
				href = decodeURIComponent(href[1])
				console.log('converted href:'+ href)
				this.href = href
			}
		}
	})

	//Don't show thumb jgp

	$('img').each(function(){
		if(/_thumb.jpg$/.test(this.src)) {
			this.src = this.src.replace(/_thumb.jpg$/,'.jpg')
			this.src.height = this.offsetHeight
			this.src.width = this.offsetWidth
		}
	})

	
}


function getFirstScrollTop(image,imageArr,index) {
	var height = image.height();
	var scrollTop = image.offset().top 
	if(index < 1) {
		return scrollTop;
	}
	var previous = $(imageArr[index-1])
	if(previous.length>0) {		
		console.log(image[0].outerHTML)
		console.log(previous[0].outerHTML)
		var bottom = previous.offset().top + previous.height();
		console.log('previous:'+scrollTop +','+ bottom)
		if(scrollTop - bottom < 5) {
			console.log('recursion getImgScrollTop')
			return getFirstScrollTop(previous,imageArr,index-1)
		}
	}
	return scrollTop
}

function getLastScrollTop(image,imageArr,index) {
	var height = image.height();
	var scrollTop = image.offset().top + height
	if(index >= imageArr.length-1) {
		return scrollTop;
	}
	var next = $(imageArr[index+1])
	if(next.length>0) {		
		//console.log(next[0].outerHTML)
		//console.log('[curr/next]'+scrollTop+"/"+next.offset().top)
		if(Math.abs(next.offset().top - scrollTop) < 5) {
			console.log('recursion getImgScrollTop')
			return getLastScrollTop(next,imageArr,index+1)
		}
	}
	return scrollTop
}

if(window.location.href == 'http://buy.taobao.com/auction/buy_now.jhtml') {
	console.log('fill personal ID')
	setTimeout(function(){
		console.log('filling personal ID')
		$('#J_InputIdConfirm').val('420981197702021111');
		$('#J_ButtonIdConfirm').trigger('click')
		$('#J_virtualArea').val('NiuBiFu');
		$('#J_virtualArea').trigger('change')
		$('#J_roleName').val('nb46');
		$('#J_roleName').trigger('change')
	},1500)
}

$(function() {
	if(window.location.href.indexOf("www.luxiangguan.org") > -1 ) {
		console.log(document.cookie)
		document.cookie = '3nHq_2132_cx_guestnum=1'
		//3nHq_2132_cx_guestnum
	}
	
})