/***
 @ Author Raymond
***/
var HTML = '\
<style>\
.to-right { float:right; }\
.small { width:200px; }\
.margin0 {margin: 0;}\
.modal {\
	width:660px;\
	margin-left:auto;\
	margin-right:auto;\
	left:calc((100% - 760px) / 2);\
}\
.minh {\
	min-height:350px;\
	word-spacing:4px;\
	width : 100%;\
}\
.min-textarea-height {\
	min-height:70px;\
}\
.fixedw {\
	width:208px;\
}\
</style>\
<div ng-controller="TaskController">\
<a class="aui-button" ng-click="init()">Init Tasks</a>\
<a class="aui-button" ng-click="edit()">Edit Task Time</a>\
<a class="aui-button" ng-click="sort()">Sort Tasks</a>\
<a class="aui-button" ng-click="export()">Export Tasks</a>\
<a class="aui-button" ng-click="debug()">{{debugText}}</a>\
<a class="aui-button" ng-click="about()">About</a>\
</div>\
<script type="text/ng-template" id="inittasks.html">\
	<div class="modal-header">\
		<h3>Init Tasks</h3>\
	</div>\
	<div class="modal-body">\
		<table class="table table-hover table-bordered">\
			<thead>\
				<tr style="font-weight: bold;">\
					<td>Index</td>\
					<td>Status</td>\
					<td>Task</td>\
					<td>Original</td>\
				</tr>\
			</thead>\
			<tbody>\
				<tr ng-repeat="row in data">\
					<td>{{$index + 1}}</td>\
					<td>{{row.status}}</td>\
					<td><textarea ng-model="row.subject" class="min-textarea-height"></textarea></td>\
					<td><input type=text ng-model="row.original" style="width:30px" maxlength=2></td>\
				</tr>\
			</tbody>\
		</table>\
	</div>\
	<div class="modal-footer">\
		<div class="to-right">\
			<button class="btn btn-primary" ng-click="newTask()">New</button>\
			<button class="btn btn-primary" ng-click="import()">Import</button>\
			<button class="btn btn-primary" ng-click="save()">Save</button>\
			<button class="btn btn-warning" ng-click="cancel()">Cancel</button>\
		</div>\
		<div ng-show="loading" class="to-right small">\
		    <div class="progress progress-striped active small margin0">\
  				<div class="bar" style="width: {{dynamic}}%;">{{dynamic}}%</div>\
			</div>\
		</div>\
	</div>\
</script>\
\
<script type="text/ng-template" id="edit-task-time.html">\
	<div class="modal-header">\
		<h3>Edit Tasks</h3>\
	</div>\
	<div class="modal-body">\
		<table class="table table-hover table-bordered">\
			<thead>\
				<tr style="font-weight: bold;">\
					<td>Index</td>\
					<td>Status</td>\
					<td>Asign To</td>\
					<td>Task</td>\
					<td>Original</td>\
					<td>Remaining</td>\
					<td>Spent</td>\
				</tr>\
			</thead>\
			<tbody>\
				<tr ng-repeat="row in data | filter:ndo">\
					<td>{{$index + 1}}</td>\
					<td>{{row.status}}</td>\
					<td>{{row.assignee}}</td>\
					<td><div class="fixedw">{{row.subject}}</div></td>\
					<!--<td><textarea ng-model="row.subject"></textarea></td>-->\
					<td>{{row.original}}</td>\
					<td><input type=text ng-model="row.remaining" style="width:30px" maxlength=2></td>\
					<td><input type=text ng-model="row.spent" style="width:30px" maxlength=2></td>\
				</tr>\
			</tbody>\
		</table>\
	</div>\
	<div class="modal-footer">\
		<div class="to-right">\
			<button class="btn btn-primary" ng-click="ndoswitch()">{{ndoText}}</button>\
			<button class="btn btn-primary" ng-click="save()">Save</button>\
			<button class="btn btn-warning" ng-click="cancel()">Cancel</button>\
		</div>\
		<div ng-show="loading" class="to-right small">\
		    <div class="progress progress-striped active small margin0">\
  				<div class="bar" style="width: {{dynamic}}%;">{{dynamic}}%</div>\
			</div>\
		</div>\
	</div>\
</script>\
 \
<script type="text/ng-template" id="sort.html">\
	<div class="modal-header">\
		<h3>Sort</h3>\
	</div>\
	<div class="modal-body">\
		<table class="table table-hover table-bordered">\
			<thead>\
				<tr style="font-weight: bold;">\
					<td>Index</td>\
					<td>Task</td>\
					<td>Order</td>\
				</tr>\
			</thead>\
			<tbody>\
				<tr ng-repeat="row in data">\
					<td>{{$index + 1}}</td>\
					<td><div class="fixedw">{{row.subject}}</div></td>\
					<td><input type=text ng-model="row.order" style="width:30px"></td>\
				</tr>\
			</tbody>\
		</table>\
	</div>\
	<div class="modal-footer">\
		<div class="to-right">\
			<button class="btn btn-primary" ng-click="lucky()">Lucky</button>\
			<button class="btn btn-primary" ng-click="resort()">Resort View</button>\
			<button class="btn btn-primary" ng-click="save()">Save</button>\
			<button class="btn btn-warning" ng-click="cancel()">Cancel</button>\
		</div>\
		<div ng-show="loading" class="to-right small">\
		    <div class="progress progress-striped active small margin0">\
  				<div class="bar" style="width: {{dynamic}}%;">{{dynamic}}%</div>\
			</div>\
		</div>\
	</div>\
</script>\
<script type="text/ng-template" id="export.html">\
	<div class="modal-header">\
		<h3>Export Tasks</h3>\
	</div>\
	<div class="modal-body">\
		<div>\
		<textarea class="minh">{{json}}</textarea>\
		</div>\
	</div>\
	<div class="modal-footer">\
		<div class="to-right">\
			<button class="btn btn-primary" ng-click="result()">Close</button>\
		</div>\
	</div>\
</script>\
<script type="text/ng-template" id="import.html">\
	<div class="modal-header">\
		<h3>Import Tasks</h3>\
	</div>\
	<div class="modal-body">\
		<div>\
		<textarea class="minh" ng-model="json"></textarea>\
		</div>\
	</div>\
	<div class="modal-footer">\
		<div class="to-right">\
			<button class="btn btn-primary" ng-click="importJson(json)">Import</button>\
			<button class="btn btn-warning" ng-click="cancel()">Cancel</button>\
		</div>\
	</div>\
</script>\
<script type="text/ng-template" id="about.html">\
	<div class="modal-header">\
		<h3>About</h3>\
	</div>\
	<div class="modal-body">\
		<div>\
		{{text}}\
		</div>\
	</div>\
	<div class="modal-footer">\
		<div class="to-right">\
			<button class="btn btn-primary" ng-click="result()">Close</button>\
		</div>\
	</div>\
</script>\
';
