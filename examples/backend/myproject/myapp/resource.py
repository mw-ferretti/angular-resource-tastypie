from tastypie.authorization import Authorization
from tastypie.resources import ModelResource
from myapp.models import Song


class SongResource(ModelResource):
    class Meta:
        queryset = Song.objects.all()
        resource_name = 'song'
        authorization= Authorization()
        always_return_data = True