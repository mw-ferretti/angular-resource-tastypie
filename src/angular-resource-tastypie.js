/**
 * @license Angular Resource Tastypie v1.0.0
 * (c) 2014 Marcos W. Ferretti, http://br.linkedin.com/in/mwferretti/
 * License: MIT
 */
angular.module('ngResourceTastypie',['ngResource'])

.provider('$tastypie', function($httpProvider){

    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $httpProvider.defaults.headers.common['Content-Type'] = 'application/json';

    var resource_url = '';
    var resource_domain = '';

    var auth = {
        username : '',
        api_key : ''
    };
    
    var routes_exception = {};    

    this.setResourceUrl = function(url){
        resource_url = url;

        var dominio  = document.createElement('a');
        dominio.href = resource_url;
        resource_domain = dominio.protocol + '//' + dominio.hostname;
        if (dominio.port != '') resource_domain = resource_domain+':'+dominio.port;
    };

    this.setAuth = function(username, apikey){
        auth.username = username;
        auth.api_key = apikey;

        $httpProvider.defaults.headers.common['Authorization'] = 'ApiKey '+auth.username+':'+auth.api_key;
    };
    
    this.getRoutesException = function(){
        return routes_exception;
    };
    
    this.setRoutesException = function(data){
        if(!data) throw '[$tastypie] Arg0 [data] is required.';
        if(!angular.isObject(data)) throw '[$tastypie] Arg0 [data] is not object.';
        routes_exception = data;
    };
    
    this.getAuth = function(){
        return auth;
    };

    this.getResourceUrl = function(){
        return resource_url;
    };

    this.getResourceDomain = function(){
        return resource_domain;
    };

    this.$get = function(){
        return {
            resource_url:this.getResourceUrl(),
            resource_domain:this.getResourceDomain(),
            auth:this.getAuth(),
            routes_exception:this.getRoutesException(),
            setAuth:this.setAuth, 
            setResourceUrl:this.setResourceUrl,
            setRoutesException:this.setRoutesException
        }
    };
})

.service('$RouteException', ['$location', '$tastypie', function($location, $tastypie){
    var routes = {};
    
    this.redirect = function(httpCode){
        routes = $tastypie.routes_exception;
        if(!routes.hasOwnProperty(String(httpCode))) return false;
        $location.path(routes[String(httpCode)]);
        return true;
    }
}])

.factory('$tastypiePaginator', ['$resource', '$tastypie', '$RouteException', function($resource, $tastypie, $RouteException){

    function $tastypiePaginator(tastypieResource, filters, result){

        this.resource = tastypieResource;
        this.filters = filters || {};
        this.meta = {};
        this.objects = [];
        this.index = 0;
        this.len = 0;
        this.range = [];

        setPage(this, result);
    }

    function setPage(self, result){
        if (!angular.isObject(result.meta)) throw '[$tastypiePaginator] Invalid django-tastypie object.';

        self.meta = result.meta;

        angular.forEach(result.objects, function(value, key){
            result.objects[key] = self.resource.objects.$create(value);
        });

        self.objects = result.objects;
        self.len = Math.ceil(result.meta.total_count / result.meta.limit);

        if (result.meta.offset == 0) self.index = 1;
        else self.index = (Math.ceil(result.meta.offset / result.meta.limit)+1);
        
        var pgs = [];
        for (var i=1;i<=self.len;i++) {pgs.push(i);}
        self.range = pgs;
    }

    function getPage(self, end_url){
        if (end_url){
            $resource(end_url).get().$promise.then(
                function(result){
                    setPage(self, result);
                },
                function(error) {
                    if(!$RouteException.redirect(error.status))
                        throw '[$tastypiePaginator] '.concat(error.statusText);
                }
            );
        }
    }

    function changePage(self, index, update){
        if (((index != self.index) || (update)) && (index > 0) && (index <= self.len)) {

            var filters = angular.copy(self.filters);
            filters.offset = ((index-1)*self.meta.limit);
            
            $resource(self.resource.endpoint, self.resource.defaults).get(filters).$promise.then(
                function(result){                    
                    if(result.meta.offset == result.meta.total_count)
                        changePage(self, (index - 1), true);
                    else
                        setPage(self, result);
                },
                function(error){
                    if(!$RouteException.redirect(error.status))
                        throw '[$tastypiePaginator] '.concat(error.statusText);
                }
            );
        }
    }

    $tastypiePaginator.prototype.change = function(index){
        if (index) changePage(this,index,false);
    };

    $tastypiePaginator.prototype.next = function(){
        if (this.meta.next) getPage(this, $tastypie.resource_domain+this.meta.next);
    };

    $tastypiePaginator.prototype.previous = function(){
        if (this.meta.previous) getPage(this, $tastypie.resource_domain+this.meta.previous);
    };

    $tastypiePaginator.prototype.refresh = function(){
        changePage(this,this.index,true);
    };

    $tastypiePaginator.prototype.first = function(){
        changePage(this,1,false);
    };

    $tastypiePaginator.prototype.last = function(){
        changePage(this,this.len,false);
    };

    return $tastypiePaginator;
}])


.factory('$tastypieObjects', ['$resource', '$tastypiePaginator', '$RouteException', function($resource, $tastypiePaginator, $RouteException){

    function $tastypieObjects(tastypieResource){
        this.resource = tastypieResource;
    }
    
    function create(self, data){

        var custom_method = {
            'post':{method:'POST'},
            'save':{method:'POST'},
            'get':{method:'GET', url:self.resource.endpoint+":id%2f"},
            'get_uri':{method:'GET', url:self.resource.endpoint+":id%2f"},
            'update':{method:'PATCH', url:self.resource.endpoint+":id%2f"},
            'put':{method:'PUT', url:self.resource.endpoint+":id%2f"},
            'patch':{method:'PATCH', url:self.resource.endpoint+":id%2f"},
            'delete':{method:'DELETE', url:self.resource.endpoint+":id%2f"},
            'remove':{method:'DELETE', url:self.resource.endpoint+":id%2f"}            
        };

        var obj = $resource(self.resource.endpoint, {id:'@id'}, custom_method);

        delete obj.prototype['$query'];
        
        obj.prototype.$get = function(data){            
            var filter = data || this;            
            if(!filter.hasOwnProperty('id')) throw '[$tastypieObjects] Attribute [id] is required.';
            var resp = this.$get_uri(filter);
            
            resp.then(
                null,
                function(error){
                    if(!$RouteException.redirect(error.status))
                        throw '[$tastypieObjects] '.concat(error.statusText);
                }
            );
            return resp;        
        };

        obj.prototype.$save = function(){
            var fields = this;
            var resp = null;
            
            if(fields.hasOwnProperty('id')){
                resp = this.$put();
            }else{
                resp = this.$post();
            }           
            resp.then(
                function(result){
                    if (typeof(self.resource.page.refresh) == typeof(Function))
                        self.resource.page.refresh();
                },
                function(error){
                    if(!$RouteException.redirect(error.status))
                        throw '[$tastypieObjects] '.concat(error.statusText);
                }
            );        
            return resp;
        };
        
        obj.prototype.$update = function(data){            
            var obj = data || this;            
            if(!obj.hasOwnProperty('id')) throw '[$tastypieObjects] Attribute [id] is required.';
            
            var resp = null;
            resp = this.$patch(obj);
            
            resp.then(
                function(result){
                    if (typeof(self.resource.page.refresh) == typeof(Function))
                        self.resource.page.refresh();
                },
                function(error){
                    if(!$RouteException.redirect(error.status))
                        throw '[$tastypieObjects] '.concat(error.statusText);
                }
            );        
            return resp;
        };

        obj.prototype.$delete = function(data){
            var obj = data || this;
            var fields = this;
            if(!obj.hasOwnProperty('id')) throw '[$tastypieObjects] Attribute [id] is required.';
            var resp = this.$remove(obj).then(
                function(){
                    angular.forEach(fields, function(value, key){delete fields[key]});
                    if (typeof(self.resource.page.refresh) == typeof(Function))
                            self.resource.page.refresh();
                },
                function(error){
                    if(!$RouteException.redirect(error.status))
                        throw '[$tastypieObjects] '.concat(error.statusText);
                }                                             
            );
            return resp;
        };
        
        obj.prototype.$clear = function(){
            var fields = this;
            angular.forEach(fields, function(value, key){delete fields[key]});
        };

        return new obj(data);
    };    
    
    function find(self){
            
        var custom_method = {
            'get':{method:'GET'},
            'find':{method:'GET'}
        };
        
        var obj = $resource(self.resource.endpoint, self.resource.defaults, custom_method);        
        delete obj.prototype['$query'];
        delete obj.prototype['$save'];
        
        obj.prototype.$find = function(filter){
            
            var resp = this.$get(filter),
                self_resp = this;

            resp.then(
                function(result){
                    self.resource.page = new $tastypiePaginator(self.resource, filter, result);
                    self_resp.page = self.resource.page;                    
                    delete self_resp['meta'];
                    delete self_resp['objects'];
                },
                function(error){
                    self.resource.page = {};
                    self_resp.page = {};
                    if(!$RouteException.redirect(error.status))
                        throw '[$tastypieObjects] '.concat(error.statusText);
                }
            );

            return resp;
        };
        
        return new obj();   
    }
    
    $tastypieObjects.prototype.$create = function(data){
        return create(this, data);
    };
    
    $tastypieObjects.prototype.$get = function(data){
        return create(this, data).$get();
    };
    
    $tastypieObjects.prototype.$delete = function(data){
        return create(this, data).$delete();
    };
    
    $tastypieObjects.prototype.$find = function(data){
        return find(this).$find(data);
    };
    
    $tastypieObjects.prototype.$update = function(data){
        return create(this, data).$update();
    };

    return $tastypieObjects;
}])


.factory('$tastypieResource', ['$resource', '$tastypie', '$tastypiePaginator', '$tastypieObjects', function($resource, $tastypie, $tastypiePaginator, $tastypieObjects){

        function $tastypieResource(service, default_filters) {

            if (!service) throw '[$tastypieResource] Unknown service name.';

            this.endpoint = $tastypie.resource_url+service+'%2f';
            this.defaults = default_filters || {};
            this.page = {};
            this.objects = new $tastypieObjects(this);
        }

        return $tastypieResource;
}]);
