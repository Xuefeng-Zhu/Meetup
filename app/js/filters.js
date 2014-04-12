'use strict';

/* Filters */

angular.module('myApp.filters', []).
  filter('eventFilter', ['$location', function($location) {
    return function(input, complete) {
      var filtered = {};
      angular.forEach(input, function(event, id){
      	if (complete){
      		if (event.complete){
      			filtered[id] = event;
      		}
      	}
      	else{
      		if (!event.complete){
      			filtered[id] = event;
      		}
      	}
      });
      return filtered;
    }
  }]);


