#angular-resource-tastypie
Simple angularJs client for django-tastypie or equivalent schema RESTful.

##Requirements
- AngularJs

##Usage

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

- Add the module dependency:
```javascript
angular.module('myApp', ['ngResourceTastypie'])
```

- Add your web service provider configuration:
```javascript
.config(function($tastypieProvider){
    $tastypieProvider.setResourceUrl('http://127.0.0.1:8001/api/v1/');
    $tastypieProvider.setAuth('admin','320c4e7da6ed93946f97f51e6f4c8354a098bb6e');
})
```

- **NOTE**
```javascript
$tastypieProvider.setAuth('username','api_key');
```
```
This api_key was fixed only for demonstration. 
You must generate a dynamic key during the login User, in its authorization system, and then configure this attribute. 
With django-tastypie this task is quite simple: 
http://django-tastypie.readthedocs.org/en/latest/authentication.html
```