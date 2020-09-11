var DISClientBuilder = {};
var DIS = require('./DIS');

DISClientBuilder.buildRecordApi = function(CONF){
  return new DIS.RecordApi(new DIS.ApiClient(CONF));
};

DISClientBuilder.buildStreamApi = function(CONF){
  return new DIS.StreamApi(new DIS.ApiClient(CONF));
};

DISClientBuilder.buildCheckpointApi = function(CONF){
  return new DIS.CheckpointApi(new DIS.ApiClient(CONF));
};

module.exports = DISClientBuilder;
