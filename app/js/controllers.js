'use strict';

/* Controllers */

var url = "https://meetup2014.firebaseIO.com";
angular.module('myApp.controllers', ['firebase','ngCookies'])
.controller('userCtrl', ["$scope", "$rootScope", "$firebase", "$firebaseSimpleLogin", "$cookies", "$location", function($scope, $rootScope, $firebase,$firebaseSimpleLogin, $cookies, $location) {
	
	var ref = new Firebase(url + "/Users");
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
		var ref = new Firebase(url + "/Messages/" + $rootScope.auth.user.id + "/receive");
		ref.on('child_added', function(childSnapshot, prevChildName){
			if (!childSnapshot.val().read)
			{
				alertify.success("You receive a message");
			}
		})
		var ref = new Firebase(url + "/Users");
		var id = $cookies.id = $rootScope.auth.user.id;
		$scope.user = $firebase(ref.child(id));
		$scope.user.$on("loaded", function() {
			if (!$scope.user.email){
				var email = $scope.auth.user.email;
				var pic = "https://graph.facebook.com/" + id + "/picture";
				var name = $scope.auth.user.name;
				$scope.user.$set({email:email, pic:pic, Username: name});
				ref = new Firebase(url + "/Private/" + id +"/categories");
				ref.child("All").set({name: "All", number: 0});
				$cookies.id = $rootScope.auth.user.id;
			}
		});
		
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

	
	$scope.selectList = function(lid, pcp){
		$scope.selectLid = lid;
		$scope.pcp = pcp;
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

	$scope.addColL = function(){
		$scope.ColLflag = true;
	};

	$scope.cancelColL = function(){
		$scope.ColLflag = false;
		$scope.newList = "";
	};

	$scope.saveColl = function(e){
		if (e.keyCode != 13 || $scope.newList == ""){
			return;
		}
		$rootScope.colCs.$child($scope.newList).$set({name: $scope.newList, number: 0});
		$scope.cancelColL();
	};

	$scope.addPubL = function(){
		$scope.PubLflag = true;
		while(categories.pop());
		getList();
	};

	$scope.cancelPubL = function(){
		$scope.PubLflag = false;
		$('#public .typeahead')[1].value = "";
	};

	$scope.savePubl = function(e){
		var pCategory = $('#public .typeahead')[1].value;

		if (e.keyCode != 13 || pCategory == ""){
			return;
		}
		var pCategory = $('#public .typeahead')[1].value;

		$rootScope.pubCs.$child(pCategory).$set({name: pCategory, number: 0});
		$('#public .typeahead')[1].value = "";
		$scope.cancelPubL();
	};

	function getCategories(){
		var ref = new Firebase(url + "/Private/" + $cookies.id + "/categories");
		$rootScope.prvCs = $firebase(ref);
		var ref = new Firebase(url + "/Collaborating/" + $cookies.id + "/categories");
		$rootScope.colCs = $firebase(ref);
		var ref = new Firebase(url + "/Public/" + $cookies.id + "/categories");
		$rootScope.pubCs = $firebase(ref);

	}


	$('#public .typeahead').typeahead({
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
	//	$scope.originalEvent = angular.extend({}, $scope.selectEvent);
	$scope.selectID = id; 
	$scope.picker2.setDate($scope.selectEvent.date);
	$('.overlay.sidebar') .sidebar({
		overlay: true})
	.sidebar('toggle');
};

$scope.publishEvent = function(){
	while(categories.pop());
	getList();
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

			$scope.selectEvent["createrId"] = $rootScope.auth.user.id;
			$scope.selectEvent["createrName"] = $rootScope.auth.user.displayName;

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
//	$scope.originalEvent = null;
$scope.selectID = null; 

$('.overlay.sidebar') .sidebar({
	overlay: true})
.sidebar('toggle');
}

$scope.cancelEvent = function(){
//	$scope.events[$scope.selectID] = $scope.originalEvent;
$scope.selectEvent = null;
//	$scope.originalEvent = null;
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
	$('.ui.dropdown')
	.dropdown();
	
	$scope.showEvent = function(id){
		$("codraw").click(TowTruck);
		$scope.selectEvent = $scope.events[id];
	//	$scope.originalEvent = angular.extend({}, $scope.selectEvent);
		$scope.selectID = id; 
		$('.overlay.sidebar') .sidebar({
			overlay: true,
			onHide: function(){
				$("#newComment").val("");
			}})
		.sidebar('toggle');
	};

	$scope.addComment = function(){
		if($("#newComment").val().trim().length == 0){
			return;
		}	

		var newComment = { 
			author: $rootScope.auth.user.name,
			authorId: $rootScope.auth.user.id,
			pic:"https://graph.facebook.com/" + $cookies.id + "/picture", 
			content: $("#newComment").val()
		}	

		var commentRef = new Firebase(url + "/Collaborating/events/" + $scope.eventIDs[Object.keys($scope.eventIDs)[$scope.selectID]] + "/comments");
		commentRef.push(newComment);	

		commentRef.parent().once('value', function(dataSnapshot){
			$scope.selectEvent = dataSnapshot.val();
			$scope.events[$scope.selectID] = dataSnapshot.val();
		})
		$("#newComment").val("");	

	};	
	

	$scope.cancelEvent = function(){
		//	$scope.events[$scope.selectID] = $scope.originalEvent;
		$scope.selectEvent = null;
		//	$scope.originalEvent = null;
		$scope.selectID = null; 	

		$('.overlay.sidebar') .sidebar({
			overlay: true})
		.sidebar('toggle');
		$("#newComment").val("");
	}	

	$scope.codraw = function(){	

		TowTruck(this);	

		startdraw($scope.eventIDs[Object.keys($scope.eventIDs)[$scope.selectID]]);	

		$('#draw-modal')
		.modal('setting', {
			closable  : true,
			onHide: function(){
				TowTruck(this);
			}
		})
		.modal('show');	

	}	

	$scope.coedit = function(){	

		TowTruck(this);	

		var firepadRef = new Firebase(url + "/edit/" + $scope.eventIDs[Object.keys($scope.eventIDs)[$scope.selectID]]);
		
		var editor = ace.edit("coedit-container");
		editor.setTheme("ace/theme/textmate");
		var session = editor.getSession();
		session.setUseWrapMode(true);
		session.setUseWorker(false);
		session.setMode("ace/mode/javascript");	

		var firepad = Firepad.fromACE(firepadRef, editor);	

		firepad.on('ready', function() {
			if (firepad.isHistoryEmpty()) {
				firepad.setText('//Start Code with you friends');
			}
		});	

		$('#edit-modal')
		.modal('setting', {
			closable  : true,
			onHide: function(){
				TowTruck(this);
			}
		})
		.modal('show');	

	}	

	$scope.cleardraw = function(){
		var pixelDataRef = new Firebase(url + "/draw/" + $scope.eventIDs[Object.keys($scope.eventIDs)[$scope.selectID]]);
		pixelDataRef.remove();
	}	

	$scope.sendMessage = function(receiverName, receiverId){
		alertify.prompt("You are sending a message to " + receiverName, function (e, str) {
	    // str is the input text
	    if (e) {
	        // user clicked "ok"
	        var message = {
	        	"content": str,
	        	"receiverId": receiverId,
	        	"receiverName": receiverName,
	        	"senderId": $rootScope.auth.user.id,
	        	"senderName": $rootScope.auth.user.displayName,
	        	"read" : false,
	        	"event" : $scope.selectEvent.concise,
	        	"date" : Date()
	        };
	        var ref = new Firebase(url + "/Messages/" + receiverId + "/receive");
	        ref.push(message);
	        var ref = new Firebase(url + "/Messages/" + $rootScope.auth.user.id + "/send");
	        ref.push(message);
	    } else {
	        // user clicked "cancel"
	    }
	}, "");
	}	

	function getEvents(){
		var ref = new Firebase(url + "/Collaborating/users");
		$scope.eventIDs = $firebase(ref).$child($cookies.id);
		$scope.events = [];	

		$scope.eventIDs.$on("loaded", function(){
			ref = new Firebase(url + "/Collaborating/events");
			for(var id in $scope.eventIDs){
				if (id.indexOf('$') == -1)
				{		
					$scope.events.push($firebase(ref.child($scope.eventIDs[id])));	

				}
				else 
				{
					delete $scope.eventIDs[id];
				}
			}
		});
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
	//	$scope.originalEvent = angular.extend({}, $scope.selectEvent);
		$scope.selectID = id; 
		$('.overlay.sidebar') .sidebar({
			overlay: true,
			onHide: function(){
				$("#newComment").val("");
			}
		})
		.sidebar('toggle');
	};

	$scope.addComment = function(){
		if ($("#newComment").val().trim().length == 0){
			return;
		}
		var newComment = { 
			author: $rootScope.auth.user.name,
			authorId: $rootScope.auth.user.id,
			pic:"https://graph.facebook.com/" + $cookies.id + "/picture", 
			content: $("#newComment").val()
		}
		$scope.events.$child($scope.selectID).$child("comments").$add(newComment);
		$scope.selectEvent = $scope.events.$child($scope.selectID);
		$("#newComment").val("");
	};	
	

	$scope.cancelEvent = function(){
		//	$scope.events[$scope.selectID] = $scope.originalEvent;
		$scope.selectEvent = null;
		//	$scope.originalEvent = null;
		$scope.selectID = null; 	

		$('.overlay.sidebar') .sidebar({
			overlay: true})
		.sidebar('toggle');
		$("#newComment").val("");
	};	

	$scope.joinEvent = function(){
		var ref = new Firebase(url + "/Collaborating/users/" + $cookies.id);
		$firebase(ref).$child($scope.selectID).$set($scope.selectID);
		alertify.alert("Join Successfully");
	};	

	$scope.sendMessage = function(receiverName, receiverId){
		alertify.prompt("You are sending a message to " + receiverName, function (e, str) {
	    // str is the input text
	    if (e) {
	        // user clicked "ok"
	        var message = {
	        	"content": str,
	        	"receiverId": receiverId,
	        	"receiverName": receiverName,
	        	"senderId": $rootScope.auth.user.id,
	        	"senderName": $rootScope.auth.user.displayName,
	        	"read" : false,
	        	"event" : $scope.selectEvent.concise,
	        	"date" : Date()
	        };
	        var ref = new Firebase(url + "/Messages/" + receiverId + "/receive");
	        ref.push(message);
	        var ref = new Firebase(url + "/Messages/" + $rootScope.auth.user.id + "/send");
	        ref.push(message);
	    } else {
	        // user clicked "cancel"
	    }
	}, "");
	}	

	function getEvents(){
		var ref = new Firebase(url + "/Public/events/" + category);
		$scope.events = $firebase(ref);
	}	

	}])
	.controller('searchCtrl', ["$scope","$location", function($scope, $location) {	

		$scope.search = function(){
			$location.search({search: $scope.searchEvent});	

		}
}])
.controller('MessagesCtrl', ["$scope", "$rootScope", "$firebase", "$cookies", "$routeParams", "$route", function($scope, $rootScope, $firebase, $cookies, $routeParams, $route) {

	var folder = $routeParams["folder"];

	getMessages();

	$scope.messages.$on("loaded", function(){
		$('#messagebox').scrollTableBody({rowsToDisplay:4});
	});

	$scope.selectMessage = function(id, message){
		$scope.selectedM = message;
		$scope.selectedMId = id;
		message.read = true;
		$scope.messages.$save(id);
	}



	$scope.reply = function(){
		alertify.prompt("You are sending a message to " + $scope.selectedM.senderName, function (e, str) {
    // str is the input text
    if (e) {
		        // user clicked "ok"
		        var message = {
		        	"content": str,
		        	"receiverId": $scope.selectedM.senderId,
		        	"receiverName": $scope.selectedM.senderName,
		        	"senderId": $scope.selectedM.receiverId,
		        	"senderName": $scope.selectedM.receiverName,
		        	"read" : false,
		        	"event" : $scope.selectedM.event,
		        	"date" : Date()
		        };
		        var ref = new Firebase(url + "/Messages/" + $scope.selectedM.senderId + "/receive");
		        ref.push(message);
		        var ref = new Firebase(url + "/Messages/" + $scope.selectedM.receiverId + "/send");
		        ref.push(message);
		    } else {
		        // user clicked "cancel"
		    }
		}, "");
	}

	$scope.resend = function(){
		$scope.selectedM.read = false;
		var ref = new Firebase(url + "/Messages/" + $scope.selectedM.receiverId + "/receive");
		ref.push($scope.selectedM);
		var ref = new Firebase(url + "/Messages/" + $scope.selectedM.senderId + "/send");
		ref.push($scope.selectedM);
		$route.reload();

	}

	$scope.delete = function(){
		$scope.messages.$remove($scope.selectedMId);
		$route.reload();
	}

	function getMessages(){
		if (folder == "Inbox"){
			var ref = new Firebase(url + "/Messages/" + $cookies.id + "/receive");
			$scope.messages = $firebase(ref);
			$scope.direction = "From"
		}
		else if (folder == "Outbox"){
			var ref = new Firebase(url + "/Messages/" + $cookies.id + "/send");
			$scope.messages = $firebase(ref);
			$scope.direction = "To"
		}
	}
}]);