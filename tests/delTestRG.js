var testUtils   = require('./testUtils');
var yesno       = require('yesno');

testUtils.listTestResourceGroups()
    .then(function(list){
        if(list.length === 0){
            console.log("no testing resource groups found.");
            process.exit();
        }

        var names = list.map(rg => rg.name);
        console.log("The following resource groups are to be deleted:");
        names.forEach(function(name){console.log(name);}); 
        return new Promise(function(resolve, reject){
            yesno.ask('Are you sure you want to continue?', false, function(ok) {
                return resolve({
                    "answer": ok,
                    "names" : names
                });
            });    
        });})
    .then(function(input){
        if(input.answer){
            return Promise.all(input.names.map(name => testUtils.delResourceGroup(name)));
        }else{
            return Promise.resolve();
        }
    })
    .catch(function(err){
        console.log('error occured:' + err);
    })
    .then(function(){
        process.exit();
    });