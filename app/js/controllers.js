'use strict';

/* Controllers */

var url = "https://meetup2014.firebaseIO.com";
angular.module('myApp.controllers', ['firebase','ngCookies'])
.controller('userCtrl', ["$scope", "$rootScope", "$firebase", "$firebaseSimpleLogin", "$cookies", "$location", function($scope, $rootScope, $firebase,$firebaseSimpleLogin, $cookies, $location) {
	
	var ref = new Firebase(url + "/Users");
	$scope.users = $firebase(ref);
	$rootScope.auth = $firebaseSimpleLogin(ref);

	$rootScope.$watch('auth.user', upload, true);

	$scope.logout = function(){
		$rootScope.auth.$logout();
		$location.path("");
	}

	function upload(){
		if (!$rootScope.auth.user){
			return;
		}
		var id = $rootScope.auth.user.id;
		if (!$cookies.id){
			var email = $scope.auth.user.email;
			var pic = "https://graph.facebook.com/" + id + "/picture";
			var name = $scope.auth.user.name;
			$scope.users.$child(id).$set({email:email, pic:pic, Username: name});
			ref = new Firebase(url + "/Private/" + id +"/categories");
			ref.child("All").set({name: "All", number: 0});
			$cookies.id = $rootScope.auth.user.id;
		}
	};

}])  
.controller('listCtrl', ["$scope", "$rootScope", "$firebase", "$cookies", function($scope, $rootScope, $firebase, $cookies) {
	
	$rootScope.$watch('auth.user', function(){
		if($rootScope.auth.user){
			getCategories();
		}
		else{
			$rootScope.prvCs = null;
		}
	}, true)

	getCategories();

	$scope.selectLid = null;
	$scope.PrvLflag = false;

	
	$scope.selectList = function(lid){
		$scope.selectLid = lid;
	};

	$scope.addPrvL = function(){
		$scope.PrvLflag = true;
	};

	$scope.cancelPrvL = function(){
		$scope.PrvLflag = false;
		$scope.newList = "";
	};

	$scope.savePrvl = function(e){
		if (e.keyCode != 13 || $scope.newList == ""){
			return;
		}
		$rootScope.prvCs.$child($scope.newList).$set({name: $scope.newList, number: 0});
		$scope.cancelPrvL();
	};


	function getCategories(){
		var ref = new Firebase(url + "/Private/" + $cookies.id + "/categories");
		$rootScope.prvCs = $firebase(ref);
	}
}])  
.controller('PrivateCtrl', ["$scope", "$rootScope", "$firebase", "$cookies", "$routeParams", function($scope, $rootScope, $firebase, $cookies, $routeParams) {

	$scope.concise = "";
	$scope.selectEvent = null;
	$scope.selectID = null;
	var category = $routeParams["list"];
	$scope.search = $routeParams["search"];

	getEvents();

	$scope.picker = new Pikaday(
	{
		field: $('#datepicker')[0],
		firstDay: 1,
		minDate: new Date(),
		maxDate: new Date('2020-12-31'),
		onSelect: function() {
			$scope.addEvent();
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
			if (event.complete)
			{
				if (event.category != "All"){
					$rootScope.prvCs[event.category]["number"]--;
					$rootScope.prvCs.$save(event.category);
				}

				$rootScope.prvCs["All"]["number"]--;
				$rootScope.prvCs.$save("All");
			}
			else{
				if (event.category != "All"){
					$rootScope.prvCs[event.category]["number"]++;
					$rootScope.prvCs.$save(event.category);
				}
				$rootScope.prvCs["All"]["number"]++;
				$rootScope.prvCs.$save("All");
			}

		}, 200);

	};

	$scope.addEvent = function(){
		var concise = $scope.concise.trim();
		if (concise == "") {
			alert("Please input event information");
			return;
		}
		$scope.events.$add({concise: concise, date: $scope.picker.toString(), complete: false, category: category});
		if (category != "All"){
			$rootScope.prvCs[category]["number"]++;
			$rootScope.prvCs.$save(category);
		}
		$rootScope.prvCs["All"]["number"]++;
		$rootScope.prvCs.$save("All");

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

	$scope.publishEvent = function(){
		$('#confirm-modal')
		.modal('setting', {
			closable  : true,
			onDeny    : function(){
			},
			onApprove : function() {
				var pCategory = $('#the-basics .typeahead')[1].value;

				if (categories.indexOf(pCategory) == -1)
				{
					categories.push(pCategory);
					new Firebase(url + "/Public/categories").push(pCategory);
				}

				if ($scope.pCategory == "Category")
				{
					alert("Please choose the Category to add");
					return false;
				}

				if (pCategory != ""){
					var ref = new Firebase(url + "/Public/events/" + pCategory);
					$firebase(ref).$child($scope.selectID).$set($scope.selectEvent);
				}

				var ref = new Firebase(url + "/Public/events/New");
				$firebase(ref).$child($scope.selectID).$set($scope.selectEvent);
				var ref = new Firebase(url + "/Collaborating/events");
				$firebase(ref).$child($scope.selectID).$set($scope.selectEvent);

				var ref = new Firebase(url + "/Collaborating/users/" + $cookies.id);
				$firebase(ref).$child($scope.selectID).$set($scope.selectID);

			}
		})
		.modal('show')
		;
	}

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
		var ref = new Firebase(url + "/Private/" + $cookies.id + "/events");
		$scope.events = $firebase(ref);
	}

	//typeahdead
	var substringMatcher = function(strs) {
		return function findMatches(q, cb) {
			var matches, substrRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
    	if (substrRegex.test(str)) {
        // the typeahead jQuery plugin expects suggestions to a
        // JavaScript object, refer to typeahead docs for more info
        matches.push({ value: str });
    }
});

    cb(matches);
};
};

var categories = [];
getCategories();

function getCategories(){
	var ref = new Firebase(url + "/Public/categories");
	ref.on('value', function(snapshot){
		if(snapshot.val() !== null){
			snapshot.forEach(function(childSnapshot){
				categories.push(childSnapshot.val());
			});
		}
	});
}

$('#the-basics .typeahead').typeahead({
	hint: true,
	highlight: true,
	minLength: 1
},
{
	name: 'categories',
	displayKey: 'value',
	source: substringMatcher(categories)
});

}])
.controller('CollabCtrl', ["$scope", "$rootScope", "$firebase", "$cookies", "$routeParams", function($scope, $rootScope, $firebase, $cookies, $routeParams) {

	$scope.selectEvent = null;
	$scope.selectID = null;
	var category = $routeParams["list"];
	$scope.search = $routeParams["search"];

	getEvents();

	$scope.showEvent = function(id){
		$("#meetup").click(TowTruck);
		$scope.selectEvent = $scope.events[id];
		$scope.originalEvent = angular.extend({}, $scope.selectEvent);
		$scope.selectID = id; 
		$('.overlay.sidebar') .sidebar({
			overlay: true})
		.sidebar('toggle');
	};

	$scope.addComment = function(){
		$scope.events.$child($scope.selectID).$child("comments").$add({ author: $rootScope.auth.user.name, pic:"https://graph.facebook.com/" + $cookies.id + "/picture", content: $scope.newComment});
		$scope.selectEvent = $scope.events.$child($scope.selectID);
		$scope.newComment = "";
	};


	$scope.cancelEvent = function(){
		$scope.events[$scope.selectID] = $scope.originalEvent;
		$scope.selectEvent = null;
		$scope.originalEvent = null;
		$scope.selectID = null; 

		$('.overlay.sidebar') .sidebar({
			overlay: true})
		.sidebar('toggle');
	}

	$scope.meetup = function(){

		$scope.pCategory = "Category";
		startdraw();

		$('#draw-modal')
		.modal('setting', {
			closable  : true,
		})
		.modal('show');

	}

function getEvents(){
	var ref = new Firebase(url + "/Collaborating/users");
	$scope.eventIDs = $firebase(ref).$child($cookies.id);
	$scope.events = [];
	setTimeout(function(){
		for(var id in $scope.eventIDs){
			if (id.indexOf('$') == -1)
			{		
				ref = new Firebase(url + "/Collaborating/events/" + $scope.eventIDs[id]);
				$scope.events.push($firebase(ref));

			}
		}
	},1000)
}


}])
.controller('PublicCtrl', ["$scope", "$rootScope", "$firebase", "$cookies", "$routeParams", function($scope, $rootScope, $firebase, $cookies, $routeParams) {

	$scope.selectEvent = null;
	$scope.selectID = null;
	var category = $routeParams["list"];
	$scope.search = $routeParams["search"];

	getEvents();


	$scope.showEvent = function(id){
		$scope.selectEvent = $scope.events[id];
		$scope.originalEvent = angular.extend({}, $scope.selectEvent);
		$scope.selectID = id; 
		$('.overlay.sidebar') .sidebar({
			overlay: true})
		.sidebar('toggle');
	};

	$scope.addComment = function(){
		$scope.events.$child($scope.selectID).$child("comments").$add({ author: $rootScope.auth.user.name, pic:"https://graph.facebook.com/" + $cookies.id + "/picture", content: $scope.newComment});
		$scope.selectEvent = $scope.events.$child($scope.selectID);
		$scope.newComment = "";
	};


	$scope.cancelEvent = function(){
		$scope.events[$scope.selectID] = $scope.originalEvent;
		$scope.selectEvent = null;
		$scope.originalEvent = null;
		$scope.selectID = null; 

		$('.overlay.sidebar') .sidebar({
			overlay: true})
		.sidebar('toggle');
	};

	$scope.joinEvent = function(){
		var ref = new Firebase(url + "/Collaborating/users/" + $cookies.id);
		$firebase(ref).$child($scope.selectID).$set($scope.selectID);
		alert("Join Successfully")
	};

	function getEvents(){
		var ref = new Firebase(url + "/Public/events/" + category);
		$scope.events = $firebase(ref);
	}

}])
.controller('searchCtrl', ["$scope","$location", function($scope, $location) {

	$scope.search = function(){
		$location.search({search: $scope.searchEvent});

	}
}]);