var legoApp = angular.module("legoApp", ['ngRoute', 'ngCookies', 'ngAnimate', 'angularUtils.directives.dirPagination']);
var apiPath = "http://danielbarranco.com:3002";
var rebrickableURL = 'https://rebrickable.com/api/search?key=wqq5lDBA3N&format=json&type=S&query=';
var rebrickablePartsURL = 'https://rebrickable.com/api/get_set_parts?key=wqq5lDBA3N&format=json&type=S&set=';
var rebrickableMocURL = 'https://rebrickable.com/api/search?key=wqq5lDBA3N&format=json&type=M&query='

legoApp.factory('Data', function(){
	return { Set_id: '' };
});

legoApp.controller('mainController', function($scope, $rootScope, $route, $http, $location, $cookies, $window, Data){
	$scope.instructionsURL = 'https://wwwsecure.us.lego.com/en-us/service/buildinginstructions/search#?search&text='
	$scope.pageClass = 'page-other';
	$scope.Data = Data;
	$rootScope.loggedIn;

	$scope.getSetId = function(set_id){
		console.log(set_id);
	}

	$scope.getLegoSearch = function(){
		$scope.loading = true;
		$scope.onLoad = true;
		$http({
		method: 'GET',
		url: rebrickableURL + $scope.queryString, cache: true
		}).then(function successFunction(searchData){
			console.log(searchData);
			$scope.legoArray = searchData.data.results;
			for (var i = 0; i < searchData.data.results.length; i++){
				if (searchData.data.results[i].kit == 1){
					searchData.data.results.splice(i, 1);
				}
			} for (var j = 0; j < searchData.data.results.length; j++){
				var setId = searchData.data.results[j].set_id;
				searchData.data.results[j].tset_id = setId.slice(0, -2);
				// console.log($scope.truncatedSetId);
				$scope.newLegoArray = searchData.data.results;
			} console.log($scope.newLegoArray);
		},function failureFunction(searchData){
			console.log(searchData.data.results);
		}
	).finally(function () {
      $scope.loading = false;
      $scope.onLoad = false;
    });
	}

	$scope.sort = function(keyname){
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }

	$scope.register = function(){
		$http.post(apiPath + '/register', {
			fullname: $scope.fullname,
			username: $scope.username,
			password: $scope.password,
			password2: $scope.password2,
			email: $scope.email
		}).then(function successCallback(response){
			console.log(response);
			if(response.data.message == 'added'){
				$cookies.put('token', response.data.token);
				$cookies.put('username', $scope.username);
				$location.path('/search');
				$rootScope.loggedIn = true;
				console.log(response.data);
			}
		},function errorCallback(response){
			console.log('error');
			console.log(response);
		});
	};

	$rootScope.login = function(){
		$http.post(apiPath + '/login', {
			username: $scope.username,
			password: $scope.password
		}).then(function successCallback(response){
			console.log(response.data);
			if(response.data.success == 'userfound'){
				$cookies.put('token', response.data.token);
				$cookies.put('username', $scope.username);
				$location.path('/profile');
				$rootScope.loggedIn = true;
				console.log($scope.loggedIn);
				console.log(response.data.token);
			}
			if(response.data.failure == 'noUser'){
				$scope.wrongUsername = true;
			}
			if(response.data.failure == 'badPass'){
				$scope.wrongPassword = true;
			}
		},function errorCallback(response){
			console.log('error');
			console.log(response);
		});
	};

	$rootScope.logout = function(){
		$cookies.remove('token');
		$cookies.remove('username');
		$rootScope.loggedIn = false;
		console.log($scope.loggedIn);
	}

	$scope.addToCollection = function(results){
		$http.post(apiPath + '/addToCollection', {
			results: results,
			token: $cookies.get('token')
		}).then(function successCallback(response){
			console.log(response);
		}, function errorCallback(response){
			console.log(response.data);
		});
	};

	$scope.removeFromCollection = function(results){
		$http.post(apiPath + '/removeFromCollection', {
			results: results,
			token: $cookies.get('token')
		}).then(function successCallback(response){
			$scope.getUserData();
			console.log(response);
		}, function errorCallback(response){
			console.log(response.data);
		});
	};

	$scope.getUserData = function(){
		$http.get(apiPath + '/getUserData?token=' + $cookies.get('token')).then(function successCallback(response){
			if (response.data.failure == 'noToken' || response.data.failure == 'badToken'){
				$location.path('/login');
				console.log(response.data);
			} else {
				$scope.fullname = response.data.fullname;
				$scope.username = response.data.username;
				$scope.email = response.data.email;
				$scope.sets = response.data.sets;
				for (var j = 0; j < response.data.sets.length; j++){
					var setId = response.data.sets[j].set_id;
					response.data.sets[j].tset_id = setId.slice(0, -2);
					$scope.sets = response.data.sets;
				}
			}
		}, function errorCallback(response){
			console.log(response.status);
		});
	};

	$scope.getUserPartsInventory = function(){
		$http.get(apiPath + '/getUserPartsInventory?token=' + $cookies.get('token')).then(function successCallback(response){
			if (response.data.failure == 'noToken' || response.data.failure == 'badToken'){
				$location.path('/login');
				console.log(response.data);
			} else {
				var partsArrays = response.data.parts;
				var mergedPartsArrays = [].concat.apply([], partsArrays);
				var totalPartsArray = []
				for(var i = 0; i < mergedPartsArrays.length; i++){
					for(var j = 0; j < mergedPartsArrays[i].parts.length; j++){
						totalPartsArray.push(mergedPartsArrays[i].parts[j]);
					}
				}
				totalPartsArray.sort(function(a, b){
					return parseFloat(a.element_id) - parseFloat(b.element_id);
				});
				for(var k = 0; k < totalPartsArray.length-1; k++){
					if (totalPartsArray[k].element_id == totalPartsArray[k+1].element_id){
						totalPartsArray[k].qty = parseFloat(totalPartsArray[k].qty) + parseFloat(totalPartsArray[k+1].qty);
						totalPartsArray.splice(k+1, 1);
						k=-1; continue;
					};
				};
				$scope.totalPartsInventory = totalPartsArray;
				console.log($scope.totalPartsInventory);
			}
		}, function errorCallback(response){
			console.log(response.status);
		});
	};

	$scope.getLegoPartsSearch = function(set_id){
		$scope.loading = true;
		$scope.onLoad = true;
		$http({
		method: 'GET',
		url: rebrickablePartsURL + set_id, cache: true
		}).then(function successFunction(searchData){
			$scope.legoPartsArray = searchData.data.results;
			$scope.addPartsToCollection(searchData.data);
			$scope.partObject = searchData.data;
		},function failureFunction(searchData){
			console.log(searchData.data.results);
		}).finally(function () {
      // Hide loading spinner whether our call succeeded or failed.
      $scope.loading = false;
      $scope.onLoad = false;
    });
	}

	$scope.getLegoPartsSearchRemove = function(set_id){
		$scope.loading = true;
		$scope.onLoad = true;
		$http({
		method: 'GET',
		url: rebrickablePartsURL + set_id, cache: true
		}).then(function successFunction(searchData){
			$scope.legoPartsArray = searchData.data.results;
			$scope.removePartsFromCollection(searchData.data);
			$scope.partObject = searchData.data;
		},function failureFunction(searchData){
			console.log(searchData.data.results);
		}
	).finally(function () {
      $scope.loading = false;
      $scope.onLoad = false;
    });
	}

	$scope.addPartsToCollection = function(parts){
		console.log(parts);
		$http.post(apiPath + '/addPartsToCollection', {
			parts: parts,
			token: $cookies.get('token')
		}).then(function successCallback(response){
			console.log(response);
		}, function errorCallback(response){
			console.log(response.data);
		});
	};

	$scope.removePartsFromCollection = function(parts){
		$scope.loading = true;
		$http.post(apiPath + '/removePartsFromCollection', {
			parts: parts,
			token: $cookies.get('token')
		}).then(function successCallback(response){
			console.log(response);
		}, function errorCallback(response){
			console.log(response.data);
		}).finally(function () {
      $scope.loading = false;
    });
	};

});

legoApp.controller('piecesController', function($scope, $rootScope, $http, $location, $cookies, Data){
	$scope.Data = Data;
	$scope.pageClass = 'page-home';
	$rootScope.loggedIn;
	// $rootScope.loggedIn = true;

	$scope.getLegoPartsSearch = function(set_id){
		$scope.loading = true;
		$scope.onLoad = true;
		$http({
		method: 'GET',
		url: rebrickablePartsURL + set_id, cache: true
		}).then(function successFunction(searchData){
			$scope.legoPartsArray = searchData.data[0].parts;
			console.log(searchData);
		},function failureFunction(searchData){
			console.log(searchData.data.results);
		}).finally(function () {
      $scope.loading = false;
      $scope.onLoad = false;
    });
	}

});

legoApp.controller('homeController', function($scope, $rootScope, $route, $http, $location, $cookies, $window, Data){
	$scope.pageClass = 'page-home';
	$scope.Data = Data;
	$rootScope.loggedIn;
	// $rootScope.loggedIn = true;

	$scope.randMocSearch = Math.floor((Math.random() * 100) + 1);
	var randMocImage = Math.floor((Math.random() * 1000) + 1);

	$scope.getMocSearch = function(){
		$scope.loading = true;
		$http({
		method: 'GET',
		url: rebrickableMocURL + $scope.randMocSearch
		}).then(function successFunction(searchData){
			$scope.mocList = searchData.data.results;
			console.log($scope.randMocSearch);
			console.log($scope.mocList);
			$scope.mocImage = searchData.data.results[0].img_sm;
			$scope.mocImage2 = searchData.data.results[1].img_sm;
			$scope.mocImage3 = searchData.data.results[2].img_sm;
			console.log($scope.mocImage);
		},function failureFunction(searchData){
			console.log(searchData.data.results);
		}
	).finally(function () {
      $scope.loading = false;
    });
	}

	$scope.register = function(){
		$http.post(apiPath + '/register', {
			fullname: $scope.fullname,
			username: $scope.username,
			password: $scope.password,
			password2: $scope.password2,
			email: $scope.email
		}).then(function successCallback(response){
			console.log(response);
			if(response.data.message == 'added'){
				$cookies.put('token', response.data.token);
				$cookies.put('username', $scope.username);
				$location.path('/search');
				$rootScope.loggedIn = true;
				console.log(response.data);
			}
		},function errorCallback(response){
			console.log('error');
			console.log(response);
		});
	};


});

legoApp.config(function($routeProvider){
	$routeProvider.when('/',{
		templateUrl: 'views/main.html',
		controller: 'homeController'
	})
	.when('/login',{
		templateUrl: 'views/login.html',
		controller: 'mainController'
	})
	.when('/register',{
		templateUrl: 'views/register.html',
		controller: 'mainController'
	})
	.when('/search',{
		templateUrl: 'views/search.html',
		controller: 'mainController'
	})
	.when('/profile',{
		templateUrl: 'views/profile.html',
		controller: 'mainController'
	})
	.when('/setparts',{
		templateUrl: 'views/setparts.html',
		controller: 'piecesController'
	})
	.when('/totalparts',{
		templateUrl: 'views/totalparts.html',
		controller: 'mainController'
	})
});