var conf = require('./conf.json');
var nconf = {};

for(var property in conf){
    var envName = "MONICAKE_" + property;
    if(process.env[envName]){
        val = process.env[envName];
    }else {
        val = conf[property];
    }
    
    nconf[property] = val;
}

if (!module.parent) {
    console.log(nconf);
}

module.exports = nconf;
