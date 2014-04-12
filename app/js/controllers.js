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

	$scope.concise = "";
	$scope.selectEvent = null;
	$scope.selectID = null;
	getEvents();

	$scope.picker = new Pikaday(
	{
		field: $('#datepicker')[0],
		firstDay: 1,
		minDate: new Date(),
		maxDate: new Date('2020-12-31'),
		onSelect: function() {
			if (!$scope.concise || $scope.concise == "")
			{
				alert("Please input event information");
				return;
			}
			$scope.events.$add({concise: $scope.concise, date: this.toString(), complete: false});
			$scope.concise = "";
			this.gotoToday();
		}
	});

	$scope.picker2 = new Pikaday(
	{
		field: $('#datepicker2')[0],
		firstDay: 1,
		minDate: new Date(),
		maxDate: new Date('2020-12-31'),
	});

	$scope.toggleCompleted = function(id){
		setTimeout(function() {
			var event = $scope.events[id];
			event.complete = !event.complete;
			$scope.events.$save(id);
		}, 200);

	};

	$scope.addEvent = function(){
		var concise = $scope.concise.trim();
		if (concise == "") {
			alert("Please input event information");
			return;
		}
		$scope.events.$add({concise: concise, date: $scope.picker.toString(), complete: false});
		$scope.picker.gotoToday();
		$scope.concise = '';
	}

	$scope.removeEvent = function(id){
		$scope.events.$remove(id);
	};

	$scope.showEvent = function(id){
		$scope.selectEvent = $scope.events[id];
		$scope.originalEvent = angular.extend({}, $scope.selectEvent);
		$scope.selectID = id; 
		$scope.picker2.setDate($scope.selectEvent.date);
		$('.overlay.sidebar') .sidebar({
			overlay: true})
		.sidebar('toggle');
	};

	$scope.saveEvent = function(){
		$scope.events.$save($scope.selectID);
		$scope.selectEvent = null;
		$scope.originalEvent = null;
		$scope.selectID = null; 

		$('.overlay.sidebar') .sidebar({
			overlay: true})
		.sidebar('toggle');
	}

	$scope.cancelEvent = function(){
		$scope.events[$scope.selectID] = $scope.originalEvent;
		$scope.selectEvent = null;
		$scope.originalEvent = null;
		$scope.selectID = null; 

		$('.overlay.sidebar') .sidebar({
			overlay: true})
		.sidebar('toggle');
	}

	function getEvents(){
		var ref = new Firebase(url + "/Private/" + $cookies.id);
		$scope.events = $firebase(ref);
	}



}])
.controller('MyCtrl2', [function() {

}]);