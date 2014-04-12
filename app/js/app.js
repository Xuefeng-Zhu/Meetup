'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
	'ngRoute',
	'firebase',
	'myApp.filters',
	'myApp.services',
	'myApp.directives',
	'myApp.controllers'
	]).
config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/Private', {
		templateUrl: 'partials/private.html', 
		controller: 'PrivateCtrl'
	});
	$routeProvider.otherwise({
		redirectTo: '/Private'
	});
}]);
