$(function(){


  init1();

})

var dataPressure;
var dataTempIn;
var dataTempOut;
var dataState;

var zeroOffset = 7;
var offsetDate = new Date();
offsetDate.setTime(offsetDate.getTime()-zeroOffset*60*60*1000);


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

function timeString(now,start){

  var month = now.getMonth()+1;
  var hour = now.getHours();
  var date = now.getDate();

  if(month>0){

    var min = now.getMinutes();
    var minStr;
    if(min.toString().length==1){
      minStr = '0'+min.toString();
    }else{
      minStr = min.toString();
    }
    if(hour>=0 && hour<=6){
      return month+'月'+date+'号凌晨'+hour+'点'+minStr+'分';
    }else if(hour>6 && hour<13){
      return month+'月'+date+'号上午'+hour+'点'+minStr+'分';
    }else if(hour>=13 && hour<=18){
      return month+'月'+date+'号下午'+(hour-12)+'点'+minStr+'分';
    }else{
      return month+'月'+date+'号晚上'+(hour-12)+'点'+minStr+'分';
    }
    
  }else{     
      return '等待出釜'; 
  }

}

function diffTime(EndTime,StartTime){

    if(!(EndTime>0)){
      EndTime = new Date().getTime();
    }
    var time = EndTime-StartTime
    var hour = Math.floor(time/3600);
    var min = Math.floor((time-hour*1000*3600)/60);
    if(hour<12){
       return hour+'小时'+min+'分钟';
    }else{
       return '见次日记录';
    }

}

function generateData(jsdata) {


  var categoryData = [];
  var valueData = [];
  var rec;

  for(var i in jsdata){

      rec = jsdata[i];
      categoryData.push(echarts.format.formatTime('yyyy-MM-dd\nhh:mm:ss', new Date(parseInt(rec.t)*1000)));
      valueData.push(rec.v);
  }
    
  return {
      categoryData: categoryData,
      valueData: valueData
  };
}


function banTime(startTime){
  var banOffset = new Date(startTime-zeroOffset*60*60*1000);
  var startDateStr = banOffset.getMonth()+1+'月'+banOffset.getDate()+'号';
  var ban;
  if(new Date(startTime).getHours()>zeroOffset && new Date(startTime).getHours()<12+zeroOffset){
      ban = '白班';
  }else{
      ban = '夜班';
  }
  return startDateStr+ban;
}


function init1(){

  var dateCtrl = 0;
  var now = new Date();
  now.setTime(now.getTime()+dateCtrl*24*60*60*1000);
  console.log(dateString(now));

  fetch("/zyrc/zyevId", {
      method: "GET"   
  }).then(function(res) {
      return res.json();
  }).then(function (data) { 
      

      $('#name_head').text(data.FuId+"号釜   ("+banTime(parseInt(data.startTime))+"进釜)");
      var startTimeStr = timeString(new Date(parseInt(data.startTime)),0);
      var endTimeStr = timeString(new Date(parseInt(data.endTime)),new Date(parseInt(data.startTime)));
      var diffTimeStr = diffTime(parseInt(data.endTime),parseInt(data.startTime));
      $('#text1').text("开始时间:   "+startTimeStr);
      if(endTimeStr.length>6){
          $('#text2').text("结束时间:   "+endTimeStr);
      }else{
          $('#text2').text(endTimeStr);
      }
      $('#text3').text("蒸养时长:   "+diffTimeStr);

      var recordData = data.data;
      dataPressure = generateData(recordData.pressure);
      dataTempIn = generateData(recordData.state); 
      dataTempOut = generateData(recordData.tempOut);  
      dataState = generateData(recordData.state);  

      init2();
    
  });


}


function init2(){
    
    var lcs = echarts.init(document.getElementById('lineChart1'));

    lcs.setOption({
      color:["#87cefa","#ff7f50","#32cd32","#da70d6",],
      toolbox: {
          show: true,
          feature: {
              dataView: {readOnly: false},
              restore: {},
              brush: {
                    type: ['lineX', 'clear']
                },
              saveAsImage: {}
          },



      },

      tooltip: {
          trigger: 'axis',
          axisPointer: {
              type: 'shadow'
          }
      },

      legend: {
        data:['釜内压力','釜内温度','釜表温度',],
        y: 'top',
        x:'center',
        textStyle:{
            color:'#000000',
            fontSize:20
        },
        itemGap : 50
      },

      brush: {
        xAxisIndex: 'all',
        brushLink: 'all',
        brushmode:'multiple',
        throttleDelay:1,
        outOfBrush: {
            colorAlpha: 1
        },
        inBrush: {
            colorAlpha: 1
        }
      },

      xAxis: {
          data: dataPressure.categoryData,
          axisLine:{
              lineStyle:{
                  color: '#000000'
              },
          },
          splitLine: {
              show: false
          },
          axisLabel: {
              textStyle: {
                  color: '#000000',
                  fontSize:18
              },
          },
      },

      yAxis : [
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
                start: 0,      // 左边在 10% 的位置。
                end: 100         // 右边在 60% 的位置。
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
                data:dataTempOut.valueData
            },
            {
                name:'釜内温度',
                type:'line',
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                sampling:'average',
                smooth:'false',
                yAxisIndex: 1,
                data:dataTempIn.valueData,
            },
            {
                name:'釜内压力',
                type:'line',
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                sampling:'average',
                smooth:'false',
                data:dataPressure.valueData,
            }

      ],
    });
    
    var lcs2 = echarts.init(document.getElementById('lineChart2'));
    
    var labelOption = {
        show: true,
    
        formatter: '{c}  {name|{a}}',
        fontSize: 16,
        rich: {
            name: {
                textBorderColor: '#fff'
            }
        }
    };

    lcs2.setOption({


      color: ['#e5323e','#003366', '#006699'],
      tooltip: {
          trigger: 'axis',
          axisPointer: {
              type: 'shadow'
          }
      },

      

      legend: {
          data: ['压力差', '温度差(内)', '温度差(外)'],
          y: 'top',
          x:'center',
          textStyle:{
              color:'#000000',
              fontSize:20
          },
          itemGap : 50
      },

      xAxis : [
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

      yAxis: {type: 'category',
        axisLabel: {
          textStyle: {
              color: '#000000',
              fontSize:18
          },
        },
        axisTick: {show: true},
        data: ['2012', '2013', '2014', '2015', '2016']
      },
      series: [
        {
            name: '压力差',
            type: 'bar',
            label: labelOption,
            data: [1,1.3, 0.2, 0.3, 0.01],
            xAxisIndex: 0
        },
        {
            name: '温度差(内)',
            type: 'bar',
            label: labelOption,
            data: [150, 232, 201, 154, 190],
            xAxisIndex: 1
        },
        {
            name: '温度差(外)',
            type: 'bar',
            label: labelOption,
            data: [98, 77, 101, 99, 40],
            xAxisIndex: 1
        }
    ]



    });




}



