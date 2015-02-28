/***
 @ Author Raymond
***/
function TaskController($scope, $modal, $http) {
    $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
    $scope.init = function() {
        var modalInstance = $modal.open({
          templateUrl: 'inittasks.html',
          controller: TaskInitController,
          resolve: {
              data: function () {
                return APP.data();
              }
          }
        });
        modalInstance.result.then(function (data) {
            if(!DEBUG)
                window.location.reload();
            }, function () {}
        );
    }

    $scope.edit = function() {
        var modalInstance = $modal.open({
          templateUrl: 'edit-task-time.html',
          controller: TaskEditController,
          resolve: {
            data: function () {
              return APP.data();
            }
          }
        });
        modalInstance.result.then(function (data) {
            if(!DEBUG)
                window.location.reload();
            }, function () {}
        );
    }

    $scope.sort = function() {        
        var modalInstance = $modal.open({
          templateUrl: 'sort.html',
          controller: SortEditController,
          resolve: {
            data: function () {
              return APP.data();
            }
          }
        });
        modalInstance.result.then(function (data) {
            if(!DEBUG)
                window.location.reload();
            }, function () {}
        );
    }

    $scope.export = function() {
        var data = APP.data();
        var json = JSON.stringify(data, ["subject","original"],"    ");
        dialog($modal, "export", {"json" : json});
    }

    $scope.debugText = 'Debug OFF';
    $scope.debug = function() {
        DEBUG = !DEBUG;
        if(DEBUG) {
            $scope.debugText = 'Debug ON';
        } else {
            $scope.debugText = 'Debug OFF';
        }
    }

    $scope.about = function() {
        var text = "Designed by Raymond. Version: " + DELAY.version;
        dialog($modal, "about", {"text" : text});
    }
}

function TaskInitController($scope, $http, $timeout, $modal, $modalInstance, $filter, data) {
    $scope.data = clone(data); 
    $scope.loading = false;

    var orgData = clone(data);; //Used to clarify if data is modified.    
    var max = data.length +1; 

    $scope.newTask = function () {
        $scope.data.push({index: max++, subject: '', original: ''})
    };
    $scope.import = function () {
        dialog($modal, "import", {
            importJson : function(json) {
                var importData = JSON.parse(json);
                this.result(importData)
                }
            }, function(importData) {
                angular.forEach(importData,function(value){                    
                    value.index = max++;
                    value.remaining = value.original;
                    $scope.data.push(value);                    
                })
            } //end fn
        );        
    };

    $scope.save = function () {
        var changedData = [];
        angular.forEach(clone($scope.data),function(value, index){
            var old = orgData[index];
            value.remaining = value.original ;
            if(value.subject != '' && !angular.equals(value, old)) {
                if(value.id) {
                    value.now = $filter('date')(new Date(),'dd/MMM/yy h:mm a')
                }
                changedData.push(value);
            }            
        })
        if(changedData.length == 0) {
            $modalInstance.close();
            return;
        }
        $scope.loading = true;
        saveTasks($http, $timeout, changedData, function(success, errMsg){
            $scope.loading = false;
            if(success) {
                console.log('SaveTasks Done.');
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

//Task Edit
function TaskEditController($scope, $http, $timeout, $modal, $modalInstance, $filter, data) {    
    $scope.data = cloneAndWatch(data, $scope, {
        "original remaining" : function(orgValue, nowValue, row) {       
            if(orgValue.original == nowValue.original && 
                isInt(nowValue.remaining) &&
                orgValue.remaining - nowValue.remaining > 0) {
                row.spent = orgValue.remaining - nowValue.remaining;               
            } else {
                row.spent = '';
            }
        }
    });
    $scope.loading = false;

    var orgData = clone(data);//Used to clarify if data is modified.    
    var max = data.length +1;

    $scope.ndoText = 'Show All';
    var allflag = false;
    $scope.ndo = function (row) {
        return allflag || (row.status != 'Done');
    }
    $scope.ndoswitch = function () {
        allflag = !allflag;
        if(allflag) {
            $scope.ndoText = 'Show Not Done';
        } else {
            $scope.ndoText = 'Show All';
        }
    };

    $scope.save = function () {
        var changedData = [];
        angular.forEach(clone($scope.data),function(value, index){
            var old = orgData[index];
            if(value.subject != '' && !angular.equals(value, old)) {
                if(old && value.spent != old.spent ) {
                    value.spentChanged = true;
                }
                if(value.status == 'Not Started' && value.spent != '') {
                    value.needStart = true;
                }
                if(value.id) {
                    value.now = $filter('date')(new Date(),'dd/MMM/yy h:mm a')
                }
                changedData.push(value);
            }            
        })
        if(changedData.length == 0) {
            $modalInstance.close();
            return;
        }
        $scope.loading = true;
        saveTasks($http, $timeout, changedData, function(success, errMsg){
            $scope.loading = false;
            if(success) {
                console.log('SaveTasks Done.');
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
//Task Edit End.

function saveTasks($http, $timeout, data, doneFn, loadingFn) {
    console.log(data.length +' tasks need to create or update.');
    var total = data.length;
    if(total == 0) {
        doneFn();
        return;
    }
    var queue = new HttpQueue();
    angular.forEach(data,function(value){
		//queue.next(); avoid wrong order
        if(!value.id) {
            //new Task
            queue.addPost('Create Task', createTask(value));            
        } else {
            //Update Id            
            if(value.needStart) {
                queue.addGet('Start Task', startTask(value));
                //queue.addPost('Assign Me Task', assignMeTask(value));
            }
            queue.addPost('Update Task', updateTask(value));
            if(value.remaining == 0) {
                queue.addPost('Finish Task', finishTask(value));
            }
        }
    })
    queue.execute($http, $timeout, doneFn, loadingFn);
}


function createTask(value) {
    var endpoint = '/jira/secure/QuickCreateIssue.jspa?decorator=none'
    var data = {
        pid : 11605,
        atl_token: APP.token,
        issuetype:16,
        parentIssueId: APP.pid,
        summary: value.subject.replace(/\n/g, ' '),
        timetracking_originalestimate : value.original,
        timetracking_remainingestimate : value.remaining
    };
    return {endpoint: endpoint, data: data};    
}

function updateTask(value) {
    var endpoint = '/jira/secure/QuickEditIssue.jspa?issueId='+ value.id +'&decorator=none'
    var data = {
        id : value.id,
        atl_token: APP.token,
        issuetype:16,        
        summary: value.subject.replace(/\n/g, ' '),
        assignee : value.assignee==null ? '':value.assignee,
        description:'',
        timetracking_originalestimate : value.original + 'h',        
        timetracking_remainingestimate : value.remaining + 'h'
    };
    if(+value.spent >= 0 && value.assignee == null) {
        angular.extend(data, {
            assignee : APP.user
        });
    }
    if(value.spentChanged && +value.spent > 0) {
        console.log('SpentChanged...');
        angular.extend(data, {
            worklog_timeLogged : +value.spent,
            worklog_startDate : value.now,
            worklog_adjustEstimate : 'new',
            worklog_newEstimate : value.remaining,
            isCreateIssue : '',
            hasWorkStarted:'',
            isEditIssue : true,
            customfield_10103:'',      
            worklog_activate : true,
            issuelinks:'issuelinks',
            'issuelinks-linktype':'Duplicate'            
        });
    }
    return {endpoint: endpoint, data: data};
}

function startTask(value) {
    //GET
    var endpoint = '/jira/secure/WorkflowUIDispatcher.jspa';
    var data = {
        id : value.id,
        atl_token: encodeURIComponent(APP.token),
        inline:true,
        action:11,
        atl_token: APP.token
    };
    return {endpoint: endpoint, data : data};
}

function finishTask(value) {
    var endpoint = '/jira/secure/CommentAssignIssue.jspa?atl_token='+ encodeURIComponent(APP.token)
    var data = {
        id : value.id,
        inline:true,
        action:81,
        resolution:19, //Completed
        atl_token: APP.token,
        assignee: value.assignee ? value.assignee : APP.user,
        worklog_activate:true,
        worklog_startDate: value.now,
        worklog_adjustEstimate:'auto',
        isCreateIssue:false,
        isEditIssue:false,
        decorator:'dialog'
    };
    return {endpoint: endpoint, data: data};
}

/*
function assignMeTask(value) {
    var endpoint = '/jira/secure/AssignIssue.jspa';
    var data = {
        id : value.id,
        atl_token: encodeURIComponent(APP.token),
        inline : true,
        assignee : APP.user,
        atl_token: APP.token,
        decorator:'dialog'
    };
    return {endpoint: endpoint, data : data};
}
*/