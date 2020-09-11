
$(function(){


  init1(1);
$('#loading').modal('show'); 
})


var dataPressure = new Array();
var dataTempIn = new Array();
var dataTempOut = new Array();
var dataState = new Array();

var fuIdMap = new Array("001","002","003","004","005","006","007");
var presureMap = new Array("Ch6","Ch6","Ch6","Ch6","Ch6","Ch6","Ch6");
var tempInMap = new Array("Ch5","Ch5","Ch5","Ch5","Ch5","Ch5","Ch5");
var tempOutMap1 = new Array("Ch4","Ch4","Ch4","Ch4","Ch4","Ch4","Ch4");

function generateData(jsdata,id) {

    var categoryData = [];
    var tempInData = [];
    var tempOutData = [];
    var pressInData = [];
    var stateData = [];

    //获取不同时间的数
    //console.log('jsd: '+JSON.stringify(jsdata))
    var records = jsdata.records;
    var rec;
    for(var i in records){       
        rec = records[i];
        categoryData.push(echarts.format.formatTime('yyyy-MM-dd\nhh:mm:ss', resolveTime(rec.time)));
        tempInData.push(doCalculation(rec.inTemp,2,id));
        tempOutData.push(doCalculation(rec.outTemp,3,id));
        pressInData.push(doCalculation(rec.inPress,1,id));
        stateData.push(rec.state);     
    }

    dataPressure[id] = {
        categoryData : categoryData,
        valueData : pressInData
    };
    dataTempIn[id] = {
        categoryData : categoryData,
        valueData : tempInData
    };
    dataTempOut[id] = {
        categoryData : categoryData,
        valueData : tempOutData
    }
    dataState[id] = {
        categoryData : categoryData,
        valueData : stateData
    }

    console.log(dataState[id].valueData.length)
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
    return now.setHours(now.getHours()+8);
}


function findFuByDeviceId(DeviceId){

    var startIndex = DeviceId.indexOf('_');
    var subId = DeviceId.substr(startIndex+1,3);
    for(var i = 0; i<7; i++){
      if(subId == fuIdMap[i]){
         return i;
      }
    }

}

function doCalculation(val,type,id){
    var value;
    switch(type){
     
      case 1: //Pressure         
          value =  val*0.0006-0.1026;
            
          break;
      case 2: //TempIn
        if(id == 7){

          value = val/4095*1000*5.1948-249.74;
        }else{
          value = val*2.5044-260.0353;
        }            
         break;
      case 3: //TempOut
        if(id == 7){
          value = 0;
        }else{
          value = 0;
        }
         break;
      default:
          value = 0;
  }

  if(value<0){
    value = 0;
  }
  return value;
}

function init1(i){

 
    fetch("/zyf/datafu?FuId="+i, {
        method: "GET"        
    }).then(function(res) {
        return res.json();
    }).then(function (data) {

      var p = new Promise(function (resolve, reject) {
          generateData(data,i);
          init2(i); 
          if(i<7){
            resolve(i);
          }else{
            reject();
          }
      });
          p.then(function (i) {
            init1(i+1);
          }).catch(function (error) {
            console.log('catch error');
            console.log(error);
      });
      
    }); 
}

function init2(i){
    $('#loading').modal('hide'); 
    console.log('init2 :' + i); 
    var lcs = echarts.init(document.getElementById('lineChart'+i));

    lcs.setOption({
      color:["#87cefa","#ff7f50","#32cd32","#da70d6",],
      toolbox: {
          show: true,
          feature: {
              dataView: {readOnly: false},
              restore: {},
              brush: { type: ['lineX', 'clear']},
              saveAsImage: {}
          },
      },

      tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
      },

      legend: {
        data:['釜内压力','釜内温度','釜表温度',],
        y: 'top',
        x:'center',
        textStyle:{ color:'#000000', fontSize:20 },
        itemGap : 50
      },

      brush: {
        xAxisIndex: 'all',
        brushLink: 'all',
        brushmode:'multiple',
        throttleDelay:1,
        outOfBrush: {colorAlpha: 1},
        inBrush: { colorAlpha: 1}
      },

      xAxis: {
        data: dataPressure[i].categoryData,
        axisLine:{lineStyle:{color: '#000000'},},
        splitLine: {show: false},
        axisLabel: {textStyle: {color: '#000000',fontSize:18},},
      },

      yAxis : 
      [
        {
              type : 'value',
              scale : true,
              axisLine:{
                  lineStyle:{
                      color: '#000000'
                  },
              },
              splitLine: {
                  "show": false
              },
              axisLabel: {
                  textStyle: {
                      color: '#000000',
                      fontSize:18
                  },
                  formatter: function (value) {
                      return value + "Mpa"
                  },
              },
          },
          {
              type : 'value',
              axisLine:{
                  lineStyle:{
                      color: '#000000'
                  },
              },
              splitLine: {
                  "show": false
              },
              axisLabel: {
                  textStyle: {
                      color: '#000000',
                      fontSize:18
                  },
                  formatter: function (value) {
                      return value + "C"
                  },
              },
          }
      ],

     
      
      dataZoom: [
          
            {   // 这个dataZoom组件，也控制x轴。
                type: 'inside', // 这个 dataZoom 组件是 inside 型 dataZoom 组件
                start: 70,      // 左边在 70% 的位置。
                end: 100,    // 右边在 60% 的位置。
                show: true,
                realtime: true
         
            }
        ],
    
      series : [
            {
                name:'釜表温度',
                type:'line',
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                sampling:'average',
                smooth:'false',
                yAxisIndex: 1,
                data:dataTempOut[i].valueData
            },
            {
                name:'釜内温度',
                type:'line',
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                sampling:'average',
                smooth:'false',
                yAxisIndex: 1,
                data:dataTempIn[i].valueData,
            },
            {
                name:'釜内压力',
                type:'line',
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                sampling:'average',
                smooth:'false',
                data:dataPressure[i].valueData,
            }

      ],
    });

}


  




