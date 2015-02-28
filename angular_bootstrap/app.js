var app = angular.module('app', ['ui.bootstrap', 'ngAnimate','infinite-scroll']);
var clickElem = null;
var UNCLICK = 'unclick'
app.directive('listClass', function($animate, $http){
    return function (scope, element, attrs) {
        var adClass = attrs.listClass
		element.bind('mouseover', function(){
		  	$animate.addClass(element, adClass+'-hover');
		}).bind('mouseout', function(){
		  	$animate.removeClass(element, adClass+'-hover');
		}).bind('click', function(){
           // scope.$apply(function(){
                //scope.$parent.content = scope.listing[scope.$index].title;
            //    parse(scope.$parent, $http, scope.listing.list[scope.$index].url);
           // });
            console.log(scope.$index)        	
			$animate.addClass(element, adClass+'-select');
		  	if(clickElem != null) {
		  		clickElem.triggerHandler(UNCLICK);
		  	}
		  	clickElem = element;
		}).bind(UNCLICK, function(){
		  	$animate.removeClass(element, adClass+'-select');
		});    
    }
})
/**
app.directive('httpBox', function($animate){
    var directiveDefinitionObject = {
        template: '<div>{{content}}T</div>',
        replace: true,
        transclude: false,
        restrict: 'A'
    };
    return directiveDefinitionObject;
})

$scope.hello = 'angular works.';
    $scope.openDialog = function() {
        var param = {
            title : 'Test Title',
            content : 'test.html',
            ops :  [
                { 
                    name : 'Save',
                    fn : function() {
                        alert(this)
                    }
                }
            ]
        }
        var callback = function() {

        }
        dialog($modal, param, callback)
    }
    $scope.listing = [];
    for(i=0;i<100;i++){
        $scope.listing.push({title:"title "+i})
    }
    $scope.clazz = "cubic"

    */