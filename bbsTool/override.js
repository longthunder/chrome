(function($, undefined) {

	$.extend({
		peek: function(arr){
			return arr[arr.length-1];
		}
	})

	//convert padding-left to paddingLeft
	var hump = function (str) {
		return str.replace(/(\-[a-z])/,function(ch){
			return ch.substring(1).toUpperCase();
		});
	}

	function findAllStyles(){
		var result = {};
		$.each(document.styleSheets, function(j, sheet){		
			var href = sheet.href;
			if (href && href.indexOf('://')>-1 && href.indexOf(document.domain) == -1) return;
			var rules = sheet.rules || sheet.cssRules;
			$.each(rules, function(i,rule){			
				if (!rule.style) return;
				var selectorText = (rule.selectorText) ? rule.selectorText.replace(/^\w+/, function(m){
					return m.toLowerCase();
				}) : null;		

				if (!selectorText) return;
				var to = {};
				//k style : 0 background-color
				$.each(rule.style,function(k, style){
					var style = hump(style);
					var value = rule.style[style];
					to[style] = value;
					//console.log(style+':'+value)
				});
				result[selectorText] = to;
			});
		});
		return result;
	}

	var styles = findAllStyles();

	jQuery.each(['animate'], function( i, name ) {
		var cssFn = jQuery.fn[ name ];
		jQuery.fn[ name ] = function( selector ) {
			if(typeof selector != 'object') {
				prop = styles[selector];
				this.stop();
			} else {
				prop = selector;
			}
			var args = $.map(arguments, function(value,i){
				return !i ? prop : value;
			})
			cssFn.apply(this, args);
		};
	});


	$.fn.extend({
		/**morph: function(selector,duration){
			this.stop();
			var css = typeof selector == 'object' ? selector : classes[selector];
			return this.animate(css,{duration:duration})
		},**/
		equal : function(ele) {
			return ele && ele.length>0 && this[0] == ele[0];
		},
		emptyAll : function() {
			this.data('container').empty();
			this.data('ids',[]);
			this.data('next',null);
		},
		addItem : function(item) {
			this.data('container').append(item);
		},
		addId : function(id) {
			if(id=='undefined') {
				return true;
			}
			var ids = this.data('ids') || [];
			if($.inArray(id,ids) > -1) {
				console.log('id exists:'+id);
				return false;
			} else {
				//console.log('id adds:'+id);
				ids.push(id);
				this.data('ids', ids);
				return true;
			}
		}
	})

})(jQuery)