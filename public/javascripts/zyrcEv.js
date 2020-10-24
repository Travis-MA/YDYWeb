$(function () {


    init1();

})

var dataPressure;
var dataTempIn;
var dataTempOut;
var dataState;

var zeroOffset = 7;
var offsetDate = new Date();
offsetDate.setTime(offsetDate.getTime() - zeroOffset * 60 * 60 * 1000);


function dateString(now) {

    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var date = now.getDate();

    var yearStr = year;
    var monthStr;
    var dateStr;
    if (month.toString().length == 1) {
        monthStr = '0' + month.toString();
    } else {
        monthStr = month.toString();
    }

    if (date.toString().length == 1) {
        dateStr = '0' + date.toString();
    } else {
        dateStr = date.toString();
    }

    var todayStr = yearStr + '-' + monthStr + '-' + dateStr;

    return todayStr;
}

function timeString(now, start) {

    var month = now.getMonth() + 1;
    var hour = now.getHours();
    var date = now.getDate();

    if (month > 0) {

        var min = now.getMinutes();
        var minStr;
        if (min.toString().length == 1) {
            minStr = '0' + min.toString();
        } else {
            minStr = min.toString();
        }
        if (hour >= 0 && hour <= 6) {
            return month + '月' + date + '号凌晨' + hour + '点' + minStr + '分';
        } else if (hour > 6 && hour < 13) {
            return month + '月' + date + '号上午' + hour + '点' + minStr + '分';
        } else if (hour >= 13 && hour <= 18) {
            return month + '月' + date + '号下午' + (hour - 12) + '点' + minStr + '分';
        } else {
            return month + '月' + date + '号晚上' + (hour - 12) + '点' + minStr + '分';
        }

    } else {
        return '等待出釜';
    }

}

function diffTime(EndTime, StartTime) {
    if (!(EndTime > 0)) {
        EndTime = new Date().getTime();
    }
    var time = (EndTime - StartTime) / 1000
    var hour = Math.floor(time / 3600);
    var min = Math.floor((time - hour * 3600) / 60);

    return hour + '小时' + min + '分钟';

}

function generateData(jsdata) {


    var categoryData = [];
    var valueData = [];
    var markLine = [];
    var rec;

    for (var i in jsdata) {
        rec = jsdata[i];
        categoryData.push(echarts.format.formatTime('yyyy-MM-dd\nhh:mm:ss', new Date(parseInt(rec.t) * 1000)));
        valueData.push(rec.v);
    }

    return {
        categoryData: categoryData,
        valueData: valueData
    };
}


function banTime(startTime) {
    var banOffset = new Date(startTime - zeroOffset * 60 * 60 * 1000);
    var startDateStr = banOffset.getMonth() + 1 + '月' + banOffset.getDate() + '号';
    var ban;
    if (new Date(startTime).getHours() > zeroOffset && new Date(startTime).getHours() < 12 + zeroOffset) {
        ban = '白班';
    } else {
        ban = '夜班';
    }
    return startDateStr + ban;
}


function init1() {

    var dateCtrl = 0;
    var now = new Date();
    now.setTime(now.getTime() + dateCtrl * 24 * 60 * 60 * 1000);
    console.log(dateString(now));

    fetch("/zyrc/zyevId", {
        method: "GET"
    }).then(function (res) {
        return res.json();
    }).then(function (data) {


        $('#name_head').text(data.FuId + "号釜");
        var startTimeStr = timeString(new Date(parseInt(data.startTime)), 0);
        var endTimeStr = timeString(new Date(parseInt(data.endTime)), new Date(parseInt(data.startTime)));
        var diffTimeStr = diffTime(parseInt(data.endTime), parseInt(data.startTime));
        $('#text1').text("记录开始时间:       " + startTimeStr);
        if (endTimeStr.length > 6) {
            $('#text2').text("记录结束时间:       " + endTimeStr);
        } else {
            $('#text2').text(endTimeStr);
        }
        $('#text3').text("记录时长:   " + diffTimeStr);
        $('#text4').text("采样点数：2403");
        $('#text5').text("终端输入：正常");
        $('#text6').text("传感器输入：正常");

        var recordData = data.data;
        dataPressure = generateData(recordData.pressure);
        dataTempIn = generateData(recordData.tempIn);
        dataTempOut = generateData(recordData.tempOut);
        dataState = generateData(recordData.state);

        init2();

    });


}


function init2() {

    var lcs = echarts.init(document.getElementById('lineChart1'));

    lcs.setOption({
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
            data: ['釜内压力', '釜内温度', '釜表温度', '阶段阶梯曲线'],
            y: 'top',
            x: 'center',
            textStyle: {
                color: '#000000',
                fontSize: 20
            },
            itemGap: 50
        },

        brush: {
            xAxisIndex: 'all',
            brushLink: 'all',
            brushmode: 'multiple',
            throttleDelay: 1,
            outOfBrush: {
                colorAlpha: 1
            },
            inBrush: {
                colorAlpha: 1
            }
        },

        xAxis: {
            data: dataPressure.categoryData,
            axisLine: {
                lineStyle: {
                    color: '#000000'
                },
            },
            splitLine: {
                show: false
            },
            axisLabel: {
                textStyle: {
                    color: '#000000',
                    fontSize: 18
                },
            },
        },

        yAxis: [
            {
                type: 'value',
                scale: true,
                axisLine: {
                    lineStyle: {
                        color: '#000000'
                    },
                },
                splitLine: {
                    "show": false
                },
                axisLabel: {
                    textStyle: {
                        color: '#000000',
                        fontSize: 18
                    },
                    formatter: function (value) {
                        return value + "Mpa"
                    },
                },
            },
            {
                type: 'value',
                axisLine: {
                    lineStyle: {
                        color: '#000000'
                    },
                },
                splitLine: {
                    "show": false
                },
                axisLabel: {
                    textStyle: {
                        color: '#000000',
                        fontSize: 18
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

        series: [
            {
                name: '釜表温度',
                color: 'rgba(27,67,171,0.69)',
                type: 'line',
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                sampling: 'average',
                smooth: 'false',
                yAxisIndex: 1,
                data: dataTempOut.valueData
            },
            {
                name: '釜内温度',
                color: 'rgb(219,186,0)',
                type: 'line',
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                sampling: 'average',
                smooth: 'false',
                yAxisIndex: 1,
                data: dataTempIn.valueData,
            },
            {
                name: '釜内压力',
                color: 'rgba(248,36,22,0.69)',
                type: 'line',
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                sampling: 'average',
                smooth: 'false',
                data: dataPressure.valueData,
            },
            {
                name: '阶段阶梯曲线',
                color: 'rgba(220,216,215,0.69)',
                type: 'line',
                itemStyle: {normal: {areaStyle: {type: 'default'}}},
                sampling: 'average',
                smooth: 'false',
                show: false,
                data: dataState.valueData,
            }

        ],
    });

    var pcs = echarts.init(document.getElementById('pieChart'));

    pcs.setOption({
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            legend: {
                orient: 'vertical',
                left: 10,
                data: ['直达', '营销广告', '搜索引擎', '邮件营销', '联盟广告', '视频广告', '百度', '谷歌', '必应', '其他']
            },
            series: [
                {
                    name: '访问来源',
                    type: 'pie',
                    selectedMode: 'single',
                    radius: [0, '30%'],

                    label: {
                        position: 'inner'
                    },
                    labelLine: {
                        show: false
                    },
                    data: [
                        {value: 335, name: '升压', selected: true},
                        {value: 679, name: '降压'},
                        {value: 1548, name: '恒压'}
                    ]
                },
                {
                    name: '访问来源',
                    type: 'pie',
                    radius: ['40%', '55%'],
                    label: {
                        formatter: '{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ',
                        backgroundColor: '#eee',
                        borderColor: '#aaa',
                        borderWidth: 1,
                        borderRadius: 4,
                        // shadowBlur:3,
                        // shadowOffsetX: 2,
                        // shadowOffsetY: 2,
                        // shadowColor: '#999',
                        // padding: [0, 7],
                        rich: {
                            a: {
                                color: '#999',
                                lineHeight: 22,
                                align: 'center'
                            },
                            // abg: {
                            //     backgroundColor: '#333',
                            //     width: '100%',
                            //     align: 'right',
                            //     height: 22,
                            //     borderRadius: [4, 4, 0, 0]
                            // },
                            hr: {
                                borderColor: '#aaa',
                                width: '100%',
                                borderWidth: 0.5,
                                height: 0
                            },
                            b: {
                                fontSize: 16,
                                lineHeight: 33
                            },
                            per: {
                                color: '#eee',
                                backgroundColor: '#334455',
                                padding: [2, 4],
                                borderRadius: 2
                            }
                        }
                    },
                    data: [
                        {value: 335, name: '直达'},
                        {value: 310, name: '邮件营销'},
                        {value: 234, name: '联盟广告'},
                        {value: 135, name: '视频广告'},
                        {value: 1048, name: '百度'},
                        {value: 251, name: '谷歌'},
                        {value: 147, name: '必应'},
                        {value: 102, name: '其他'}
                    ]
                }
            ]
        }
    );

}



