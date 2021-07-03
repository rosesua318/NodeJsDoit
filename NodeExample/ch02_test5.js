var calc2 = require('./calc2');

console.log('모듈로 분리한 후 - calc2.add : ' + calc2.add(30, 30));

var nconf = require('nconf');
nconf.env();
var value = nconf.get('OS');
console.log('OS 환경변수의 값 : ' + value);