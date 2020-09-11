/**
 * version 2020/8/11
 * Creater: Ma
 * DIS连接中间层，定时更新DIS中的设备参数至服务器本地缓存。
 * 
 * 
 * * */
const schedule = require('node-schedule');
const fs = require('fs');
const {resolve} = require('path');
const gb = require('json-groupby');

var DISClientBuilder = require(__dirname+'/DISlib/index');
var RecordsStub = require(__dirname+'/DISlib/stub/Records');
var DISkit = require(__dirname+'/DISkit');
var OBSrecorder = require(__dirname+'/OBSrecorder');


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


var zyfPath = new Array("../public/cache/zyf1Json.json","../public/cache/zyf2Json.json","../public/cache/zyf3Json.json","../public/cache/zyf4Json.json","../public/cache/zyf5Json.json","../public/cache/zyf6Json.json","../public/cache/zyf7Json.json");
var dataPressure = new Array();
var dataTempIn = new Array();
var dataTempOut = new Array();


var fuIdMap = new Array("c57_001","c57_002","c57_003","c57_004","c57_005","c57_006","c57_007");
var presureMap = new Array("Ch6","Ch6","Ch6","Ch6","Ch6","Ch6","Ch6");
var tempInMap = new Array("Ch5","Ch5","Ch5","Ch5","Ch5","Ch5","Ch5");
var tempOutMap = new Array("Ch4","Ch4","Ch4","Ch4","Ch4","Ch4","Ch4");


console.log("schedule start");
var dataJson;

DISkit.getRecords(function(dataJson){
	//console.log('datajson: '+dataJson);
	var jsdata = gb(dataJson, ['partition_key'], ['data']);
	zyfSchedule(jsdata);
});


function findFuByDeviceId(DeviceId){

    var startIndex = DeviceId.indexOf('_');
    var subId = DeviceId.substr(startIndex-3,7);
    //console.log('devId  ' + DeviceId);
    //console.log('subId  ' + subId);
    for(var i = 0; i<7; i++){
      if(subId == fuIdMap[i]){
        return i;
      }
    }

}


function zyfSchedule(jsdata){

	for(var partition_key in jsdata){
	    var device = jsdata[partition_key];
	    var FuId = findFuByDeviceId(partition_key);
		var formatJsonStr=JSON.stringify(partition_key,undefined, 2);
		console.log('ZYF Schedule---ID: ' +FuId); 
		//console.log('partition_key => ' +formatJsonStr.substring(0,1000)); 
	    if(FuId>=0 && FuId <=6){
			   //var recordJsonStr = '{pressure: [], tempIn: [], tempOut: []}';
			var channel = {
				key:presureMap[FuId],
				pressure:presureMap[FuId],
				tempIn:tempInMap[FuId],
				tempOut:tempOutMap[FuId]
			}
			OBSrecorder.checkAndRecord(device.data,channel,FuId+1,0,7);
			/*
	        var recordJson = {pressure: [], tempIn: [], tempOut: []};

	        var formatJsonStr=JSON.stringify(device.data,undefined, 2);
	        //console.log('[INFOuid ' +FuId); 
	        //console.log('[INFO Key] partition_key => ' +formatJsonStr.substring(0,1000)); 
	    
	    //获取不同时间的数据
	        for(var svc in device.data){
	            var subRecord = device.data[svc];
	            var subRecordJson = JSON.parse(subRecord);
	            var timeAndData = subRecordJson.services[0];


	            var formatJsonStr=JSON.stringify(timeAndData,undefined, 2);
	            //console.log('[INFO Key] partition_key => ' +formatJsonStr.substring(0,1000)); 

	            var timeStemp = timeAndData.event_time;
	            //var timeTodata = gb(dataRcJson.services, ['event_time'], ['properties']);
	            //console.log('[INFO Key] services => ' +timeStemp); 
	            
	            var properties = timeAndData.properties;

	            //var properties = subRecordJson2[0];

	            

	            var chName;
	            var val;
	            var temp;


		        //读取压力
		        chName = presureMap[FuId];
		        val = properties[chName];
		        temp = '{\"t\":\"'+timeStemp+'\", \"v\":\"'+val+'\"}';
		        recordJson.pressure.push(JSON.parse(temp));

		        //读取腹内温度
		        chName = tempInMap[FuId];
		        val = properties[chName];
		        temp = '{\"t\":\"'+timeStemp+'\", \"v\":\"'+val+'\"}';
		        recordJson.tempIn.push(JSON.parse(temp));

		        //读取釜表温度
		        chName = tempOutMap1[FuId];
		        val = properties[chName];
		        temp = '{\"t\":\"'+timeStemp+'\", \"v\":\"'+val+'\"}';
		        recordJson.tempOut.push(JSON.parse(temp));


	        }

	        let str = JSON.stringify(recordJson);
			fs.writeFileSync(resolve(__dirname, zyfPath[FuId]),str,function(err){
			    if (err) {console.log(err);}
			});
			*/
		}
    }       
}   
    
