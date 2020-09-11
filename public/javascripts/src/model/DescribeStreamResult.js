/**
 * DIS
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: 1.3.0
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.4.5
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/PartitionResult'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./PartitionResult'));
  } else {
    // Browser globals (root is window)
    if (!root.Dis) {
      root.Dis = {};
    }
    root.Dis.DescribeStreamResult = factory(root.Dis.ApiClient, root.Dis.PartitionResult);
  }
}(this, function(ApiClient, PartitionResult) {
  'use strict';




  /**
   * The DescribeStreamResult model module.
   * @module model/DescribeStreamResult
   * @version 1.3.0
   */

  /**
   * Constructs a new <code>DescribeStreamResult</code>.
   * @alias module:model/DescribeStreamResult
   * @class
   */
  var exports = function() {
    var _this = this;









  };

  /**
   * Constructs a <code>DescribeStreamResult</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/DescribeStreamResult} obj Optional instance to populate.
   * @return {module:model/DescribeStreamResult} The populated <code>DescribeStreamResult</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('stream_name')) {
        obj['stream_name'] = ApiClient.convertToType(data['stream_name'], 'String');
      }
      if (data.hasOwnProperty('create_time')) {
        obj['create_time'] = ApiClient.convertToType(data['create_time'], 'Number');
      }
      if (data.hasOwnProperty('last_modified_time')) {
        obj['last_modified_time'] = ApiClient.convertToType(data['last_modified_time'], 'Number');
      }
      if (data.hasOwnProperty('retentionPeriod')) {
        obj['retentionPeriod'] = ApiClient.convertToType(data['retentionPeriod'], 'Number');
      }
      if (data.hasOwnProperty('status')) {
        obj['status'] = ApiClient.convertToType(data['status'], 'String');
      }
      if (data.hasOwnProperty('stream_type')) {
        obj['stream_type'] = ApiClient.convertToType(data['stream_type'], 'String');
      }
      if (data.hasOwnProperty('partitions')) {
        obj['partitions'] = ApiClient.convertToType(data['partitions'], [PartitionResult]);
      }
      if (data.hasOwnProperty('has_more_partitions')) {
        obj['has_more_partitions'] = ApiClient.convertToType(data['has_more_partitions'], 'Boolean');
      }
    }
    return obj;
  }

  /**
   * Name of the DIS stream.
   * @member {String} stream_name
   */
  exports.prototype['stream_name'] = undefined;
  /**
   * Timestamp at which the DIS stream was created.
   * @member {Number} create_time
   */
  exports.prototype['create_time'] = undefined;
  /**
   * Timestamp at which the DIS stream was most recently modified.
   * @member {Number} last_modified_time
   */
  exports.prototype['last_modified_time'] = undefined;
  /**
   * Period of time for which data is retained in the DIS stream.
   * @member {Number} retentionPeriod
   */
  exports.prototype['retentionPeriod'] = undefined;
  /**
   * Current status of the DIS stream.
   * @member {module:model/DescribeStreamResult.StatusEnum} status
   */
  exports.prototype['status'] = undefined;
  /**
   * Partition Type.
   * @member {module:model/DescribeStreamResult.StreamTypeEnum} stream_type
   */
  exports.prototype['stream_type'] = undefined;
  /**
   * A list of partitions that comprise the DIS stream.
   * @member {Array.<module:model/PartitionResult>} partitions
   */
  exports.prototype['partitions'] = undefined;
  /**
   * An indicator of whether there are more matching partitions of the DIS stream to list.
   * @member {Boolean} has_more_partitions
   * @default false
   */
  exports.prototype['has_more_partitions'] = false;


  /**
   * Allowed values for the <code>status</code> property.
   * @enum {String}
   * @readonly
   */
  exports.StatusEnum = {
    /**
     * value: "CREATING"
     * @const
     */
    "CREATING": "CREATING",
    /**
     * value: "RUNNING"
     * @const
     */
    "RUNNING": "RUNNING",
    /**
     * value: "TERMINATING"
     * @const
     */
    "TERMINATING": "TERMINATING"  };

  /**
   * Allowed values for the <code>stream_type</code> property.
   * @enum {String}
   * @readonly
   */
  exports.StreamTypeEnum = {
    /**
     * value: "COMMON"
     * @const
     */
    "COMMON": "COMMON",
    /**
     * value: "ADVANCED"
     * @const
     */
    "ADVANCED": "ADVANCED"  };


  return exports;
}));

