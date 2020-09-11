
var crypto = require('crypto');
var moment = require('./moment');

var DefaultSigner = function (ENVIRONMENTS) {
  this.ENVIRONMENTS = ENVIRONMENTS;
};
/*
  对象转成location.search一般的字符串
  {
    limit: 10,
    startStreamName: 'py_dis_test1'
  } => limit=10&startStreamName=py_dis_test1"

*/
DefaultSigner.prototype.getCanonicalizedQueryString = function (canonicalQuery) {
  if (!canonicalQuery) {
    return '';
  }
  if (!Object.keys(canonicalQuery).length) {
    return '';
  }
  return Object.entries(canonicalQuery)
    .filter(function (var1) {
      return !!var1[1];
    })
    .sort(function (var1, var2) {
      return var1[0].localeCompare(var2[0]);
    })
    .map(function (arr) {
      return arr.map(function (ele) {
        return encodeURIComponent(ele);
      }).join('=');
    })
    .join('&');
};

DefaultSigner.prototype.getCanonicalizedHeaderString = function (host, projectId, x_sdk_date) {

  if (typeof host !== 'string') {
    console.error('host is not a string');
    return;
  }

  if (typeof projectId !== 'string') {
    console.error('projectId is not a string');
    return;
  }

  if (typeof x_sdk_date !== 'string') {
    console.error('x_sdk_date is not a string');
    return;
  }

  var headers = {
    'host': this.ENVIRONMENTS.HOST,
    'x-project-id': this.ENVIRONMENTS.X_PROJECT_ID,
    'x-sdk-date': this.ENVIRONMENTS.X_SDK_DATE,
    'x-sdk-version': this.ENVIRONMENTS.X_SDK_VERSION,
    'content-type': this.ENVIRONMENTS.CONTENT_TYPE,
    'accept': this.ENVIRONMENTS.ACCEPT
  };

  return Object.keys(headers).sort(function (var1, var2) {
    return var1.toLowerCase().charCodeAt() - var2.toLowerCase().charCodeAt();
  }).map(function (v) {
    return v.trim() + ':' + headers[v].trim();
  }).join('\n');
};

DefaultSigner.prototype.getSignedHeadersString = function () {
  return ['host', 'x-project-id', 'x-sdk-date', 'content-type', 'accept', 'x-sdk-version'].sort(function (var1, var2) {
    return var1.toLowerCase().charCodeAt() - var2.toLowerCase().charCodeAt();
  }).join(';');
};

DefaultSigner.prototype.getContentHash = function (httpBodyStr) {
  return crypto.createHash('sha256').update(httpBodyStr).digest('hex');
};

//产生待签名的字符串
DefaultSigner.prototype.createStringToSign = function (x_sdk_date, regionName, cononicalRequestStr, serviceName) {

  //console.log("cononicalRequest => " + cononicalRequestStr);

  var x_sdk_date_yymmdd = moment(x_sdk_date).utc().format('YYYYMMDD');
  var stringToSign = ['SDK-HMAC-SHA256', x_sdk_date,
    [x_sdk_date_yymmdd, regionName, serviceName, 'sdk_request'].join('/'),
    this.getContentHash(cononicalRequestStr)].join('\n');

  //console.log('stringToSign => ' + stringToSign);
  return stringToSign;
};

//产生signingKey
DefaultSigner.prototype.createSigningKey = function (sk, x_sdk_date, regionName) {
  var kSecret = "SDK" + sk;
  var hmacDate = crypto.createHmac('sha256', kSecret);
  var kDate = hmacDate.update(moment(x_sdk_date).utc().format('YYYYMMDD')).digest('hex');
  //console.log('kdate => ' + new Buffer.from(kDate, 'hex').toString('base64'));
  var hmacRegion = crypto.createHmac('sha256', Buffer.from(kDate, 'hex'));
  var kRegion = hmacRegion.update(regionName).digest('hex');
  //console.log('kRegion => ' + new Buffer.from(kRegion, 'hex').toString('base64'));
  var hmacService = crypto.createHmac('sha256', Buffer.from(kRegion, 'hex'));
  var kService = hmacService.update('dis').digest('hex');
  //console.log('kService => ' + new Buffer.from(kService, 'hex').toString('base64'));
  var hmacSigningKey = crypto.createHmac('sha256', Buffer.from(kService, 'hex'));
  var kSigningKey = hmacSigningKey.update('sdk_request').digest('hex');
  //console.log('kSigningKey => ' + new Buffer.from(kSigningKey, 'hex').toString('base64'));
  return kSigningKey;
};

DefaultSigner.prototype.sign = function (stringToSign, signingKey) {
  //console.log('stringToSign => ' + stringToSign );
  //console.log('signingKey => ' + new Buffer.from(signingKey, 'hex').toString('base64'));
  var hmacSignature = crypto.createHmac('sha256', Buffer.from(signingKey, 'hex'));
  var kSignature = hmacSignature.update(stringToSign).digest('hex');
  //console.log('signature => ' + new Buffer.from(kSignature, 'hex').toString('base64'));
  return kSignature;
};

module.exports = DefaultSigner;

