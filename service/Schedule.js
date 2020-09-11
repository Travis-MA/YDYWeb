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

var DISkit = require(__dirname+'/DISkit');
var OBSrecorder = require(__dirname+'/OBSrecorder');



var zyfPath = new Array("cache/zyf1Json.json","cache/zyf2Json.json","cache/zyf3Json.json","cache/zyf4Json.json","cache/zyf5Json.json","cache/zyf6Json.json","cache/zyf7Json.json");
var fuIdMap = new Array("c57_001","c57_002","c57_003","c57_004","c57_005","c57_006","c57_007");
var presureMap = new Array("Ch6","Ch6","Ch6","Ch6","Ch6","Ch6","Ch6");
var tempInMap = new Array("Ch5","Ch5","Ch5","Ch5","Ch5","Ch5","Ch5");
var tempOutMap1 = new Array("Ch4","Ch4","Ch4","Ch4","Ch4","Ch4","Ch4");
var stateMap = new Array("Ch7","Ch7","Ch7","Ch7","Ch7","Ch7","Ch7");


function startScheduleCycle(){
	scheduleCronstyle();
}

const  scheduleCronstyle = ()=>{

	var rule2     = new schedule.RecurrenceRule();
	var times2    = [0,5,10,15,20,25,30,35,40,45,50,55];
	rule2.minute  = times2;


    
    //console.log("schedule start"+now);

    schedule.scheduleJob(rule2,()=>{
		console.log("schedule start");
		DISkit.getRecords(function(dataJson){
			var jsdata = gb(dataJson, ['partition_key'], ['data']);
			zyfSchedule(jsdata);
		});	
    }); 
}

function findFuByDeviceId(DeviceId){

    var startIndex = DeviceId.indexOf('_');
    var subId = DeviceId.substr(startIndex-3,7);
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
		console.log('ZYF Schedule---ID: ' +FuId); 
		if(FuId>=0 && FuId <=6){
			
			var channel = {
				key:presureMap[FuId],
				pressure:presureMap[FuId],
				tempIn:tempInMap[FuId],
				tempOut:tempOutMap1[FuId],
				state:stateMap[FuId]
			}
			// 0：今天，7：延迟7小时
			OBSrecorder.checkAndRecord(device.data,channel,FuId+1,0,7);

	        var recordJson = {pressure: [], tempIn: [], tempOut: [], state:[]};

	        //获取不同时间的数据
	        for(var svc in device.data){
	            var subRecord = device.data[svc];
	            var subRecordJson = JSON.parse(subRecord);
	            var timeAndData = subRecordJson.services[0];
	            var timeStemp = timeAndData.event_time;
	            var properties = timeAndData.properties;

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
				
				//读取状态
				chName = stateMap[FuId];
				val = properties[chName];
				temp = '{\"t\":\"'+timeStemp+'\", \"v\":\"'+val+'\"}';
				recordJson.state.push(JSON.parse(temp));


	        }

			console.log('Write New Record');
	        let str = JSON.stringify(recordJson);
			fs.writeFileSync(resolve(__dirname, zyfPath[FuId]),str,function(err){
			    if (err) {console.log(err);}
			});
		}
    }
}




module.exports = {
	startScheduleCycle
}