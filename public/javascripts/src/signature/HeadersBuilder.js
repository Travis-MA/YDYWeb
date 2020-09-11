var DefaultSigner = require('./DefaultSigner');
var moment = require('./moment');

var buildAuthorization = function (ENVIRONMENTS, httpMethod, canonicalURI, canonicalQuery, httpBodyStr) {

  var defaultSigner = new DefaultSigner(ENVIRONMENTS);

  var cononicalRequestStr = [httpMethod, canonicalURI,
    defaultSigner.getCanonicalizedQueryString(canonicalQuery),
    defaultSigner.getCanonicalizedHeaderString(
      ENVIRONMENTS.HOST, ENVIRONMENTS.PROJECTID, ENVIRONMENTS.X_SDK_DATE) + '\n',
    defaultSigner.getSignedHeadersString(),
    defaultSigner.getContentHash(httpBodyStr)].join('\n');

  var stringToSign = defaultSigner.createStringToSign(
    ENVIRONMENTS.X_SDK_DATE, ENVIRONMENTS.REGIONNAME, cononicalRequestStr, ENVIRONMENTS.SERVICENAME);
  var signingKey = defaultSigner.createSigningKey(
    ENVIRONMENTS.SK, ENVIRONMENTS.X_SDK_DATE, ENVIRONMENTS.REGIONNAME);

  var signature = defaultSigner.sign(stringToSign, signingKey);


  var x_sdk_date_yymmdd = moment(ENVIRONMENTS.X_SDK_DATE).utc().format('YYYYMMDD');
  return 'SDK-HMAC-SHA256 ' +
    ['Credential=' + [ENVIRONMENTS.AK, x_sdk_date_yymmdd, ENVIRONMENTS.REGIONNAME, ENVIRONMENTS.SERVICENAME, 'sdk_request'].join('/'),
    'SignedHeaders=' + defaultSigner.getSignedHeadersString(),
    'Signature=' + signature].join(', ');
};

var HeadersBuilder = function (CONF) {
  this.ENVIRONMENTS = Object.assign({
    X_SDK_DATE: moment().utc().format('YYYYMMDDTHHmmss') + 'Z',
    //X_SDK_DATE: '20190626T090949Z',
    HOST: 'dis.' + CONF.REGIONNAME + '.myhuaweicloud.com',
    SERVICENAME: 'dis',
    X_PROJECT_ID: CONF.PROJECTID,
    X_SDK_VERSION: '1.0.0/nodejs',
    CONTENT_TYPE: 'application/json; charset=utf-8',
    ACCEPT: '*/*; charset=utf-8'
  }, CONF);
};

HeadersBuilder.prototype.header = function (httpMethod, url, search, httpBody) {
  url = url.trim();
  if(url.indexOf('/v') < 0){
    throw new Error('The url should contain "/v1" or "/v2"'); 
  }
  var uri = url.slice(url.indexOf('/v'));
  if(uri.lastIndexOf('/') !== uri.length-1){
    uri = uri + '/';
  }
  
  var authorization = buildAuthorization(this.ENVIRONMENTS, httpMethod, uri, search, httpBody).trim();
  return {
    'host': this.ENVIRONMENTS.HOST,
    'x-project-id': this.ENVIRONMENTS.PROJECTID,
    'x-sdk-date': this.ENVIRONMENTS.X_SDK_DATE,
    'x-sdk-version': this.ENVIRONMENTS.X_SDK_VERSION,
    'content-type': this.ENVIRONMENTS.CONTENT_TYPE,
    'accept': this.ENVIRONMENTS.ACCEPT,
    'authorization': authorization
  };
};

module.exports = HeadersBuilder;
