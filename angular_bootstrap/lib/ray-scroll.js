/* ng-infinite-scroll - v1.0.0 - 2013-02-23 */
var mod;

mod = angular.module('ray-scroll', []);

mod.directive('rayScroll', [
  '$rootScope', '$parse', '$timeout', function($rootScope, $parse, $timeout) {
    return function (scope, element, attrs) {
      var rayScroll = attrs.rayScroll,
		  rayScrollThreshold = parseInt(attrs.rayScrollThreshold,10);

      element.bind('scroll', function(){
		  var top = element.scrollTop() ,
			  height = element.height(),
			  scrollHeight = element[0].scrollHeight;

		  $parse(attrs.rayScrollY).assign(scope, top);
		  scope.$apply();
          if( top + height >=  scrollHeight - rayScrollThreshold) {
            scope.$eval(rayScroll);
          }
      })
      scope.$watch(attrs.rayScrollY,function(n,o) {
        //console.log("reset top", n,o)
        element.scrollTop(n)        
      }) 
    }
  }
]);
