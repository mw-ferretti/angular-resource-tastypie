/**
 * @license AngularJs Resource Tastypie v1.0.0
 * (c) 2014 Marcos W. Ferretti LTDA ME, linkedin http://www.linkedin.com/pub/marcos-w-ferretti/32/928/a53
 * License: MIT
 */

function TastypieProvider($httpProvider) {

    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $httpProvider.defaults.headers.common['Content-Type'] = 'application/json';

    var resource_url = '';
    var resource_domain = '';

    var auth = {
        username : '',
        apikey : ''
    };

    this.setResourceUrl = function(url) {
        resource_url = url;

        var dominio  = document.createElement('a');
        dominio.href = resource_url;
        resource_domain = dominio.protocol + '//' + dominio.hostname;
        if (dominio.port != '') resource_domain = resource_domain+':'+dominio.port;
    };

    this.setAuth = function(username, apikey) {
        auth.username = username;
        auth.apikey = apikey;

        $httpProvider.defaults.headers.common['Authorization'] = 'ApiKey '+auth.username+':'+auth.apikey;
    };

    this.getResourceUrl = function() {
        return resource_url;
    };

    this.getResourceDomain = function() {
        return resource_domain;
    };

    this.$get = function() {
        return {
            resource_url:this.getResourceUrl(),
            resource_domain:this.getResourceDomain()
        }
    };
}


function TastypiePaginatorFactory($resource, $tastypie){

    function $tastypiePaginator(tastypieResource, filters, result){

        this.resource = tastypieResource;
        this.filters = filters || {};
        this.meta = {},
        this.objects = [],
        this.index = 0,
        this.len = 0,
        this.range = [];

        setPage(this,result);
    }

    function setPage(self, result){
        if (!angular.isObject(result.meta)) throw 'Invalid django-tastypie obj';

        self.meta = result.meta;

        angular.forEach(result.objects, function(value, key){
            result.objects[key] = self.resource.objects.$create(value);
        });

        self.objects = result.objects;
        self.len = Math.ceil(result.meta.total_count / result.meta.limit);

        if(result.meta.offset == 0) self.index = 1;
        else self.index = (Math.ceil(result.meta.offset / result.meta.limit)+1);
        
        var pgs = [];
        for (var i=1;i<=self.len;i++) {pgs.push(i);}
        self.range = pgs;
    }

    function getPage(self, end_url){
        if (end_url) {
            $resource(end_url).get().$promise.then(
                function(result){
                    setPage(self, result);
                },
                function(error) {
                    throw error;
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
                    throw error;
                }
            );
        }
    }

    $tastypiePaginator.prototype.change = function(index){
        if(index) changePage(this,index,false);
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
}

function TastypieObjectsFactory($resource, $tastypiePaginator){

    function $tastypieObjects(tastypieResource){
        this.resource = tastypieResource;
    }

    $tastypieObjects.prototype.$create = function(data){

        var self = this;

        var custom_method = {
            'save':{method:'POST'},
            'update':{method:'PUT', url:self.resource.endpoint+":id%2f"},
            'delete':{method:'DELETE', url:self.resource.endpoint+":id%2f"},
            'rm':{method:'DELETE', url:self.resource.endpoint+":id%2f"},
            'sv':{method:'POST'}
        };

        var obj = $resource(self.resource.endpoint, {id:'@id'}, custom_method);

        delete obj.prototype['$get'];
        delete obj.prototype['$query'];
        delete obj.prototype['$remove'];

        obj.prototype.$save = function(){            
            var resp = this.$sv();            
            resp.then(
                function(result){
                    self.resource.page.refresh();
                }           
            );                
            return resp;
        };

        obj.prototype.$delete = function(){
            var fields = this;
            return this.$rm().then(function(){
                angular.forEach(fields, function(value, key){delete fields[key]});
                self.resource.page.refresh();
            });
        };
        
        obj.prototype.$clear = function(){
            var fields = this;
            angular.forEach(fields, function(value, key){delete fields[key]});
        }

        return new obj(data);
    };

    $tastypieObjects.prototype.$find = function(filters){

        var self = this,
            obj = $resource(self.resource.endpoint, self.resource.defaults, {
                'find': {method:'GET'},
                'get': {method:'GET'}
            });

        delete obj.prototype['$query'];
        delete obj.prototype['$save'];

        obj.prototype.$find = function(data){

            var resp = this.$get(data),
                find = this;

            resp.then(
                function(result){
                    self.resource.page = new $tastypiePaginator(self.resource, data, result);
                    find.page = self.resource.page;
                    delete find['meta'];
                    delete find['objects'];
                },
                function(error){
                    self.resource.page = {};
                    find.page = {};
                }
            );

            return resp;
        };

        var res = new obj();

        return res.$find(filters);
    };

    return $tastypieObjects;
}

function TastypieResourceFactory($resource,$tastypie,$tastypiePaginator,$tastypieObjects){

        function $tastypieResource(service, default_filters) {

            if (!service) throw 'unknown service name';

            this.endpoint = $tastypie.resource_url+service+'%2f';
            this.defaults = default_filters || {};
            this.page = {};
            this.objects = new $tastypieObjects(this);
        }

        return $tastypieResource;
}

var ResourceTastypieModule = angular.module('ngResourceTastypie',['ngResource']);

TastypieProvider.$inject = ['$httpProvider'];
ResourceTastypieModule.provider('$tastypie', TastypieProvider);

TastypiePaginatorFactory.$inject = ['$resource', '$tastypie'];
ResourceTastypieModule.factory('$tastypiePaginator', TastypiePaginatorFactory);

TastypieObjectsFactory.$inject = ['$resource','$tastypiePaginator'];
ResourceTastypieModule.factory('$tastypieObjects', TastypieObjectsFactory);

TastypieResourceFactory.$inject = ['$resource','$tastypie','$tastypiePaginator','$tastypieObjects'];
ResourceTastypieModule.factory('$tastypieResource', TastypieResourceFactory);