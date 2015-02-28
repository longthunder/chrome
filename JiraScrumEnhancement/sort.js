/***
 @ Author Raymond
***/
function SortEditController($scope, $http, $timeout, $modalInstance, data) {
    $scope.data = clone(data);

    generateOrder($scope.data);

    $scope.loading = false;
    $scope.lucky = function() {
        $scope.data.sort(function(a,b){
            return weight(a.subject) - weight(b.subject);
        })
        generateOrder($scope.data);
    }
    $scope.resort = function() {
        $scope.data.sort(function(a,b){
            return a.order - b.order ;
        })
    };    
    $scope.save = function () {
        $scope.resort();
        var steps = getSteps($scope.data);
        console.log("steps:"+JSON.stringify(steps));
        if(steps.length == 0) {
            $modalInstance.close();
            return;
        }

        $scope.loading = true;
        sortTask($http, $timeout, steps, function(success, errMsg){
            $scope.loading = false;
            if(success) {
                console.log('SortTasks Done.');
                $modalInstance.close();
            } else {
                alert("Fail: " + errMsg);
            }            
        }, function(index, total) {
            var progress = (index+1)/(total+1);
            $scope.dynamic = Math.floor(progress * 100);
        })
        
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

}

function sortTask($http, $timeout, steps, doneFn, loadingFn) {
    var queue = new HttpQueue();
    angular.forEach(steps,function(value){
        var sortFn = arguments.callee;
        var httpObject = {
            endpoint : '/jira/secure/MoveIssueLink.jspa',
            data : { 
                id: APP.pid,
                currentSubTaskSequence: value.start,
                subTaskSequence :value.end
            }
        };
        queue.addGet("Sort Task", httpObject);        
    });
    queue.execute($http, $timeout, doneFn, loadingFn);
}

function generateOrder(arr) {
    angular.forEach(arr,function(value, i) {
        value.order = (1+i) * 10;
    })
}

// For EWS backlog title
function weight(subject) {
    var w;
    if(/^Dev/i.test(subject)) {
        w = -1000
    } else if(/^Test/i.test(subject)) {
        w = 0;
        if(/^Test plan/i.test(subject)) {
            w = 0;
        } else if(/^Test automation/i.test(subject)) {
            w = 500;
        } else if(/email/i.test(subject)) {
            w = 800;
        }
    }else if(/^Team/i.test(subject)) {
        w = 1000
    } else {
        w = -8888
    }

    if(/Merge/i.test(subject)) {
        w += 1;
    } else if(/Coding/i.test(subject)) {
        w += 10;
    } else if(/Code Review/i.test(subject)) {
        w += 30;
    } else if(/Deploy/i.test(subject)) {
        w += 60;
    } else if(/Dev test/i.test(subject)) {
        w += 80;
    } else if(/testing/i.test(subject)) {
        w += 90;
    } else if(/Bug/i.test(subject)) {
        w += 100;
    } else if(/demo/i.test(subject)) {
        w += 120;
    }
    return w;
}

function getSteps(arrIn) {
    var arr = clone(arrIn);
    var result = [];
    if(arr.length < 2) {
        return result;
    }
    for(var i=0;i<arr.length;) {
        var e = arr.splice(i,1)[0];
        var j = placePos(arr, e);
        arr.splice(j, 0, e);
        if(i != j) {
            result.splice(0, 0, {start: j, end: i});      
        }else {
            i++;
        }
    }
    return result;
}

function placePos(arr, e){
    var j;
    for(j = 0 ;j <arr.length; j++) {
        if(e.index < arr[j].index) {
            break;
        }
    }
    return j;
}