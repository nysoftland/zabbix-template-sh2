使用 Azure 资源管理器自动部署 Zabbix 监控服务：
https://www.azure.cn/documentation/articles/open-source-azure-resource-manager-zabbix

Monitoring experimental deployment.

Supported Distros: 
Server: Ubuntu 14.04 LTS,CentOS 7.1,CentOS 7.2
Agent: Ubuntu 14.04 LTS, Ubuntu 16.04 LTS, CentOS 7.1,CentOS 7.2

<a href="https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fkarataliu%2Fmonicake%2Fmaster%2Fazuredeploy.json" target="_blank">
    <img src="http://azuredeploy.net/deploybutton.png"/>
</a>
<a href="http://armviz.io/#/?load=https%3A%2F%2Fraw.githubusercontent.com%2Fkarataliu%2Fmonicake%2Fmaster%2Fazuredeploy.json" target="_blank">
    <img src="http://armviz.io/visualizebutton.png"/>
</a>

- nested/monitoringSolution.json
This will install the monitor VM to given vnet/subnet, and also install monitoring agent on all vms connected to that vnet/subnet.

[![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fkarataliu%2Fmonicake%2Fmaster%2Fnested%2FmonitoringSolution.json)


Deployment parameters:

| Parameters            | Description                                                                           |
| -------------         | -------------                                                                         |
| storageAccount        | An existing storage account in same resource group, used for storing the new VM.      |
| virtualNetworkName    | The name of vnet where current VMs connects to.                                       |
| subnetName            | The name of subnet where current VMs connects to.                                     |
| monitorVmName         | The name for the new monitoring server VM to be created.                              |
| monitorVmUsername     | The username for the new created monitoring server VM.                                |
| monitorVmPassword     | The password for the new created monitoring server VM.                                |
| mysqlHost             | The host for the backend database server, leave 'localhost' for creating a new one.   |
| mysqlDbName           | The database name for monitoring backend database.                                    |
| mysqlUser             | The database username for monitoring backend database.                                |
| mysqlPassword         | The database password for monitoring backend database.                                |

Deployment output

| Output                | Description                                                                       |
| -------------         | -------------                                                                     |
| serverPublicEndpoint  | The frontend endpoint for the monitoring serice(aka monitoring portal).           |


- nested/monitoringSolutionWithMail.json
This will install the monitor VM to given vnet/subnet, and also install monitoring agent on all vms connected to that vnet/subnet. Will add mail media with configured parameters.

[![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fkarataliu%2Fmonicake%2Fmaster%2Fnested%2FmonitoringSolutionWithMail.json)

Deployment parameters:

| Parameters            | Description                                                                           |
| -------------         | -------------                                                                         |
| storageAccount        | An existing storage account in same resource group, used for storing the new VM.      |
| virtualNetworkName    | The name of vnet where current VMs connects to.                                       |
| subnetName            | The name of subnet where current VMs connects to.                                     |
| monitorVmName         | The name for the new monitoring server VM to be created.                              |
| monitorVmUsername     | The username for the new created monitoring server VM.                                |
| monitorVmPassword     | The password for the new created monitoring server VM.                                |
| mysqlHost             | The host for the backend database server, leave 'localhost' for creating a new one.   |
| mysqlDbName           | The database name for monitoring backend database.                                    |
| mysqlUser             | The database username for monitoring backend database.                                |
| mysqlPassword         | The database password for monitoring backend database.                                |
| smtpServer            | The smtp server for mail notification, format is server:port.                         |
| smtpUser              | The smtp user for mail notification.                                                  |
| smtpPassword          | The smtp password for mail notification.                                              |
| notificationReceiver  | The receiver's email address for mail notification.                                   |

Deployment output

| Output                | Description                                                                       |
| -------------         | -------------                                                                     |
| serverPublicEndpoint  | The frontend endpoint for the monitoring serice(aka monitoring portal).           |

- nested/clusterNodes.json
This will deploy a testing cluster, for testing, please deploy this one first before other templates.

[![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fkarataliu%2Fmonicake%2Fmaster%2Fnested%2FclusterNodes.json)

- nested/monitoringServer.json
This will install monitoring server only.

[![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fkarataliu%2Fmonicake%2Fmaster%2Fnested%2FmonitoringServer.json)

- nested/monitoringAgentByVnet.json
This will install monitoring agents for given vnet/subnet.

[![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fkarataliu%2Fmonicake%2Fmaster%2Fnested%2FmonitoringAgentByVnet.json)

- nested/monitoringAgentByVms.json
This will install monitoring agents for given Vms.

[![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fkarataliu%2Fmonicake%2Fmaster%2Fnested%2FmonitoringAgentByVms.json)




