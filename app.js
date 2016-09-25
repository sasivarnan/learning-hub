angular.module('angularApp', ['ngRoute', 'ui.bootstrap', 'cgBusy'])
  .value('cgBusyDefaults', {
    message: 'Searching',
    templateUrl: 'templates/custom-loading.html',
    delay: 0,
    minDuration: 700
  })
  .filter('pathFilter', function () {
    return function (paths, selectedTag) {
      var filteredItems = [];
      if (selectedTag) {
        filteredItems = paths.filter(function (path) {
          return path.tags.indexOf(selectedTag) != -1;
        });
      } else {
        filteredItems = paths;
      }
      return filteredItems;
    }
  })
  .controller('HeaderController', function ($scope, $location) {
    $scope.isActive = function (currentLocation) {
      return currentLocation === $location.path();
    };
  })
  .controller('PathsController', function ($scope, $http) {
    $scope.paths = [];
    $scope.tags = [];

    $scope.fetchingPaths = $http({
      method: 'GET',
      url: 'https://hackerearth.0x10.info/api/learning-paths?type=json&query=list_paths'
      // url: '/data/paths.json'
    }).then(function successCallback(response) {
      var paths = response.data.paths, tags = [];
      $scope.paths = paths.map(function (path) {

        var pathTags = path.tags.split(', ');
        pathTags.forEach(function (pathTag) {
          if (tags.indexOf(pathTag) == -1) tags.push(pathTag);
        });
        path.tags = pathTags;

        //remove plus from the hours 
        var hours = path.hours;
        path.hours = hours && Number(hours.substr(0, hours.length - 1));

        //remove comma from learner count
        path.learner = path.learner && Number(path.learner.replace(',', ''));

        //add votes from localStorage
        path.votes = Number(localStorage.getItem(path.id));

        return path;
      });

      $scope.tags = tags;
      console.log(response);
    }, function errorCallback(response) {
      console.log(response);
    });

    //set selected tags
    $scope.setSelectedTag = function (tag) {
      $scope.selectedTag = tag;
    }

    //clear selected Tag
    $scope.clearSelectedTag = function () {
      $scope.selectedTag = null;
    }

    //sort path based on a property
    $scope.sortPaths = function (property, direction) {
      $scope.paths.sort(function (pathA, pathB) {
        return (pathA[property] - pathB[property]) * direction;
      });
    }

    //vote up/down a path
    $scope.votePath = function (path, vote) {
      path.votes += vote;
      localStorage.setItem(path.id, path.votes);
    }

  })
  .config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');

    $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'PathsController'
      })
      .when('/about', {
        templateUrl: 'views/about.html'
      })
      .otherwise({ redirectTo: '/' });

  }]);
