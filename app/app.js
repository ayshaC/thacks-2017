var app = angular.module("myApp", ["ngRoute", "ngAnimate", "ngStorage"]);
app.config(function($routeProvider, $httpProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "views/login.html",
        controller: "loginController",
        controllerAs: 'vm'
    })
    .when("/drivers", {
        templateUrl : "views/drivers.html"
    })
    .when("/driver", {
        templateUrl : "views/driver.html"
    })
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

});

app.factory('AuthenticationService', Service);
 
    function Service($http, $localStorage) {
        var service = {};
 
        service.Login = Login;
        service.Logout = Logout;
 
        return service;

        function Login(username, password, callback) {
            $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
            var data={username: username, password: password}
             $http({
                method: 'POST',
                url: 'http://35.183.6.3:443/auth/token',
                data: JSON.stringify(data),
                headers: {'Content-Type': 'application/json'}
            })
            .then(function (response) {
                    console.log("response");
                    console.log(response);
                    // login successful if there's a token in the response
                    if (response.data.access_token) {
                        // store username and token in local storage to keep user logged in between page refreshes
                        $localStorage.currentUser = { username: username, token: response.data.access_token };
 
                        // add jwt token to auth header for all requests made by the $http service
                        $http.defaults.headers.common.Authorization = 'Bearer ' + response.access_token;
 
                        // execute callback with true to indicate successful login
                        //callback(true);
                        callback(true);
                    } else {
                        // execute callback with false to indicate failed login
                        console.log("failed");
                        callback(false);
                    }
                }, function(error){
                    console.log("error" + error);
                });
        }
 
        function Logout() {
            // remove user from local storage and clear http auth header
            delete $localStorage.currentUser;
            $http.defaults.headers.common.Authorization = '';
        }
    }

app.factory('service', function($http, $localStorage, $location) {
    var serviceTest= {

        getEvents : function(){

            if($localStorage.currentUser.token){
                var url = 'http://35.183.6.3:443/api/getEvents' + '?token=' + $localStorage.currentUser.token

                return $http.get(url, []).then(function successCallback(response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    var data = response.data;
                    console.log(data);
                    return data;
                }, function errorCallback(error) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    return error;
                });
            } else{
                $location.path('/');
            }

        
        }


    };


    return serviceTest;
});

app.controller('loginController', ['$scope', 'AuthenticationService', '$location', function($scope, AuthenticationService, $location) {

        var vm = this;
 
        vm.login = login;
 
        initController();
 
        function initController() {
            // reset login status
            AuthenticationService.Logout();
            $location.path('/');
        };
 
        function login() {
            vm.loading = true;
            AuthenticationService.Login(vm.username, vm.password, function (result) {
                if (result === true) {
                    $location.path('/drivers');
                } else {
                    vm.error = 'Username or password is incorrect';
                    vm.loading = false;
                }
            });
        };

}])

app.controller('controller', ['$scope', 'service', '$location', '$timeout', 'AuthenticationService', '$location', function($scope, service, $location, $timeout, AuthenticationService, $location) {
    $scope.startDate;
    $scope.endDate;
    $scope.events;
    $scope.selectedEvent;
    $scope.eventSelected = false;

    $scope.bool = false;

    $scope.logout = function() {
        AuthenticationService.Logout();
        $location.path('/');
        console.log("logout");
    }

    $scope.back = function(){
        $scope.notLoaded = true;
    };

    $scope.drowsy;
    $scope.inattentive;
    $scope.notLooking;

    $scope.getEvents = function() {
        service.getEvents().then(function(myReponseData) {
            $scope.events = myReponseData;
            console.log("data");
            console.log($scope.events);
        }, function(error){
            $location.path('/');
        });   
    };

    $scope.getEvents();


    $scope.selectEvent = function(event){
        $scope.drowsy = false;
        $scope.inattentive = false;
        $scope.notLooking = false;
        $scope.selectedEvent = event;
        $scope.eventSelected = true;
        $scope.video = $scope.selectedEvent['awsKey'];
        if($scope.selectedEvent['groupID'] == "1"){
            $scope.drowsy = true;
        }else if($scope.selectedEvent['groupID'] == "2"){
            $scope.inattentive = true;
        }else if($scope.selectedEvent['groupID'] == "3"){
            $scope.notLooking = true;
        }
    };

     $timeout( function(){
            $scope.bool = true;
    }, 2000 );

        //time
        $scope.time = 0;
        
        //timer callback
        var timer = function() {
            if( $scope.time < 5000 ) {
                $scope.time += 1000;
                $timeout(timer, 1000);
            }
        }
        
        //run!!
        $timeout(timer, 1000);    
}]);

app.filter("trustUrl", ['$sce', function ($sce) {
        return function (recordingUrl) {
            return $sce.trustAsResourceUrl(recordingUrl);
        };
}]);





