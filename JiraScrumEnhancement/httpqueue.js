function HttpQueue() {
	this.queue = [];
	this.index = 0;
	this.total = 0;
}

HttpQueue.prototype.addGet = function(name, httpObject) {
	this.add(name, 'get', httpObject.endpoint, httpObject.data);
};

HttpQueue.prototype.addPost = function(name, httpObject) {
	this.add(name, 'post', httpObject.endpoint, httpObject.data);
};

HttpQueue.prototype.add = function(name, method, endpoint, data) {
	this.queue[this.index] = this.queue[this.index] ||[];
	var obj = {name : name, method : method, endpoint : endpoint, data : data };
	this.queue[this.index].push(obj);
	this.total++ ;
};

HttpQueue.prototype.next = function(name, httpObject) {
	if(this.queue[this.index]) {
		this.index++;
	}
};

HttpQueue.prototype.execute = function(http, timeout, doneFn, loadingFn) {
	var queue = this.queue;
	if(queue.length == 0) {return;}
	var len = queue.length;
	var index = 0;
	var result = [];
	var now = new Date();
	var groupFn = function(i, err) {
		if(i != undefined) {
			result.push('[group:'+i+']' + err);
		}
		if(++index == len) {
			console.log('Http Done in '+ ((new Date() - now)/1000) +' s')
			timeout(function(){
				doneFn(result.length == 0 , result.join("\n"));
			}, 500);			
		}
	}
	var current = 0;
	var progressFn = loadingFn || function(){} ;
	var total = this.total;
	progressFn(0, total);
	angular.forEach(queue, function(group, index) {
		runChain(group, function(httpObject, nextFn){
			var future = null;
			if(httpObject.method == 'get') {
				var url = httpObject.endpoint + '?' + objToPostStr(httpObject.data);
				future = http.get(url)
			} else {
				future = http.post(httpObject.endpoint, objToPostStr(httpObject.data));
			}
			future.success(function(data) {
				console.log('[group:'+index+']' + "Http Request success:" + httpObject.name);
				progressFn(++current, total);
				nextFn();				
			}).error(function(data) {
				progressFn(++current, total);
				groupFn(index, "Http Request Error:" + httpObject.name+", details "
					       + JSON.stringify(httpObject)+"\nError:"+JSON.stringify(data));
			});
		}, groupFn);
	})
	
};

function runChain(arr, fn, groupFn, i) {
	if(i == undefined) {
		i = 0;
	}
	if(i == 0) {
		console.log("Http Requests Count: " + arr.length);
	}
    if(i < arr.length) {
        fn(arr[i], function(){ runChain(arr, fn, groupFn, i + 1) });
    } else {
    	groupFn();
    }
}

function objToPostStr(obj) {
    var str = [];
    for(var p in obj) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]).replace(/%20/g,'+'));
    }    
    return str.join("&");
}