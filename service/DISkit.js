
/**
 * version 2020/8/11
 * Creater: Ma
 * DIS连接组件。
 * 
 * 
 * * */
const fs = require('fs');

var DISClientBuilder = require(__dirname+'/DISlib/index');
var RecordsStub = require(__dirname+'/DISlib/stub/Records');


var CONF = {
  PROJECTID: '092b1a7e3380f2172f28c01d4f6a3fcf',
  REGIONNAME: 'cn-north-4',
  AK: 'C6YFHVZERH6SNUS3T8RX',
  SK: 'g6yPZO5O4EsfgJFbYNwxp3DZ7wmGg5pSSIYtLSLe'
};

var dataJson = [];
var jsonToClient;

var STREAM_NAME = 'dis-YDY1';

var api = DISClientBuilder.buildRecordApi(CONF);
var putRecordsRequest = RecordsStub.mockPutRecordsRequest(STREAM_NAME);

var partitionId = 'shardId-0000000000';

function getRecords(fun){
  dataJson = [];
	api.getCursor(CONF.PROJECTID, STREAM_NAME, partitionId, {
		cursorType: 'TRIM_HORIZON',
	}, function (error, data, getCursorResponse) {
		if (error) {
			console.error('[error] error1 => ' + error);
			console.error('[error] error1 details => ' + getCursorResponse.text);
			console.error('[error] http code => ' + getCursorResponse.status);
			refreshLink();
			return recursiveGetRecords(data.partition_cursor,fun);
		} else {
			return recursiveGetRecords(data.partition_cursor,fun);
		}
	}); 
}



function refreshLink(){
  console.log('refreshLink');
  
	api = DISClientBuilder.buildRecordApi(CONF);
    putRecordsRequest = RecordsStub.mockPutRecordsRequest(STREAM_NAME);	
}

function recursiveGetRecords(partition_cursor,fun) {
  console.log('recursiveGetRecords start');

  var p = new Promise(function (resolve, reject) {
  	console.log('api start1 ');
    

    api.getRecords(CONF.PROJECTID, partition_cursor, function (error, data, response) {
      if (error) {
        console.error('[INFO] error2 => ' + error);
        console.error('[INFO] error2 details => ' + response.text);
        console.error('[INFO] http code => ' + response.status);
        reject(error);
      } else {
      	//console.log('foreach start ');
        data.records.forEach(function (record) {
          record.data = Buffer.from(record.data, 'base64').toString();
        });
        //console.log('concat start ');
        dataJson = dataJson.concat(data.records);
        //console.log('concat end ');
        console.log('[INFO] http code => ' + response.status);
        if(data.records && (data.records.length !== 0)){
            resolve(data.next_partition_cursor);
        } else {					
            reject('[INFO] Cursor moved to the end of partition.');
            fun(dataJson);
        }
      }
    });

  });
  p.then(function (partition_cursor) {
  	console.log('pthen');
    recursiveGetRecords(partition_cursor,fun);
  }).catch(function (error) {
    console.log('catch error');
	  console.log(error);
  });
}


module.exports = {
	getRecords
}