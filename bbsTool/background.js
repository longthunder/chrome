
(function() {
	console.log(new Date()+'start backgound');
	var fn = function(details) {
		console.log('on before header '+details.url)
		var requestHeaders = details.requestHeaders;
		requestHeaders.push({name:'referer',value:'http://club.m.autohome.com.cn/;http://www.cnbeta.com/'})
		return {requestHeaders: details.requestHeaders};
	}
	var links=['http://www.cnbeta.com/newread.php?page=*', 'http://*.autoimg.cn/*']
	
	chrome.webRequest.onBeforeSendHeaders.addListener(fn, {urls:links}, ["requestHeaders","blocking"]);

})()


/**
var notification = webkitNotifications.createNotification(
	  '',  // 图标URL，可以是相对路径
	  'Apply approved',  // 通知标题
	  '------'  // 通知正文文本
	);

url2='http://www.gdcrj.com/wsyw/tcustomer/tcustomer.do?&method=find&applyid=42098319820425645X'
function loop() {
	$.get(url2,function(html){
		console.log(new Date()+"] loop")
		if(html.indexOf('受理中') ==-1 ) {
			notification.show();
		} else {
			setTimeout(loop,30000);
		}
	})
	.error(function(err){
		console.log(new Date()+"] restart loop")
		setTimeout(loop,10000);
	})
}

setTimeout(loop,1000);
**/