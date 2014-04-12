'use strict';

/* Controllers */

var url = "https://meetup2014.firebaseIO.com";

angular.module('myApp.controllers', ['firebase'])
.controller('userCtrl', ["$scope", "$rootScope", "$firebase", "$firebaseSimpleLogin", function($scope, $rootScope, $firebase,$firebaseSimpleLogin) {
	
	var ref = new Firebase(url+"/Users");
	$scope.users = $firebase(ref);
	$scope.auth = $firebaseSimpleLogin(ref);

	$scope.login = function(){
		$scope.auth.$login('facebook', {rememberMe: false, scope:'email,basic_info'});
		$rootScope.id = $scope.auth.user.id;
		if (!$scope.users.$child(id)){
			alert("hello");
			upload();
		}
	}

	function upload(){
		var email = $scope.auth.user.email;
		var pic = "https://graph.facebook.com/{{auth.user.id}}/picture";
		var name = $scope.auth.user.name;
		$scope.users.$child(id).$set({email:email, pic:pic, Username: name});
	};

}])  
.controller('PrivateCtrl', ["$scope", "$rootScope", "$firebase", function($scope, $rootScope, $firebase) {

	$rootScope.$watch('auth.user', getEvents);

	if ($rootScope.auth.user){
		getEvents();
	}

	function getEvents(){
		$scope.privateE = $rootScope.root.$child('Private')
		$scope.events = $scope.privateE.$child('UserID');
	}


}])
.controller('MyCtrl2', [function() {

}]);