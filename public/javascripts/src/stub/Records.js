var PutRecordsRequestEntry = require('../model/PutRecordsRequestEntry');
var PutRecordsRequest = require('../model/PutRecordsRequest');

var entity = {};
entity.mockPutRecordsRequest = function(stream_name) {
  var records = [];
  for (var i = 0; i < 10; i++) {
    var putRecordsRequestEntry = new PutRecordsRequestEntry();
    putRecordsRequestEntry.data = Buffer.from('Hello world.' + i).toString('base64');
    putRecordsRequestEntry.partition_key = Math.floor(Math.random() * 1000000) + '';
    records.push(putRecordsRequestEntry);
  }
  var putRecordsRequest = new PutRecordsRequest();
  putRecordsRequest.records = records;
  putRecordsRequest.stream_name = stream_name;
  return putRecordsRequest;
};

entity.mockGetCursorSearch = function(stream_name){
  
};

module.exports = entity;