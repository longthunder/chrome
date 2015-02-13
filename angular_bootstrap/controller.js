function AppController($scope, $modal) {
    $scope.listing = [];
    for(i=0;i<10;i++){
        $scope.listing.push({title:"title "+i})
    }
}