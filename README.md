#angular-resource-tastypie
The base [angular-resource](https://docs.angularjs.org/api/ngResource/service/$resource) 
with improvements for [django-tastypie](https://django-tastypie.readthedocs.org/en/latest/).

##Requirements
- AngularJs

##Usage
controller.js
```javascript
angular.module('myApp', ['ngResourceTastypie'])

.config(function($tastypieProvider){
    $tastypieProvider.setResourceUrl('http://127.0.0.1:8001/api/v1/');
    $tastypieProvider.setAuth('admin','320c4e7da6ed93946f97f51e6f4c8354a098bb6e');
})

.controller('MyCtrl', ['$scope', '$tastypieResource', function($scope, $tastypieResource){

    $scope.Service = new $tastypieResource('service', {limit:5});
    $scope.Service.objects.$find();
    
}]);
```

view.html
```html
...
    <script src="angular.min.js"></script>
    <script src="angular-resource.min.js"></script>
    <script src="angular-resource-tastypie.min.js"></script>
    <script src="controller.js"></script>
...
```

-<h5>Add the module dependency:</h5>
```javascript
angular.module('myApp', ['ngResourceTastypie'])
```

-<h5>Add your web services provider configuration:</h5>
```javascript
.config(function($tastypieProvider){
    $tastypieProvider.setResourceUrl('http://127.0.0.1:8001/api/v1/');
    $tastypieProvider.setAuth('admin','320c4e7da6ed93946f97f51e6f4c8354a098bb6e');
})
```

*NOTE*
```javascript
$tastypieProvider.setAuth('username','api_key');
```
<blockquote>
<p>
This api_key was fixed only for demonstration. 
You must generate a dynamic key during the login User, 
in its authorization system, and then configure this attribute. 
With django-tastypie this task is quite simple: 
http://django-tastypie.readthedocs.org/en/latest/authentication.html
</p>
</blockquote>

-<h5>Add dependency in the scope:</h5>
.controller('MyCtrl', ['$scope', '$tastypieResource', function($scope, $tastypieResource){
    ...
}]);
```

## $tastypieResource
This class is responsible by connect on the specific "list endpoint".
This is where all magic happens.

<h5>Consider the following example:</h5>
We have a service called "song", responsible for providing the "TOP 100 SONGS CLASSIC ROCK":
```
http://127.0.0.1:8001/api/v1/song/
```
Then:
```javascript
$scope.Song = new $tastypieResource('song');

//or with default filters
$scope.Song = new $tastypieResource('song',{limit:5});

```

- <h5>Retrieving objects</h5>
All the returned objects (from list_endpoint) have a paging control server-side.
```javascript

//all objects
$scope.Song.objects.$find();

//or with filters
$scope.Song.objects.$find({rank__lte:10});

//or with callback
$scope.Song.objects.$find({rank__lte:10}).then(
    function(result){
        console.log(result);
    },
    function(error){
        console.log(error);
    }
);

//or copying "$scope.Song.page"
var result = $scope.Song.objects.$find();

/*
Paging Control Server-Side

Attributes:
$scope.Song.endpoint;
$scope.Song.page.meta.previous;
$scope.Song.page.meta.next;
$scope.Song.page.meta.limit;        
$scope.Song.page.meta.offset;
$scope.Song.page.meta.total_count;  
$scope.Song.page.objects;           // objects list of current page
$scope.Song.page.index;             // current number page
$scope.Song.page.len;               // pages quantity
$scope.Song.page.range;             // numbers list of pages
        
Methods:
$scope.Song.page.change(index);
$scope.Song.page.next();
$scope.Song.page.previous();
$scope.Song.page.refresh();
$scope.Song.page.first();
$scope.Song.page.last();
*/
```

- <h5>Creating objects</h5>
```javascript
var song = $scope.Song.objects.$create();
song.rank = 1
song.song = "Sweet Emotion"
song.artist = "Aerosmith"
song.$save();

//or
$scope.Song.objects.$create({
    rank: 1,
    song: "Sweet Emotion",
    artist: "Aerosmith"
}).$save();

//or with callback
$scope.Song.objects.$create({
    rank: 1,
    song: "Sweet Emotion",
    artist: "Aerosmith"
}).$save().then(
    function(result){
        console.log(result);
    },
    function(error){
        console.log(error);
    }
);

/*
After save, your obj is updated. Example, now your obj has an "id".. wow!!
*/
```

- <h5>Updating objects</h5>
```javascript
//creating
var song = $scope.Song.objects.$create();
song.rank = 1
song.song = "Sweet Emotion"
song.artist = "Aerosmith"
song.$save();

//updating
song.rank = 2
song.$save()
```