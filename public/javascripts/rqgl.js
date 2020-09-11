
$(function(){


  init();

})


function addNew(){
  var tb = document.getElementById('fuListTable')
  
  //添加行
  var newTR = tb.insertRow(tb.rows.length);
  newTR.id = "HH";

  //添加列:釜号
  var newFuId = newTR.insertCell(0);
  //添加列内容
  newFuId.innerHTML = "HH";

  //添加列:序号
  var newXuId = newTR.insertCell(1);
  //添加列内容
  newXuId.innerHTML = "HH";

  //添加列:日期
  var newDate = newTR.insertCell(2);
  //添加列内容
  newDate.innerHTML = "HH";

  //添加列:进釜时间
  var newInTime = newTR.insertCell(3);
  //添加列内容
  newInTime.innerHTML = "HH";

  //添加列:出釜时间
  var newOutTime = newTR.insertCell(4);
  //添加列内容
  newOutTime.innerHTML = "HH";

  //添加列:察看按钮
  var newMore = newTR.insertCell(5);
  //添加列内容
  newMore.innerHTML = "<a class='btn btn-lg btn-success' href='#' role='button'>查看</a>";
 
}


function init(){

  for (var i = 0; i < 10; i++) {
      addNew();
  }
  
}

