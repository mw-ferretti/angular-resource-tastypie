#Angular Resource Tastypie
[RESTful](http://www.ibm.com/developerworks/library/ws-restful/) AngularJs client for [Django-Tastypie](https://django-tastypie.readthedocs.org/en/latest/) or equivalent schema.

<h5>Features:</h5>
1. Pagination
2. Complete CRUD
3. Abstract AJAX(J) providing operations which are similar to the [Django Model API](https://docs.djangoproject.com/en/dev/topics/db/queries/)

##Context
[RESTful](http://www.ibm.com/developerworks/library/ws-restful/) architecture with [AngularJs](https://angularjs.org/) and [Django](https://www.djangoproject.com/).
![Architecture](/dev/arq_rest_angular_django.jpg)

<h5>IMPORTANT:</h5>
- Backend: Security rules for data persistence and access.
- Frontend: [Usability](https://en.wikipedia.org/wiki/Usability) rules, only!

<h5>BENEFITS:</h5>
- Asynchronous development between frontend and backend developers.
- Reuse of web developers team to create mobile applications.
- The frontend is isolated, we can distribute it as an application by using [Apache Cordova](https://cordova.apache.org/).
- Independent layers between business rules and usability rules of user interface. 
- Business rules are the same for different types of [UI](https://en.wikipedia.org/wiki/User_interface). We can create different [UIs](https://en.wikipedia.org/wiki/User_interface) with any other programming language, passing through the same business rules on the backend.
- And more ...

##Requirements
- Frontend: [AngularJs 1.3+](https://angularjs.org/) 
- Backend:  [Django-Tastypie](https://django-tastypie.readthedocs.org/en/latest/) or equivalent schema.

<h5>Note</h5>
Requirements for the backend:
- [django-cors-headers](https://github.com/ottoyiu/django-cors-headers)
- [always_return_data](http://django-tastypie.readthedocs.org/en/latest/resources.html#always-return-data)

[See how to use.](https://github.com/mw-ferretti/angular-resource-tastypie/tree/master/examples)

##Install
- Manual: download [source](https://github.com/mw-ferretti/angular-resource-tastypie/tree/master/src) - [See how to use.](https://github.com/mw-ferretti/angular-resource-tastypie/tree/master/examples/frontend/simple_app)
- Bower: "bower install angular-resource-tastypie" - [See how to use.](https://github.com/mw-ferretti/angular-resource-tastypie/tree/master/examples/frontend/usability_app)

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
This api_key was fixed only for demo purposes.<br>
You must generate a dynamic api_key after the user login, on backend authorization system, and then configure this attribute.<br>
With django-tastypie this task is quite simple:<br>
http://django-tastypie.readthedocs.org/en/latest/authentication.html
</p>
</blockquote>

```javascript
//Access $tastypieProvider in the controller
//Login sample:
.controller('LoginCtrl', ['$scope', '$tastypie', '$http', function($scope, $tastypie, $http){
    $scope.login = function(){
        var data = {
            userName: $scope.userName,
            password: $scope.password
        }
        $http.post('/loginUrl', data).success(response){
            $tastypie.setAuth(response.username, response.api_key);
        }
    }
}]);
```

##Making queries
The $tastypieResource class is held responsible for connecting on the specific "list endpoint".

<h5>Consider the following example:</h5>
We have a service called "song", which is responsible for providing the "TOP 100 SONGS CLASSIC ROCK":
```
http://127.0.0.1:8001/api/v1/song/
```
Then:
```javascript
$scope.Song = new $tastypieResource('song');

//or with default filters
$scope.Song = new $tastypieResource('song',{limit:5});

```

- <h5>Creating objects</h5>
The "$create()" method will return a "$tastypieObjects" object.<br>
The $tastypieObjects class is held responsible for providing the "(C)reate, (R)ead, (U)pdate, (D)elete" methods.

```javascript
$scope.song = $scope.Song.objects.$create();
$scope.song.rank = 1
$scope.song.song = "Sweet Emotion"
$scope.song.artist = "Aerosmith"
$scope.song.$save();
```

```javascript
//or
$scope.Song.objects.$create({
    rank: 1,
    song: "Sweet Emotion",
    artist: "Aerosmith"
}).$save();
```

```javascript
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
```

<blockquote>
<p>
After saving, your obj will be updated. For example, your obj now has an "id".. wow!!
</p>
</blockquote>


- <h5>Updating objects</h5>

```javascript
$scope.Song.objects.$update({
    id:100,
    song:'Sweet Emotion ...'
});
```

```javascript
//or with callback
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

```javascript
//or from get
$scope.Song.objects.$get({id:100}).then(
    function(result){
        result.rank += 1;
        result.$save();
    }
);
```

```javascript
//or from local object 
//creating
var song = $scope.Song.objects.$create();
song.rank = 1;
song.song = "Sweet Emotion";
song.artist = "Aerosmith";
song.$save();

//updating
song.rank = 2
song.$save();
```


- <h5>Deleting objects</h5>

```javascript
$scope.Song.objects.$delete({id:100});
```

```javascript
//or with callback
$scope.Song.objects.$delete({id:100}).then(
    function(result){
        console.log(result);
    },
    function(error){
        console.log(error);
    }
);
```

```javascript
//or from local object 
//creating
var song = $scope.Song.objects.$create();
song.rank = 1
song.song = "Sweet Emotion"
song.artist = "Aerosmith"
song.$save();

//deleting
song.$delete()
```

- <h5>Retrieving objects</h5>
The "$find()" method will return a "$tastypiePaginator" object.<br>
The $tastypiePaginator class is responsible for providing the "pagination control" methods, and the objects list.

```javascript
//all objects
$scope.Song.objects.$find();
```

```javascript
//or with filters
$scope.Song.objects.$find({rank__lte:10});
```

```javascript
//or with callback
$scope.Song.objects.$find({rank__lte:10}).then(
    function(result){
        console.log(result); //The "result" is a "$tastypiePaginator" object.
    },
    function(error){
        console.log(error);
    }
);
```
<blockquote>
<h5>NOTE</h5>
<p>
1. After running the "$find" method for the first time, you have inside your instance "$tastypieResource" ($scope.Song), a "$tastypiePaginator" object ($scope.Song.page).
</p>
<p>
2. For each item of "$scope.Song.page.objects" you retrieve a "$tastypieObjects" object. ;)
</p>
</blockquote>

```javascript
//All page attributes:
$scope.Song.page.meta.previous;     // URL of previous page
$scope.Song.page.meta.next;         // URL of next page
$scope.Song.page.meta.limit;        // Limit of records by page
$scope.Song.page.meta.offset;       // Current displacement records
$scope.Song.page.meta.total_count;  // Total count of found records.
$scope.Song.page.objects;           // Objects ($tastypieObjects) list of current page
$scope.Song.page.index;             // Current number page
$scope.Song.page.length;            // Pages quantity
$scope.Song.page.range;             // Numbers list of pages
        
//All page methods:
$scope.Song.page.change(index);
$scope.Song.page.next();
$scope.Song.page.previous();
$scope.Song.page.refresh();
$scope.Song.page.first();
$scope.Song.page.last();

//All methods has promise. EX:
$scope.Song.page.next().then(
    function(result){
        console.log(result); //The "result" is a "$tastypiePaginator" object.
    },
    function(error){
        console.log(error);
    }
);
```

```javascript
//get object from resource_uri
//In this case, there is no paging. An "$tastypieObjects" is returned.
$scope.Song.objects.$get({id:100}).then(
    function(result){
        console.log(result);
    },
    function(error){
        console.log(error);
    }
);
```

##Working status
1. $tastypie.working: Global requests (return true or false)
2. YourService.working: Individual service requests (return true or false) 

Informe the request status for user. EX:

```javascript
.controller('ProjectCtrl', ['$scope', '$tastypie', '$tastypieResource', function($scope, $tastypie, $tastypieResource){
    $scope.Api = $tastypie;
    $scope.Song = new $tastypieResource('song', {limit:4});
}])
```

```html
<span ng-show="Api.working"> >>> Api working ...</span>
<span ng-show="Song.working"> >>> Service Song working ...</span>
```
[See how to use.](https://github.com/mw-ferretti/angular-resource-tastypie/tree/master/examples)

##Class Diagram
![Class Diagram](/dev/ClassDiagram.png)

##Contribute
<h5>If you found it useful, please consider paying me a coffee ;)</h5>
[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RGQ8NSYPA59FL)

##License
angular-resource-tastypie is released under the [MIT License](https://github.com/mw-ferretti/angular-resource-tastypie/blob/master/LICENSE).