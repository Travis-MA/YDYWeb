var CommitCheckpointRequest = require('../model/CommitCheckpointRequest');

var entity = {};
entity.mockCommitCheckpointRequest = function(stream_name, app_name) {

  if(!stream_name) {
    throw new Error('stream name should not be null!');
  }

  if(!app_name){
    throw new Error('app name should be null!');
  }

  var commitCheckpointRequest = new CommitCheckpointRequest();
  commitCheckpointRequest.stream_name = stream_name;
  commitCheckpointRequest.app_name = app_name;
  commitCheckpointRequest.partition_id = 'shardId-0000000000';
  commitCheckpointRequest.sequence_number = '0';
  commitCheckpointRequest.metadata = 'metadata_' + stream_name + '_' + app_name;
  commitCheckpointRequest.checkpoint_type = 'LAST_READ';
  return commitCheckpointRequest;
};

module.exports = entity;