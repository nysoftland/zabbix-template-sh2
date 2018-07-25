var conf = require('./conf');
var testUtils = require('./testUtils');
var chai = require("chai");
var assert = chai.assert;
var phantom = require('phantom');
chai.use(require("chai-as-promised"));

describe('Step Test', function () {
  var resourceGroup;
  var prefix;

  var serverInternalIp;
  var serverPublicEndpoint;

  var storageAccount;
  var vnet;

  it('CreateTestEnv', function () {
    this.timeout(1000 * 550);
    var t1 = assert.isFulfilled(testUtils.createTestEnv());
    return Promise.all([
      t1.then(console.log),
      t1.then(function (dat) {
        resourceGroup = dat.resourceGroup;
        prefix = dat.prefix;
        storageAccount = dat.storageAccount;
        vnet = dat.vnet;
        assert(prefix.startsWith(conf.resourcePrefix), "prefix not starts with expected");
        assert(resourceGroup.startsWith(conf.resourcePrefix), "rg not starts with expected");
        assert(storageAccount.length > 0, "valid storage account");
        assert(vnet.length > 0, "valid vnet");
      })
    ]);
  });

  it('CreateMonitoringServer', function () {
    assert(prefix, "Prefix should not be empty");
    assert(resourceGroup, "resourceGroup should not be empty");
    this.timeout(1000 * 660);
    var t1 = assert.isFulfilled(createMonitoringServer(resourceGroup, prefix, storageAccount, vnet));
    return Promise.all([
      t1.then(console.log),
      t1.then(function (dat) {
        serverInternalIp = dat.serverInternalIp;
        serverPublicEndpoint = dat.serverPublicEndpoint;
      })
    ]);
  });

  it('CreateMonitoringAgents', function () {
    assert(serverInternalIp, "serverInternalIp should not be empty");
    this.timeout(1000 * 550);
    var t1 = assert.isFulfilled(createMonitoringAgentsByVnet(resourceGroup, serverInternalIp, vnet));
    return t1;
  });

  it('VerifyPage', function () {
    this.retries(2);
    assert(serverPublicEndpoint, "serverPublicEndpoint should not be empty");
    this.timeout(1000 * 20);
    var t1 = assert.isFulfilled(getDiscoveredVms(serverPublicEndpoint));
    return Promise.all([
      t1.then(console.log),
      t1.then(function (list) {
        assert.equal(list.length, conf.vmCount + 1);
        assert.deepEqual(list.sort(), createExpectedVmList(prefix).sort());
      })
    ]);
  });
});

describe('Single Deployment Test', function () {
  var serverPublicEndpoint;
  var storageAccount;
  var vnet;

  it('CreateTestEnv', function () {
    this.timeout(1000 * 560);
    var t1 = assert.isFulfilled(testUtils.createTestEnv());
    return Promise.all([
      t1.then(console.log),
      t1.then(function (dat) {
        resourceGroup = dat.resourceGroup;
        prefix = dat.prefix;
        storageAccount = dat.storageAccount;
        vnet = dat.vnet;
        assert(prefix.startsWith(conf.resourcePrefix), "prefix not starts with expected");
        assert(resourceGroup.startsWith(conf.resourcePrefix), "rg not starts with expected");
        assert(storageAccount.length > 0, "valid storage account");
        assert(vnet.length > 0, "valid vnet");
      })
    ]);
  });

  it('Create Monitoring Solution', function () {
    assert(prefix, "Prefix should not be empty");
    assert(resourceGroup, "resourceGroup should not be empty");
    this.timeout(1000 * 1050);
    var t1 = assert.isFulfilled(createMonitoringSolution(resourceGroup, prefix, storageAccount, vnet));
    return Promise.all([
      t1.then(console.log),
      t1.then(function (dat) {
        serverPublicEndpoint = dat.serverPublicEndpoint;
      })
    ]);
  });

  it('Verify Monitoring Page', function () {
    this.retries(2);
    assert(serverPublicEndpoint, "serverPublicEndpoint should not be empty");
    this.timeout(1000 * 20);
    var t1 = assert.isFulfilled(getDiscoveredVms(serverPublicEndpoint));
    return Promise.all([
      t1.then(console.log),
      t1.then(function (list) {
        assert.equal(list.length, conf.vmCount + 1);
        assert.deepEqual(list.sort(), createExpectedVmList(prefix).sort());
      })
    ]);
  });
});

function createExpectedVmList(prefix) {
  expected = [prefix + "mon"];
  for (var i = 1; i <= conf.vmCount; i++) {
    expected.push(prefix + "vm" + i);
  }

  return expected;
}

function createMonitoringSolution(rgName, prefix, storageAccount, vnet) {
  var template = require('../nested/monitoringSolution.json');
  var templateParameters = {
    "existingStorageAccountName": {
      "value": storageAccount
    },
    "existingVirtualNetworkName": {
      "value": vnet
    },
    "existingSubnetName": {
      "value": "default"
    },
    "monitorVmName": {
      "value": prefix + "mon"
    },
    "monitorVmPassword": {
      "value": "testPass&"
    },
    "mysqlPassword": {
      "value": "testPass&1"
    }
  };

  return testUtils.createDeployment(rgName, template, templateParameters)
    .then(function (res) {
      var outputs = res.properties.outputs;
      return {
        "serverPublicEndpoint": outputs.serverPublicEndpoint.value
      };
    });
}


function createMonitoringServer(rgName, prefix, storageAccount, vnet, mock) {
  if (mock) return Promise.resolve(mock);
  var template = require('../nested/monitoringServer.json');
  var templateParameters = {
    "existingStorageAccountName": {
      "value": storageAccount
    },
    "existingVirtualNetworkName": {
      "value": vnet
    },
    "existingSubnetName": {
      "value": "default"
    },
    "vmName": {
      "value": prefix + "mon"
    },
    "adminPassword": {
      "value": "testPass&"
    },
    "mysqlPassword": {
      "value": "testPass&1"
    }
  };

  return testUtils.createDeployment(rgName, template, templateParameters)
    .then(function (res) {
      var outputs = res.properties.outputs;
      return {
        "serverInternalIp": outputs.serverInternalIp.value,
        "serverPublicEndpoint": outputs.serverPublicEndpoint.value
      };
    });
}

function createMonitoringAgentsByVnet(rgName, serverIp, vnet, mock) {
  if (mock) {
    return Promise.resolve();
  }

  var template = require('../nested/monitoringAgentByVnet.json');
  var templateParameters = {
    "existingVirtualNetworkName": {
      "value": vnet
    },
    "existingSubnetName": {
      "value": "default"
    },
    "serverIp": {
      "value": serverIp
    }
  };

  return testUtils.createDeployment(rgName, template, templateParameters)
    .then(function (res) {
      console.log(res);
    });
}

function delay(time) {
  return new Promise(function (fulfill) {
    setTimeout(fulfill, time);
  });
}

function getDiscoveredVms(serverEndPoint, mock) {
  if (mock)
    return Promise.resolve(['doliumtmolvecaqnwzmsvm1', 'doliumtmolvecaqnwzmsmon']);
  var page = null;
  var phInstance = null;
  return phantom.create()
    .then(function (instance) {
      phInstance = instance;
      return instance.createPage();
    })
    .then(function (pg) {
      page = pg;
      return page.open(serverEndPoint);
    })
    .then(function (status) {
      if (status !== "success")
        throw 'page not loaded.';
      return page.evaluate(function () {
        document.querySelector("input[name='name']").value = "Admin";
        document.querySelector("input[name='password']").value = "zabbix";
        document.querySelector("#enter").click();
      });
    })
    .then(function () {
      return delay(10000);
    })
    .then(function () {
      // page.render('result.png');
      return page.evaluate(function () {
        var vms = [];
        [].forEach.call(document.querySelectorAll('.link_menu'), function (span) { vms.push(span.innerText); });
        return vms;
      });
    })
    .then(function (rt) {
      phInstance.exit();
      return rt;
    });
}