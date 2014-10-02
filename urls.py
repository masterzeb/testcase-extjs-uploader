from django.conf.urls.defaults import *
from django.conf import settings

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('', 
    (r'^loadfile','mm_helltest.serv.views.loadfile'),
    (r'^delfile?','mm_helltest.serv.views.delfile'),
)

if settings.DEBUG:
    urlpatterns += patterns('',
    (r'^media/(?P<path>.*)$', 'django.views.static.serve',{'document_root': settings.MEDIA_ROOT}),
    (r'^','mm_helltest.serv.views.mainview'),
    )
else:
    urlpatterns += patterns((r'^','mm_helltest.serv.views.mainview'),)
