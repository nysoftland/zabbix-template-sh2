// Testing util using default account.
"use strict";

var conf = require('./conf');
var client = require('azure-cli/lib/util/utils')
  .createResourceClient(require("azure-cli/lib/util/profile").current.getSubscription());
var crypto = require('crypto');
var exec = require('child_process').exec;

const artifactsLocationBase = "https://raw.githubusercontent.com/karataliu/monicake/";

function getArtifactsLocation() {
  return new Promise(function (resolve, reject) {
    exec("git rev-parse --abbrev-ref HEAD", function (error, stdout) {
      if (error) reject(error);
      else resolve(artifactsLocationBase + stdout.trim());
    });
  });
}

function createTestResourceGroup(rgName) {
  const parameters = {
    "location": conf.location,
    "tags": {
      [conf.tagName]: '1'
    }
  };

  console.log("Creating resource group %s at location %s.", rgName, conf.location);
  return new Promise(function (fulfill, reject) {
    client.resourceGroups.createOrUpdate(rgName, parameters, function (err, res) {
      if (err) reject(err);
      else fulfill(res);
    });
  }).then(function (res) {
    return res.name;
  });
}

function createDeployment(rgName, template, templateParameters) {
  return new Promise(function (resolve, reject) {
    if (template.parameters._artifactsLocation &&
      template.parameters._artifactsLocation.value &&
      template.parameters._artifactsLocation.value.startsWith("https://raw.githubusercontent.com")) {
      getArtifactsLocation().then(location => {
        templateParameters._artifactsLocation = {
          "value": location
        };
      }).then(resolve);
    } else {
      resolve();
    }
  }).then(function () {
    const parameters = {
      "properties": {
        "template": template,
        "parameters": templateParameters,
        "mode": "Incremental"
      }
    };

    console.log("Creating deployment on resource group %s.", rgName);
    return new Promise(function (fulfill, reject) {
      client.deployments.createOrUpdate(rgName, 'testDeployment', parameters, function (err, res) {
        if (err) reject(err);
        else fulfill(res);
      });
    });
  });
}

function createTestEnvDeployment(rgName, resourcePrefix) {
  return createDeployment(rgName, require('../nested/clusterNodes.json'), {
    "resourcePrefix": {
      "value": resourcePrefix
    },
    "adminPassword": {
      "value": conf.adminPassword
    },
    "vmCount": {
      "value": conf.vmCount
    }
  });
}

exports.createDeployment = createDeployment;

exports.createTestEnv = function (mock) {
  if (mock) {
    return Promise.resolve(mock);
  }

  const dateStr = new Date().toISOString().replace(new RegExp(':', 'g'), '-');
  const dateHash = crypto.createHash('md5').update(dateStr).digest('hex').substring(0, 2);

  return createTestResourceGroup(conf.resourcePrefix + dateStr).then(function (rg) {
    return createTestEnvDeployment(rg, conf.resourcePrefix + dateHash);
  }).then(function (res) {
    var outputs = res.properties.outputs;
    return {
      "resourceGroup": outputs.resourceGroup.value,
      "prefix": outputs.prefix.value,
      "storageAccount": outputs.storageAccountName.value,
      "vnet": outputs.virtualNetworkName.value
    };
  });
};

exports.listTestResourceGroups = function () {
  return new Promise(function (fulfill, reject) {
    client.resourceGroups.list({ "filter": "tagname eq '" + conf.tagName + "'" }, function (err, res) {
      if (err) reject(err);
      else fulfill(res);
    });
  });
};

exports.delResourceGroup = function (rgName) {
  console.log("Deleting resource group %s.", rgName);
  return new Promise(function (resolve, reject) {
    return client.resourceGroups.deleteMethod(rgName, function (err, res) {
      if (err) reject(err);
      else resolve(rgName);
    });
  }).then(function () {
    console.log("Deleted: %s.", rgName);
  });
};