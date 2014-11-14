from tastypie.authorization import DjangoAuthorization
from tastypie.authentication import ApiKeyAuthentication
from tastypie.resources import ModelResource
from myapp.models import Song


class SongResource(ModelResource):
    class Meta:
        queryset = Song.objects.all()
        resource_name = 'song'
        authentication = ApiKeyAuthentication()
        authorization = DjangoAuthorization()
        always_return_data = True
        
        filtering = {
            'id': ['exact'],
            'rank': ['exact', 'range', 'gt', 'gte', 'lt', 'lte'],
            'song': ['exact', 'icontains'],
            'artist': ['exact', 'icontains'],
        }