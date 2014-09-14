angular-resource-tastypie
=========================

- Simple angularJs client for django-tastypie or equivalent schema RESTful.

**Requirements**

- AngularJs

**Usage sample:**

```javascript
angular.module('myApp', ['ngResourceTastypie'])

.config(function($tastypieProvider){
    $tastypieProvider.setResourceUrl('http://127.0.0.1:8001/api/v1/');
    $tastypieProvider.setAuth('admin','320c4e7da6ed93946f97f51e6f4c8354a098bb6e');
})

.controller('MyCtrl', ['$scope', '$tastypieResource', function($scope, $tastypieResource){

    $scope.Song = new $tastypieResource('song', {limit:5});
    $scope.Song.objects.$find();

    $scope.song = $scope.Song.objects.$create();
    
}]);
```