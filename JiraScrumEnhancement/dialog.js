function dialog($modal, tplName, data, callback) {        
    var modalInstance = $modal.open({
        templateUrl: tplName+'.html',
        controller: DialogController,
        resolve: {
            data : function(){ return data;}
        }
    });
    modalInstance.result.then(callback || function(){},
               function(){});
}

function DialogController($scope, $modalInstance, data){
    angular.forEach(data, function(value, key){
        if(angular.isFunction(value)) {
            $scope[key] = value.bind($scope);
        } else {            
            $scope[key] = value;
        }
    })

    $scope.result = function (val) {
        $modalInstance.close(val);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}
