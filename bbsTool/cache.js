function Cache(fn, expire) {
	this.fn = fn;
	this.expire = expire;
	this.data = {}
}

Cache.prototype = {
	get : function(key) {
		if(!this.hasOwnProperty(key)) {
			this.data[key] = this.fn(key)
		}
		return this.data[key];
	}
}
Cache.ELE_ID = function(key) {
	return $('#'+key);
}