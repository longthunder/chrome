/***
 @ Author Raymond
***/
var APP = {};
var DELAY = {};
var DEBUG = false;

$(function() {
	console.log('Start to hack jira subtasks...');
	start();
    chrome.extension.sendRequest({type: 'version'}, function(data){
        DELAY.version = data.version;
    })
})

function start() {
    var tasksDiv = $('#view-subtasks');
    if (tasksDiv.length > 0) {
            function appdata() {
                console.log('fetch appdata.')
                var data = [];
                $('#issuetable tr.issuerow', tasksDiv).each(function() {
                    var id = $(this).attr('rel');
                    var indexTd = $('.stsequence', this).first();
                    var index = indexTd.text().replace(/\./, '');
                    var subject = $('.stsummary', this).text();
                    var status = $('.status', this).text();
                    var assignee = $.trim($('.assignee', this).text());
                    if(assignee == 'Unassigned') {
                        assignee = null;
                    } else {
                        assignee = $('.assignee a', this).attr('rel');
                    }
        			var hourImgs = $('.progress tr.tt_graph img[title]', this) ;
        			var original = remaining = 0; 
                    hourImgs.each(function() {
                        var title = $(this).attr('title');
                        //console.log('img:'+this.outerHTML)
                        if (title.match(/^Original/)) {
                            original = title.replace(/[^0-9]/g,'')
                        } else if (title.match(/^Remaining/)) {
                            remaining = title.replace(/[^0-9]/g,'')
                        }
                    })
                    data.push({id: id, index: +index, subject: subject, status : $.trim(status),
                                   original: original, remaining: remaining, assignee : assignee
                                   ,spent: ''});                    
                });
                //console.log('appdata:'+JSON.stringify(data))
                return data;
            }
        APP.data = appdata;        
    } else {
        tasksDiv = $('#descriptionmodule'); //Hack way
        APP.data = function(){return [];};
    }

    APP.pid = $('#key-val').first().attr('rel');
    APP.token = $('#atlassian-token').attr('content');
    APP.user = $('[name=ajs-remote-user]').attr('content');
    console.log('APP.user:'+APP.user);
    loadAngular(tasksDiv);    
}


function loadAngular(tasksDiv) {
    var app = $('<div ng-app></div>');
    app.html(HTML);
    tasksDiv.after(app);
    angular.module("myApp", ["ui.bootstrap"]);
    angular.bootstrap(document, ["myApp"]);  
}

function clone(arr) {
    var result = [];
    angular.copy(arr, result);
    return result;
}

function cloneAndWatch(arr, $scope, watchOptions) {
    var result = clone(arr);
    angular.forEach(result, function(value){        
        angular.forEach(watchOptions, function(fn, key){
            var org = getObjValues(value, key);
            $scope.$watch(function() {
                return getObjValues(value, key);
            }, function(newValue){
                fn(org, newValue, value);
            }, true);
        });
    });
    return result;
}

function getObjValues(obj, keys) {
    var result = {}
    if(keys.indexOf(' ') == -1) {
        result[keys] = obj[keys];
    } else {
        angular.forEach(keys.split(' '), function(key){
            result[key] = obj[key];
        })
    }
    return result;
}

function isInt(value) { 
    return !isNaN(parseInt(value,10)) && (parseFloat(value,10) == parseInt(value,10)); 
}