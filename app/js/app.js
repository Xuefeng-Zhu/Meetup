'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
	'ngRoute',
	'firebase',
	'myApp.filters',
	'myApp.services',
	'myApp.directives',
	'myApp.controllers',
	'ngAnimate', 
	'fx.animations'
	]).
config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/Private/:list', {
		templateUrl: 'partials/private.html', 
		controller: 'PrivateCtrl'
	});
	$routeProvider.when('/Collaborating/:list', {
		templateUrl: 'partials/collaborating.html', 
		controller: 'CollabCtrl'
	});
	$routeProvider.when('/Public/:list', {
		templateUrl: 'partials/public.html', 
		controller: 'PublicCtrl'
	});
	$routeProvider.when('/Messages/:folder', {
		templateUrl: 'partials/messages.html', 
		controller: 'MessagesCtrl'
	});

//	$routeProvider.otherwise({
//		redirectTo: '/Private'
//	});
}]);
