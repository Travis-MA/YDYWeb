
const fs = require('fs');


var ObsClient;
try{
	ObsClient = require('esdk-obs-nodejs');
}catch(e){
	try{
		ObsClient = require('/OBSlib/obs');
	}catch(e){
		ObsClient = require('./OBSlib/obs');//sample env
	}
}

var obs = new ObsClient({
	access_key_id: 'C6YFHVZERH6SNUS3T8RX',
	secret_access_key: 'g6yPZO5O4EsfgJFbYNwxp3DZ7wmGg5pSSIYtLSLe',
	server : 'https://obs.cn-north-4.myhuaweicloud.com'
});


const bucketName = 'obs-ydy1';




function OBSFolderObj(bucketPrefix,para,fun){

	obs.listObjects({
		Bucket: bucketName,
		Prefix: bucketPrefix
	}).then((result) => {
		if(result.CommonMsg.Status < 300){
			//console.log('[2][OBSObj]--List all objects in folder:'+bucketPrefix);
			fun(result.InterfaceResult.Contents,bucketPrefix,para);

		}
	});
}

function newFolder(prefix){
	obs.putObject({
		Bucket : bucketName,
		Key : prefix
	}).then((result) => {
		if(result.CommonMsg.Status < 300){
			//console.log('[3++][NEWFolder]--Create an empty folder:' + prefix + ', finished!\n');
			/*
			 * Verify whether the size of the empty folder is zero 
			 */
			return obs.getObjectMetadata({
				Bucket : bucketName,
				Key : prefix
			});
		}
	}).then((result) => {
		if(result && result.CommonMsg.Status < 300){
			//console.log('Size of the empty folder ' + prefix + ' is ' + result.InterfaceResult.ContentLength);
		}
	});
}

function deleteObj(prefix){
	obs.deleteObject({
		Bucket: bucketName,
		Key : prefix
	}, (err, result) => {
			if(err){
				console.log('[OBS delete object]Error-->' + err);
			}else{
				console.log('[OBS delete object]Status-->' + result.CommonMsg.Status);
			}
	});
}

function getStr(prefix,para,fun){
	obs.getObject({ 
		Bucket : bucketName, 
		Key : prefix
	}, (err, result) => { 
			if(err){ 
				console.error('[OBS put object]Error-->' + err); 
			}else{ 
				console.log('[OBS get object]Status-->' + result.CommonMsg.Status); 
				if(result.CommonMsg.Status < 300 && result.InterfaceResult){
						// 读取对象内容 
						//console.log('Object Content:'); 
						//console.log(result.InterfaceResult.Content.toString()); 
						fun(result.InterfaceResult.Content.toString(),para);
				}
			} 
	});
}



function writeStr(prefix, str){
	obs.putObject({
		Bucket : bucketName,
		Key : prefix,
		Body : str
	}, (err, result) => {
			if(err){
				console.error('[OBS put object]Error-->' + err);
			}else{
				console.log('[OBS put object]Status-->' + result.CommonMsg.Status);
			}
	});
}


module.exports = {
	OBSFolderObj,
	newFolder,
	writeStr,
	getStr,
	deleteObj
}