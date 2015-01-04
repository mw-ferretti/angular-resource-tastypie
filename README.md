#angular-resource-tastypie
[RESTful](http://www.ibm.com/developerworks/library/ws-restful/) AngularJs client for [Django-Tastypie](https://django-tastypie.readthedocs.org/en/latest/) or equivalent schema.

<h5>Features:</h5>
1. Paging system
2. Complete CRUD
3. Abstract AJAX(J) providing operation similar to the [Django Model API](https://docs.djangoproject.com/en/dev/topics/db/queries/)

##Context
[RESTful](http://www.ibm.com/developerworks/library/ws-restful/) architecture with [angularjs](https://angularjs.org/) and [django](https://www.djangoproject.com/).
![Architecture](/dev/arq_rest_angular_django.jpg)

<h5>IMPORTANT:</h5>
- Backend controllers: Security rules for data persistence and access.
- Frontend controllers: User Interface rules, only!

##Requirements
- Frontend: [AngularJs](https://angularjs.org/)
- Backend:  [Django-Tastypie](https://django-tastypie.readthedocs.org/en/latest/) or equivalent schema.

##Usage
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

- <h5>Add the module dependency:</h5>
```javascript
angular.module('myApp', ['ngResourceTastypie'])
```

- <h5>Add your web services provider configuration:</h5>
```javascript
.config(function($tastypieProvider){
    $tastypieProvider.setResourceUrl('http://127.0.0.1:8001/api/v1/');
    $tastypieProvider.setAuth('admin','320c4e7da6ed93946f97f51e6f4c8354a098bb6e');
})
```

- <h5>Add dependency in the scope:</h5>
```javascript
.controller('MyCtrl', ['$scope', '$tastypieResource', function($scope, $tastypieResource){
    ...
}]);
```

<h5>IMPORTANT:</h5>
```javascript
$tastypieProvider.setAuth('username','api_key');
```
<blockquote>
<p>
This api_key was fixed only for demonstration. 
You must generate a dynamic key during the login user, 
in its authorization system, and then configure this attribute. 
With django-tastypie this task is quite simple: 
http://django-tastypie.readthedocs.org/en/latest/authentication.html
</p>
</blockquote>

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

//or from resource_uri
//In this case, there is no paging. An "$tastypieObjects" (has CRUD) is returned.
$scope.Song.objects.$get({id:100}).then(
    function(result){
        console.log(result);
    },
    function(error){
        console.log(error);
    }
);
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

//or from get
//An "$tastypieObjects" (has CRUD) is returned.
$scope.Song.objects.$get({id:100}).then(
    function(result){
        result.rank += 1;
        result.$save();
    }
);

//or from resource_uri
$scope.Song.objects.$update({
    id:100,
    song:'Sweet Emotion ...'
});

//or from resource_uri with callback
$scope.Song.objects.$update({
    id:100,
    song:'Sweet Emotion'
}).then(
    function(result){
        console.log(result);
    },
    function(error){
        console.log(error);
    }
);
```

- <h5>Deleting objects</h5>
```javascript
//creating
var song = $scope.Song.objects.$create();
song.rank = 1
song.song = "Sweet Emotion"
song.artist = "Aerosmith"
song.$save();

//deleting
song.$delete()

//or from resource_uri
$scope.Song.objects.$delete({id:100});

```

##Class Diagram
![Class Diagram](/dev/ClassDiagram.png)