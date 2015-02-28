/* ng-infinite-scroll - v1.0.0 - 2013-02-23 */
var mod;

mod = angular.module('ray-scroll', []);

mod.directive('rayScroll', [
  '$rootScope', '$window', '$timeout', function($rootScope, $window, $timeout) {
    return function (scope, element, attrs) {
      var rayScroll = attrs.rayScroll;
      var rayPreDist = parseInt(attrs.rayPreDist,10)
      element.bind('scroll', function(){
          var ch = element.scrollTop() + element.height();
          var th = element[0].scrollHeight;
          if( ch >=  th - rayPreDist) {
            scope.$eval(attrs.rayScroll);
          }
      })   
    }
  }
]);
