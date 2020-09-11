
var OBSkit = require(__dirname+'/OBSkit');

var valueTresh = 240; //约0.04Mpa
var valueDiffTresh = 500;
var dateCtrl = 0;
var eventTimeTresh = 3600;
var zeroOffset = 7;

/**检测是否已存在今日文件夹，若不存在则创建一个新的今日目录
 * 格式  Service/ZYRecord/2020-04-03
 * 最后返回该文件夹中已有的事件信息，以文件名为标记。
 * 48小时事件，参照的channel名词，釜ID
 */
function dateString(now){

	var year = now.getFullYear();
	var month = now.getMonth()+1;
	var date = now.getDate();

	var yearStr = year;
	var monthStr;
	var dateStr;
	if(month.toString().length==1){
		monthStr = '0'+month.toString();
	}else{
		monthStr = month.toString();
	}

	if(date.toString().length==1){
		dateStr = '0'+date.toString();
	}else{
		dateStr = date.toString();
	}

	var todayStr = yearStr+'-'+monthStr+'-'+dateStr;

	return todayStr;
}

function checkAndRecord(devData,channel,FuId,dateMove,treshOffset){
	dateCtrl = dateMove;
	zeroOffset = treshOffset;
	console.log("[Step1][checkAndRecord START]--FuID:"+FuId);
	var now = new Date();
	now.setTime(now.getTime()+dateCtrl*24*60*60*1000-zeroOffset*60*60*1000);
	var todayStr = dateString(now);
	var todayPrefix = 'Service/ZyRecord/'+todayStr+"/";//今日事件的储存

	var para = {
		devData: devData,
		channel: channel,
		FuId:FuId,
		todayPrefix:todayPrefix,
		today:now
	};

	OBSkit.OBSFolderObj(todayPrefix,para,function(contents,prefix,para_A){
		if(contents.length == 0){
			var yesterday = para.today;
			yesterday.setTime(yesterday.getTime()-24*60*60*1000);
			yesterdayStr = dateString(yesterday);
			yesterdayPrefix = 'Service/ZyRecord/'+yesterdayStr+"/";


			OBSkit.OBSFolderObj(yesterdayPrefix,para_A,function(contents,prefix,para_B){
				var record = 0;
				var yest = 0;
				var recPrefixTemp;
				var Xindex;
				var Yindex;
				var startTimeTemp;
				var fuIdTemp;
				var endTimeTemp;
				var typeTemp;

				var subRecord;
				var subRecordJson;
				var timeAndData;
				var evTime;	
				var evDate;
				var evTimeStemp;
				for(let j=0;j<contents.length;j++){
					yest = 1;
					recPrefixTemp = contents[j]['Key'];
					Xindex = recPrefixTemp.indexOf('X');
					Yindex = recPrefixTemp.indexOf('Y');
					startTimeTemp = parseInt(recPrefixTemp.substring(Xindex+4,Yindex));
					fuIdTemp = parseInt(recPrefixTemp.substr(Xindex-1,1));
					endTimeTemp = recPrefixTemp.substring(Yindex+1);
					if(Xindex>0){
						typeTemp = recPrefixTemp.substr(Xindex+1,3);
						if(fuIdTemp == para_B.FuId && typeTemp == 'ING'){
							var recordJson = {
								FuId: para_B.FuId,
								startTime: startTimeTemp,
								endTime:endTimeTemp,
								data:{pressure: [], tempIn: [], tempOut: [], state:[]}
							}

							for(var i = 0; i<para_B.devData.length-1; i++){

								subRecord = para_B.devData[i];
								subRecordJson = JSON.parse(subRecord);
								timeAndData = subRecordJson.services[0];
								evTime = timeAndData.event_time;	
								evDate = resolveTime(evTime);
								evTimeStemp = evDate.getTime();
							    if(evTimeStemp>startTimeTemp){
									recordJson = jsonRec(recordJson,timeAndData.properties,evTimeStemp,para_B);
								}
							}
							var recStr = JSON.stringify(recordJson);
							var recPrefix = para.todayPrefix+para_B.FuId+"XING"+startTimeTemp+'Y'+endTimeTemp;
							//console.log("FuID:"+FuId+"[Step1][NoToday][Has Yesterday][LOG]-- ING Event:"+recPrefix+", Str: "+recStr);
							record = 1;
							OBSkit.writeStr(recPrefix,recStr);
							
						}
					}	
				}
				if(record == 0){
					if(yest == 0){
						console.log("FuID:"+FuId+"[Step1][NoToday][No YesterdayFolder]:");
					}else{
						console.log("FuID:"+FuId+"[Step1][NoToday][HAS YesterdayFolder]:");
					}

					var recPrefix = para.todayPrefix;
					console.log("FuID:"+FuId+"[Step1][NoToday][NewFolder]--New Folder:"+recPrefix);
					//OBSkit.newFolder(recPrefix);
				}	
			});
			
		}else{
			console.log("FuID:"+FuId+"[Step1][HAS Today]");
			newestRecord(contents,para_A);
		}
	});
}




function resolveTime(timeStemp){
    var year = timeStemp.substr(0,4);
    var month = timeStemp.substr(4,2);
    var day = timeStemp.substr(6,2);

    var Tindex = timeStemp.indexOf('T');
    var hour = timeStemp.substr(Tindex+1,2);
    var min = timeStemp.substr(Tindex+3,2);
    var sec = timeStemp.substr(Tindex+5,2);

    now = new Date(year,month-1,day,hour,min,sec);
	now.setHours(now.getHours()+8);
	return now;
}

function jsonRec(recordJson, properties, timeStemp, para){

	var val;
	var temp;

	//读取压力
	val = properties[para.channel.pressure];


	temp = '{\"t\":\"'+timeStemp+'\", \"v\":\"'+val+'\"}';
	recordJson.data.pressure.push(JSON.parse(temp));

	//读取腹内温度
	val = properties[para.channel.tempIn];
	temp = '{\"t\":\"'+timeStemp+'\", \"v\":\"'+val+'\"}';
	recordJson.data.tempIn.push(JSON.parse(temp));

	//读取釜表温度
	val = properties[para.channel.tempOut];
	temp = '{\"t\":\"'+timeStemp+'\", \"v\":\"'+val+'\"}';
	recordJson.data.tempOut.push(JSON.parse(temp));

	//读取状态
	val = properties[para.channel.state];
	temp = '{\"t\":\"'+timeStemp+'\", \"v\":\"'+val+'\"}';
	recordJson.data.state.push(JSON.parse(temp));


	return recordJson;
}






function newestRecord(contents,para){

	var lastTime = new Date(para.today.toLocaleDateString()).getTime()-60*60*1000+zeroOffset*60*60*1000;
	var todayMax = new Date(para.today.toLocaleDateString()).getTime()+24*60*60*1000+zeroOffset*60*60*1000;
	var type = 'FIN';
	var oldPrefix;
	for(let j=0;j<contents.length;j++){
		var eventPrefix = contents[j]['Key'];
		var Xindex = eventPrefix.indexOf('X');
		if(Xindex>0){
			var typeTemp = eventPrefix.substr(Xindex+1,3);
			var fuIdTemp = parseInt(eventPrefix.substr(Xindex-1,1));
			var Yindex = eventPrefix.indexOf('Y');
			var startTimeTemp = parseInt(eventPrefix.substring(Xindex+4,Yindex));
			//console.log('[Step2][Contents]--FuId:'+fuIdTemp+', TypeTemp:'+typeTemp+', Yindex:'+Yindex+', StartTime:'+startTimeTemp);

			if(fuIdTemp == para.FuId){
				if(typeTemp == 'ING' && startTimeTemp<lastTime){
					lastTime = startTimeTemp;
					type = typeTemp;
					oldPrefix = eventPrefix;
				}else{
					var endTimeTempStr = eventPrefix.substring(Yindex+1);
					if(endTimeTempStr.length>1){
						var endTimeTemp = parseInt(endTimeTempStr);
						if(endTimeTemp>lastTime){
							lastTime = endTimeTemp;
							type = typeTemp;
							oldPrefix = eventPrefix;
						}					
					}else{
						if(startTimeTemp>lastTime){
							lastTime = startTimeTemp;
							type = typeTemp;
							oldPrefix = eventPrefix;
						}
					}
				}			
			}
		}
	}

	console.log("FuID:"+para.FuId+"[Step2][Inform]--lastTime:"+lastTime+", type:"+type+", oldPrefix:"+oldPrefix);

	var recordJson = {
		FuId: para.FuId,
		startTime:lastTime,
		endTime:0,
		data:{pressure: [], tempIn: [], tempOut: [], state:[]}
	}

	var stopSearch = 0;
	var ingRefresh = 0;
	if(type == 'ING'){
		ingRefresh = 1;
	}
	
	var valpre = 0
	for(var i = 0; i<para.devData.length-1; i++){

		var subRecord = para.devData[i];
		var subRecordJson = JSON.parse(subRecord);
		var timeAndData = subRecordJson.services[0];
		var evTime = timeAndData.event_time;	
		var evDate = resolveTime(evTime);
		var evTimeStemp = evDate.getTime();
		
		//console.log("FuID:"+para.FuId+"[Step2][Devdata]--Time:"+evTimeStemp);
		if(stopSearch == 0){
			if(evTimeStemp>lastTime){
				recordJson = jsonRec(recordJson,timeAndData.properties,evTimeStemp,para);
								//认为是新事件
				if(evTimeStemp<todayMax){

					var properties = timeAndData.properties;
					var val = properties[para.channel.key];

					if(i == 1){
						valpre = val;
					}

					//console.log("FuID:"+para.FuId+"[Step2][NewEvent]--lastTime:"+lastTime+", evTime:"+evTimeStemp+", val:"+val);

					if(type == 'FIN' && val>valueTresh && Math.abs(val-valpre)<valueDiffTresh){

						console.log("FuID:"+para.FuId+"[Step2][Out Tresh]--val:"+val+" channel Key:"+para.channel.key);
						
						recordJson = {
							FuId: para.FuId,
							startTime:lastTime,
							endTime:0,
							data:{pressure: [], tempIn: [], tempOut: [], state:[]}
						}
						
						recordJson.startTime = evTimeStemp;
						recordJson.endTime = 0;
						stopSearch = 1;

						recordJson = jsonRec(recordJson,timeAndData.properties,evTimeStemp,para);

					}else if(type == 'ING' && (evTimeStemp-lastTime)>eventTimeTresh*1000 && val<valueTresh && Math.abs(val-valpre)<valueDiffTresh){ //出
						recordJson.startTime = lastTime;
						recordJson.endTime = evTimeStemp;
						var recStr = JSON.stringify(recordJson);
						var recPrefix = oldPrefix.replace(/ING/, "FIN");
						recPrefix = recPrefix+evTimeStemp;
						if(recordJson.startTime<todayMax && recordJson.endTime<todayMax){
							OBSkit.writeStr(recPrefix,recStr);
							OBSkit.deleteObj(oldPrefix);
							console.log("FuId:"+para.FuId+ ", New FIN Event: Prefix:"+recPrefix+" Str: "+recStr.substr(0,100));	
						}
						ingRefresh = 0;
						break;
					}

					valpre = val;
				}
			}
		}else{
			recordJson = jsonRec(recordJson,timeAndData.properties,evTimeStemp,para);
		}
	}

	if(stopSearch == 1 && recordJson.startTime<todayMax){
		var recStr = JSON.stringify(recordJson);
		var recPrefix = para.todayPrefix+para.FuId+'XING'+recordJson.startTime+'Y';
		OBSkit.writeStr(recPrefix,recStr);
		console.log("FuId:"+para.FuId+ ", New ING Event: Prefix:"+recPrefix+" Str: "+recStr.substr(0,100));
	}

	if(ingRefresh == 1 && recordJson.startTime<todayMax){
		var recStr = JSON.stringify(recordJson);
		var recPrefix = para.todayPrefix+para.FuId+'XING'+recordJson.startTime+'Y';
		OBSkit.writeStr(recPrefix,recStr);
		console.log("FuId:"+para.FuId+ ", Refresh ING Event: Prefix:"+recPrefix+" Str: "+recStr.substr(0,100));
	}
	
	
	//console.log('[4+][OBSObj][fun]--:EventTimeList:'+eventTimeList);
}

module.exports = {
	checkAndRecord
}