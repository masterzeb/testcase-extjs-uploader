import os
from django.shortcuts import render_to_response as rtr
from django.core import serializers
from django.conf import settings
from django.http import HttpResponse
from django.utils import simplejson as json
from mm_helltest.serv import models
from django.utils.html import escape


def mainview(request):
    return rtr('index.html',{'msg':'myalert'})


def loadfile(request):
    result = ''
    url = ''
    id = 0
    success = True
    template = 'done.html'
    json_data = {}
    if request.method == 'POST':
        path = os.path.join(settings.MEDIA_ROOT, 'files/').replace('\\','/') 
        if not os.path.isdir(path):
            try:
                os.makedirs(path)
            except:
                data = json.dumps({'result':u'error! Can not create a folder to upload files!','success':False})
                return HttpResponse(data, mimetype='text/html')
        for file in request.FILES:
            filename = request.POST['fname']
            try:
                destination = open(path + filename, 'wb+')
                url = os.path.join(settings.MEDIA_URL, 'files/').replace('\\','/')
                for chunk in request.FILES[file].chunks():
                    destination.write(chunk)
    		    destination.close()
                result = u' upload successfully'
                if (len(models.Files.objects.filter(path = path + filename))>0):
                    models.Files.objects.filter(path = path + filename).delete()
                    result = u' overwritten successfully'                   
                dbFile = models.Files()
                dbFile.path = path + filename
                dbFile.url = url
                dbFile.save()
                id = models.Files.objects.get(path = path + filename).id
            except Exception as e:
                result = (u'error! Can not upload file: %s' % e)
                success = False
    data = json.dumps({'result':result,'url':url, 'id':id, 'filename': escape(filename), 'success': success})
    return HttpResponse (data, mimetype='text/html')


def delfile(request):
    try:
        id = request.GET['id']
        path = models.Files.objects.get(id = id).path
        if os.path.exists(path):
            os.remove(path)
        filename = path.replace(settings.MEDIA_ROOT, '').replace('/files/', '')
        models.Files.objects.get(id = id).delete()
        data = json.dumps({'filename':filename})
        return HttpResponse(data, mimetype='application/javascript')
    except Exception as e:
        print e
