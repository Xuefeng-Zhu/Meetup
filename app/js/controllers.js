'use strict';

/* Controllers */

var url = "https://meetup2014.firebaseIO.com";

angular.module('myApp.controllers', ['firebase','ngCookies'])
.controller('userCtrl', ["$scope", "$rootScope", "$firebase", "$firebaseSimpleLogin", "$cookies", function($scope, $rootScope, $firebase,$firebaseSimpleLogin, $cookies) {
	
	var ref = new Firebase(url + "/Users");
	$scope.users = $firebase(ref);
	$rootScope.auth = $firebaseSimpleLogin(ref);

	$rootScope.$watch('auth.user', upload, true);

	function upload(){
		if (!$rootScope.auth.user){
			return;
		}
		var id = $cookies.id = $rootScope.auth.user.id;
		if (!$scope.users[id]){
			var email = $scope.auth.user.email;
			var pic = "https://graph.facebook.com/" + id + "/picture";
			var name = $scope.auth.user.name;
			$scope.users.$child(id).$set({email:email, pic:pic, Username: name});
		}
	};

}])  
.controller('PrivateCtrl', ["$scope", "$rootScope", "$firebase", "$cookies", function($scope, $rootScope, $firebase, $cookies) {

	getEvents();

	$scope.picker = new Pikaday(
	{
		field: $('#datepicker')[0],
		firstDay: 1,
		minDate: new Date(),
		maxDate: new Date('2020-12-31'),
		onSelect: function() {
			$scope.events.$add({concise: $scope.concise, date: this.toString(), complete: false});
			$scope.concise = "";
			this.gotoToday();
		}
	});

	$scope.toggleCompleted = function (id) {
		setTimeout(function() {
			var event = $scope.events[id];
			event.complete = !event.complete;
			$scope.events.$save(id);
		}, 200);

	};


	function getEvents(){
		var ref = new Firebase(url + "/Private/" + $cookies.id);
		$scope.events = $firebase(ref);
	}


}])
.controller('MyCtrl2', [function() {

}]);