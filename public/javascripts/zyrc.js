$(function(){


  init();

})

var zeroOffset = 7;
var offsetDate = new Date();
offsetDate.setTime(offsetDate.getTime()-zeroOffset*60*60*1000);

function addNew(rec){
  
  var FuId = rec.fuId;
  var Index = rec.index;
  var StartTime = parseInt(rec.startTime); 
  var EndTime = parseInt(rec.endTime);
  var ban = banTime(parseInt(rec.startTime));
  var prefix = rec.prefix;
  var tb = document.getElementById('fuListTable');

  var evStart = timeString(new Date(StartTime),0);
  var evEnd = timeString(new Date(EndTime),new Date(StartTime));
  var evTotal = diffTime(EndTime,StartTime);

  //添加行
  var newTR = tb.insertRow(tb.rows.length);
  newTR.id = "HH";

  //添加列:釜号
  var newFuId = newTR.insertCell(0);
  //添加列内容
  newFuId.innerHTML = FuId+'号釜';

  //添加列:序号
  var newXuId = newTR.insertCell(1);
  //添加列内容
  newXuId.innerHTML = Index;

  //添加列:进釜时间
  var newInTime = newTR.insertCell(2);
  //添加列内容
  newInTime.innerHTML = evStart;

  //添加列:出釜时间
  var newOutTime = newTR.insertCell(3);
  //添加列内容
  newOutTime.innerHTML = evEnd;

  //添加列:时长
  var newTotalTime = newTR.insertCell(4);
  //添加列内容
  newTotalTime.innerHTML = evTotal;

  //添加列:察看按钮
  var newMore = newTR.insertCell(5);
  //添加列内容
  newMore.innerHTML = "<a class='btn btn-lg btn-success' href='zyrc/zyev?id="+FuId+"&startTime="+StartTime+"&endTime="+EndTime+"&prefix="+prefix+"' target='_Blank' >查看</a>";
  
 
}
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
  var timeStr;
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

function banTime(startTime){
  var banOffset = new Date(startTime-zeroOffset*60*60*1000);
  var startDateStr = banOffset.getMonth()+1+'月'+banOffset.getDate()+'号';
  var ban;
  if(new Date(startTime).getHours()>=zeroOffset && new Date(startTime).getHours()<12+zeroOffset){
    ban = '白班';
  }else{
    ban = '夜班';
  }
  return startDateStr+ban;
}

function diffTime(EndTime,StartTime){

    if(!(EndTime>0)){
      EndTime = new Date().getTime();
    }
    var time = EndTime-StartTime
    var hour = Math.floor(time/1000/3600);
    var min = Math.floor((time-hour*1000*3600)/1000/60);
    if(hour<24){
       return hour+'小时'+min+'分钟';
    }else{
       return '见次日记录';
    }

}

function showTableData(data){
  var tb = document.getElementById('fuListTable');
  var rowNum=tb.rows.length;
  for (i=1;i<rowNum;i++){
    tb.deleteRow(i);
    rowNum=rowNum-1;
    i=i-1;
  }

  var outNum = 0;
  var outTimeTotal = 0;
  var rec;
  var evEnd;
  for (var i in data) {
      rec = data[i];
      evEnd = timeString(new Date(parseInt(rec.endTime)),new Date(parseInt(rec.startTime)));

      if(evEnd.length>6){
        outNum = outNum+1;
        outTimeTotal = outTimeTotal+parseInt(rec.endTime)-parseInt(rec.startTime);
      }

      addNew(rec);
  }

  var outTotal = outNum*15*4.32;
  //$('#text1').text("累计出釜："+outTotal.toFixed(2)+"立方");
  //$('#text2').text("平均用时："+diffTime(parseInt(outTimeTotal/outNum),0));
}

function init(){

  fetch("/zyrc/list?date="+dateString(offsetDate), {
      method: "GET"
    
  }).then(function(res) {
      return res.json();
  }).then(function (data) {

      showTableData(data);
  });

  $('.form_date').datetimepicker({
      language:  'zh-CN',
      weekStart: 1,
      todayBtn:  1,
      autoclose: 1,
      todayHighlight: 1,
      startView: 2,
      minView: 2,
      forceParse: 0
  }).on('changeDate', function(event) {
      event.preventDefault();
      event.stopPropagation();
      var day = $('#dtp_input2').val();
      console.log(day);
      fetch("/zyrc/list?date="+day, {
          method: "GET"       
      }).then(function(res) {
          return res.json();
      }).then(function (data) {
          showTableData(data);
      });
	});

}

