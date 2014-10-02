var fp;
var curItem = 1;

function showResult(result){
with (parent){
	if (!Ext.get('resultMsg')){
			var resultLabel = new Ext.form.Label({
				id: 'resultMsg',
				text: result
			});
			fp.items.insert(curItem, resultLabel);
			fp.doLayout();
			}
	fp.items.get('resultMsg').update(result);
	}	
}

function initPage(){
	Ext.onReady(function(){
		fp = new Ext.FormPanel({
			renderTo: 'loadForm',
			id: 'form',
			autoHeight: true,
			width: 500,
			bodyStyle: 'padding: 10px 10px 0 10px;',
			labelWidth: 50,
			frame: true,
			defaults: {
				anchor: '100%'
			},
			title: 'File upload form',
			url: '/loadfile',
			method: 'POST',
			//target: 'upload_frame',
			fileUpload : true,
			items: [{
				xtype: 'label',
				id: 'label1'
				}, {
				xtype: 'fileuploadfield',
				id: 'uploadBtn',
				buttonOnly: true,
				buttonText: 'Добавить файл',
				listeners: {
					fileselected: function(fb, v) {
						if (v){
							var fname = v.replace(/\\/g,'/').split('/');
							if ((Ext.isOpera) || (Ext.isChrome)){
								fname = fname[2];
								}
							var fid = encodeURIComponent(fname);
							// если такой файл уже загружен - удаляем информацию о нем
							if (fp.items.get(fid+'_label')){
								fp.remove(fid+'_label',true);
								fp.remove(fid+'_id',true);
								curItem = curItem - 2;
								fp.doLayout();
								}
							var fileLabel = new Ext.form.Label({
								id: fid + '_label'
							});
							// скрытое поле, в которое помещается id
							var hiddenId = new Ext.form.Hidden({
							id: fid +'_id'
							});
							}
						fp.items.insert(curItem, fileLabel);
						fp.items.insert(curItem+1, hiddenId);
						curItem = curItem + 2;
						fp.doLayout();
						fp.items.get(fid + '_label').update(Ext.util.Format.htmlEncode(fname) + ' <img src="media/img/loader.gif"></img><br />');
						fp.items.get('label1').update('<b>Uploading. Please wait ... <br /></b>');
						fp.items.get('hiddenId').setValue(fname);
						fp.getForm().submit({
							success: function(fp, o){
								console.log(o);
								var data = Ext.util.JSON.decode(o.response.responseText);
								onLoadComplete(Ext.util.Format.htmlDecode(data.filename), data.result, data.url, data.id, data.success); 
							},
							failure: function(fp, o) {
								console.log(o);
								var data = Ext.util.JSON.decode(o.response.responseText);
								var result = '<br /><br /><b>Result:</b> ' + data.result;
								fp.remove(curItem-1,true);
								fp.remove(curItem-2,true);
								curItem = curItem - 2;
								if (curItem === 1){
									fp.items.get('label1').update('<b>Uploaded files: </b> no<br />');
								}
								fp.doLayout();
                                showResult(result);
							}
                        });
                    }
                }
				},{
				xtype: 'hidden',
				name: 'fname',
				id: 'hiddenId',
				value: '1'
				}]
        });
		fp.items.get('label1').update('<b>Uploaded files:</b> no<br />');
	});
}

function deleteFile(fileId){
	var result;
	parent.fp.items.get('label1').update('<b>Deleting in process. Please wait .. </b><br />');
	with (parent){
		Ext.Ajax.request({
			url: '/delfile?id='+fileId,
			success: function(response, options){
				var answer = Ext.util.JSON.decode(response.responseText);
				var fileName = answer.filename;
				var fid = encodeURIComponent(fileName);
				result = '<br /><br /><b>Result</b>: file <b>' + Ext.util.Format.htmlEncode(fileName) + '</b> deleted successfully';
                fp.items.get('resultMsg').update(result);
				fp.remove(fid +'_label',true);	
				fp.remove(fid +'_id',true);
				fp.doLayout();
				curItem = curItem - 2;
				if (curItem === 1){
					fp.items.get('label1').update('<b>Uploaded files: </b> no<br />');
					}
				else{
					fp.items.get('label1').update('<b>Uploaded files: </b><br />');
					}
				},
			failure: function(){
				result = '<br /><br /><b>Result</b>: error! Can not delete this file! <b>' + fileName + '</b>';
				fp.items.get('resultMsg').update(result);
				fp.items.get('label1').update('<b>Uploaded files: </b><br />');
				}
			});
		}
}

function onLoadComplete(fileName, fileResult, fileUrl, fileId, fileError){
	var result;
	var fid;
	with (parent){
		Ext.onReady(function(){
			fid = encodeURIComponent(fileName);
			fileUrl += encodeURIComponent(fileName);
			result = '<br /><br /><b>Result</b>: file <b>' + Ext.util.Format.htmlEncode(fileName) + '</b>' + fileResult;
			showResult(result);
			fp.items.get('label1').update('<b>Uploaded files: </b><br />');
			// заменяем крутилку на крестик, по нажатию на который вызывается скрипт для удаления
			fp.items.get(fid + '_label').update('<a href=' + fileUrl + '>' + Ext.util.Format.htmlEncode(fileName) + '</a>' + ' <img src="media/img/cross.png" onclick="deleteFile('+ fileId +')" style="cursor: pointer;"></img><br />');
			fp.items.get(fid + '_id').setValue(fileId);
			fp.getForm().reset();
		});
	}
}
