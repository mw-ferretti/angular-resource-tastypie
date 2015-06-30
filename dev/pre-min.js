/**
 * @license Angular Resource Tastypie v1.0.0
 * (c) 2014-2015 Marcos William Ferretti, https://github.com/mw-ferretti/angular-resource-tastypie
 * License: MIT
 */

var ngResourceTastypie = {
    name: 'Angular Resource Tastypie',
    description: 'RESTful AngularJs client for Django-Tastypie or equivalent schema.',
    version: {
        full: '1.0.0', 
        major: 1, 
        minor: 0, 
        dot: 0, 
        codeName: 'Alpha'
    },
    author: {
        name: 'Marcos William Ferretti',
        email: 'ferretti.spo@gmail.com',
        github: 'https://github.com/mw-ferretti/',
        linkedin: 'https://www.linkedin.com/in/mwferretti'
    },
    license: 'MIT, (c) 2014-2015 Marcos William Ferretti',
    source: 'https://github.com/mw-ferretti/angular-resource-tastypie'
};

if(typeof angular == 'undefined')
    throw '[ngResourceTastypie v'.concat(ngResourceTastypie.version.full,'] Requires AngularJs 1.3+');

if(angular.version.major < 1 || (angular.version.major == 1 && angular.version.minor < 3))
    throw '[ngResourceTastypie v'.concat(ngResourceTastypie.version.full,'] Requires AngularJs 1.3+, your version is ', angular.version.full);

function TastypieConfig($resourceProvider){
    $resourceProvider.defaults.stripTrailingSlashes = false;
}

function TastypieProvider($httpProvider) {

    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $httpProvider.defaults.headers.common['Content-Type'] = 'application/json';

    var resource_url = '';
    var resource_domain = '';

    var auth = {
        username : '',
        api_key : ''
    };

    this.setResourceUrl = function(url){
        resource_url = url;

        var dominio  = document.createElement('a');
        dominio.href = resource_url;
        resource_domain = dominio.protocol.concat('//', dominio.hostname);
        if (dominio.port != '') resource_domain = resource_domain.concat(':', dominio.port);
    };

    this.setAuth = function(username, apikey){
        auth.username = username;
        auth.api_key = apikey;

        $httpProvider.defaults.headers.common['Authorization'] = 'ApiKey '.concat(auth.username, ':', auth.api_key);
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
    
    var working_list = [];
    Object.defineProperties(this, {
        "working": {
            "get": function(){
                return (working_list.length > 0);
            },
            "set": function(b){
                if(typeof(b) == 'undefined') b = false;
                if(b) working_list.push(1);
                else working_list.splice(-1,1);
            }
        }
    });
    
    this.$get = function(){
        return {
            resource_url:this.getResourceUrl(),
            resource_domain:this.getResourceDomain(),
            auth:this.getAuth(),
            working:this.working,
            setAuth:this.setAuth, 
            setResourceUrl:this.setResourceUrl
        }
    };
}

function TastypiePaginatorFactory($resource, $tastypie, $q){

    function $tastypiePaginator(tastypieResource, filters, result){

        this.resource = tastypieResource;
        this.filters = filters || {};
        this.meta = {};
        this.objects = [];
        this.index = 0;
        this.length = 0;
        this.range = [];

        setPage(this, result);
    }
    
    function promise_except_data_invalid(msg){
        var deferred = $q.defer();
        if (typeof(console) == "object") console.log(msg);
        deferred.reject({statusText:msg});
        return deferred.promise;
    }

    function setPage(self, result){
        if (!angular.isObject(result.meta)) throw '[$tastypiePaginator] Invalid django-tastypie object.';

        self.meta = result.meta;
      
        for (var x=0; x<result.objects.length; x++){
            result.objects[x] = self.resource.objects.$create(result.objects[x]);
        }

        self.objects = result.objects;
        self.length = Math.ceil(result.meta.total_count / result.meta.limit);

        if (result.meta.offset == 0) self.index = 1;
        else self.index = (Math.ceil(result.meta.offset / result.meta.limit)+1);
        
        var pgs = [];
        for (var i=1;i<=self.length;i++) {pgs.push(i);}
        self.range = pgs;
    }
    
    function getPage(self, end_url){
        if (end_url){
            self.resource.working = true;
            var promise = $resource(end_url).get().$promise.then(
                function(result){
                    setPage(self, result);
                    self.resource.working = false;
                    return self;
                },
                function(error){
                    error = error || {};
                    error.statusText = '[$tastypiePaginator][$get] '.concat(error.statusText || 'Server Not Responding.');
                    self.resource.working = false;
                    throw error;
                }
            );
            return promise;
        }else{
            var msg = '[$tastypiePaginator][$get] '.concat('Invalid url.');
            return promise_except_data_invalid(msg);
        }
    }

    function changePage(self, index, update){
        if((index == self.index) && (!update)){
            var msg = '[$tastypiePaginator][$get] '.concat('Index ', index, ' has already been loaded.');
            return promise_except_data_invalid(msg);
        }
        
        if ((index > 0) && (index <= self.length)){            
            self.resource.working = true;
            var filters = angular.copy(self.filters);
            filters.offset = ((index-1)*self.meta.limit);
            
            var promise = $resource(self.resource.endpoint, self.resource.defaults).get(filters).$promise.then(
                function(result){
                    if(result.meta.offset == result.meta.total_count)
                        changePage(self, (index - 1), true);
                    else{
                        setPage(self, result);
                        self.resource.working = false;
                        return self;
                    }
                },
                function(error){
                    error = error || {};
                    error.statusText = '[$tastypiePaginator][$get] '.concat(error.statusText || 'Server Not Responding.');
                    self.resource.working = false;
                    throw error;
                }
            );
            return promise;
        }else{            
            var msg = '[$tastypiePaginator][$get] '.concat('Index ', index, ' not exist.');
            return promise_except_data_invalid(msg);
        }
    }

    $tastypiePaginator.prototype.change = function(index){
        if (index) 
            return changePage(this,index,false);
        else{
            var msg = '[$tastypiePaginator][change] '.concat('Parameter "index" not informed.');
            return promise_except_data_invalid(msg);
        }
    };

    $tastypiePaginator.prototype.next = function(){
        if (this.meta.next) 
            return getPage(this, $tastypie.resource_domain.concat(this.meta.next));
        else{
            var msg = '[$tastypiePaginator][next] '.concat('Not exist next pages.');
            return promise_except_data_invalid(msg);
        }
    };

    $tastypiePaginator.prototype.previous = function(){
        if (this.meta.previous) 
            return getPage(this, $tastypie.resource_domain.concat(this.meta.previous));
        else{
            var msg = '[$tastypiePaginator][previous] '.concat('Not exist previous pages.');
            return promise_except_data_invalid(msg);
        }
    };

    $tastypiePaginator.prototype.refresh = function(){
        return changePage(this,this.index,true);
    };

    $tastypiePaginator.prototype.first = function(){
        return changePage(this,1,false);
    };

    $tastypiePaginator.prototype.last = function(){
        return changePage(this,this.length,false);
    };

    return $tastypiePaginator;
}

function TastypieObjectsFactory($resource, $tastypiePaginator, $q){

    function $tastypieObjects(tastypieResource){
        this.resource = tastypieResource;
    }
    
    function promise_except_data_invalid(msg){
        var deferred = $q.defer();
        if (typeof(console) == "object") console.log(msg);
        deferred.reject({statusText:msg});
        return deferred.promise;
    }
    
    function create(self, data){

        var custom_method = {
            'post':{method:'POST'},
            'save':{method:'POST'},
            'get':{method:'GET', url:self.resource.endpoint.concat(":id/")},
            'get_uri':{method:'GET', url:self.resource.endpoint.concat(":id/")},
            'update':{method:'PATCH', url:self.resource.endpoint.concat(":id/")},
            'put':{method:'PUT', url:self.resource.endpoint.concat(":id/")},
            'patch':{method:'PATCH', url:self.resource.endpoint.concat(":id/")},
            'delete':{method:'DELETE', url:self.resource.endpoint.concat(":id/")},
            'remove':{method:'DELETE', url:self.resource.endpoint.concat(":id/")}            
        };

        var obj = $resource(self.resource.endpoint, {id:'@id'}, custom_method);
        delete obj.prototype['$query'];
        
        obj.prototype.$get = function(data){         
            var fields = this;        
            angular.extend(fields, (data || {}));
            
            if(!fields.hasOwnProperty('id')){
                var msg = '[$tastypieObjects][$get] '.concat('Attribute [id] is required.');
                return promise_except_data_invalid(msg);
            }
            
            self.resource.working = true;
            var promise = fields.$get_uri().then(
                function(result){
                    self.resource.working = false;
                    return result;
                },
                function(error){
                    error = error || {};
                    error.statusText = '[$tastypieObjects][$get] '.concat(error.statusText || 'Server Not Responding.');
                    self.resource.working = false;
                    throw error;
                }
            );
            return promise;        
        };

        obj.prototype.$save = function(data){
            var fields = this;
            angular.extend(fields, (data || {}));
            var ws = fields.hasOwnProperty('id') ? fields.$put() : fields.$post();
            
            self.resource.working = true;
            var promise = ws.then(
                function(result){
                    self.resource.working = false;
                    if (typeof(self.resource.page.refresh) == typeof(Function))
                        self.resource.page.refresh();
                    return result;
                },
                function(error){
                    error = error || {};
                    error.statusText = '[$tastypieObjects][$save] '.concat(error.statusText || 'Server Not Responding.');
                    self.resource.working = false;
                    throw error;
                }
            );        
            return promise;
        };
        
        obj.prototype.$update = function(data){ 
            var fields = this;        
            angular.extend(fields, (data || {}));
            
            if(!fields.hasOwnProperty('id')){
                var msg = '[$tastypieObjects][$update] '.concat('Attribute [id] is required.');
                return promise_except_data_invalid(msg);
            }
            
            self.resource.working = true;
            var promise = fields.$patch().then(
                function(result){
                    self.resource.working = false;
                    if (typeof(self.resource.page.refresh) == typeof(Function))
                        self.resource.page.refresh();
                    return result;
                },
                function(error){
                    error = error || {};
                    error.statusText = '[$tastypieObjects][$update] '.concat(error.statusText || 'Server Not Responding.');
                    self.resource.working = false;
                    throw error;
                }
            );        
            return promise;
        };

        obj.prototype.$delete = function(data){
            var fields = this;
            angular.extend(fields, (data || {}));
            
            if(!fields.hasOwnProperty('id')){
                var msg = '[$tastypieObjects][$delete] '.concat('Attribute [id] is required.');
                return promise_except_data_invalid(msg);
            }
            
            self.resource.working = true;
            var promise = fields.$remove().then(
                function(result){
                    self.resource.working = false;
                    angular.forEach(fields, function(value, key){delete fields[key]});
                    if (typeof(self.resource.page.refresh) == typeof(Function))
                            self.resource.page.refresh();
                    return result;
                },
                function(error){
                    error = error || {};
                    error.statusText = '[$tastypieObjects][$delete] '.concat(error.statusText || 'Server Not Responding.');
                    self.resource.working = false;
                    throw error;
                }                                             
            );
            return promise;
        };
        
        obj.prototype.$clear = function(){
            var fields = this;
            angular.forEach(fields, function(value, key){delete fields[key]});
        };

        return new obj(data);
    };    
    
    function find(self){
         
        var obj = $resource(self.resource.endpoint, self.resource.defaults, {
            'get':{method:'GET'},
            'find':{method:'GET'}
        });
        
        obj.prototype.$find = function(filter){
            self.resource.working = true;
            var promise = this.$get(filter).then(
                function(result){
                    self.resource.working = false;
                    self.resource.page = new $tastypiePaginator(self.resource, filter, result);                    
                    return self.resource.page;
                },
                function(error){
                    error = error || {};
                    error.statusText = '[$tastypieObjects][$find] '.concat(error.statusText || 'Server Not Responding.');
                    self.resource.working = false;
                    throw error;
                }
            );
            return promise;
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
}

function TastypieResourceFactory($resource, $tastypie, $tastypiePaginator, $tastypieObjects){

        function $tastypieResource(service, default_filters) {

            if (!service) throw '[$tastypieResource] Unknown service name.';

            this.endpoint = $tastypie.resource_url.concat(service, '/');
            this.defaults = default_filters || {};
            this.page = {};
            this.objects = new $tastypieObjects(this);
            
            var working_list = [];
            Object.defineProperties(this, {
                "working": {
                    "get": function(){
                        return (working_list.length > 0);
                    },
                    "set": function(b){
                        if(typeof(b) == 'undefined') b = false;
                        if(b) working_list.push(1);
                        else working_list.splice(-1,1);
                        $tastypie.working = b;
                    }
                }
            });
        }

        return $tastypieResource;
}

var ResourceTastypieModule = angular.module('ngResourceTastypie', ['ngResource']);
ResourceTastypieModule.constant('ngResourceTastypie', ngResourceTastypie);

TastypieConfig.$inject = ['$resourceProvider'];
ResourceTastypieModule.config(TastypieConfig);

TastypieProvider.$inject = ['$httpProvider'];
ResourceTastypieModule.provider('$tastypie', TastypieProvider);

TastypiePaginatorFactory.$inject = ['$resource', '$tastypie', '$q'];
ResourceTastypieModule.factory('$tastypiePaginator', TastypiePaginatorFactory);

TastypieObjectsFactory.$inject = ['$resource', '$tastypiePaginator', '$q'];
ResourceTastypieModule.factory('$tastypieObjects', TastypieObjectsFactory);

TastypieResourceFactory.$inject = ['$resource', '$tastypie', '$tastypiePaginator', '$tastypieObjects'];
ResourceTastypieModule.factory('$tastypieResource', TastypieResourceFactory);