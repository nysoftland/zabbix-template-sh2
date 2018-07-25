To run test

1. install grunt in global
```
npm -g install grunt-cli
```

2. config azure-cli with default account:
https://github.com/Azure/azure-xplat-cli
```
azure login
```


3. Install dependencies and run tests
```
npm install
grunt
```

4. Test config 
Testing config is located at conf.json
{
    "location": "westus",
    "resourcePrefix": "",
    "tagName": "",
    "vmCount": 2,
    "adminPassword": ""
}

Set the following Environment variable with MONICAKE_ prefix to customize your testing.
e.g.
MONICAKE_location=chinaeast

will update location to 'chinaeast'