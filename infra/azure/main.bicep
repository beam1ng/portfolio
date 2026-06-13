// Portfolio platform — Azure infrastructure (Container Apps + Azure SQL).
//
// STATUS: authored as a starting scaffold; NOT yet validated against a live
// deployment (no Azure subscription was available). Review and `az bicep build`
// before deploying. See README.md in this folder for the runbook and caveats.
//
// Deploys: Log Analytics, a Container Apps environment, an Azure SQL serverless
// database, and two container apps (api internal, web external) that pull images
// from a registry (GHCR by default).

targetScope = 'resourceGroup'

@description('Base name for resources; keep short and lowercase.')
param appName string = 'portfolio'

@description('Azure region for all resources.')
param location string = resourceGroup().location

@description('Fully-qualified API image, e.g. ghcr.io/<owner>/portfolio-api:0.1.0')
param apiImage string

@description('Fully-qualified web image, e.g. ghcr.io/<owner>/portfolio-web:0.1.0')
param webImage string

@description('ASPNETCORE_ENVIRONMENT for the API. Note: placeholder content is only seeded in Development.')
param aspnetEnvironment string = 'Production'

@description('SQL administrator login.')
param sqlAdminLogin string

@secure()
@description('SQL administrator password.')
param sqlAdminPassword string

@secure()
@description('JWT signing key (>= 32 chars).')
param jwtSigningKey string

@description('Seeded admin email.')
param adminEmail string

@secure()
@description('Seeded admin password.')
param adminPassword string

var sqlServerName = '${appName}-sql-${uniqueString(resourceGroup().id)}'
var databaseName = 'PortfolioDb'

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: '${appName}-logs'
  location: location
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 30
  }
}

resource sqlServer 'Microsoft.Sql/servers@2023-08-01-preview' = {
  name: sqlServerName
  location: location
  properties: {
    administratorLogin: sqlAdminLogin
    administratorLoginPassword: sqlAdminPassword
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }

  // Allow other Azure services (incl. Container Apps) to reach the server.
  resource allowAzure 'firewallRules@2023-08-01-preview' = {
    name: 'AllowAzureServices'
    properties: {
      startIpAddress: '0.0.0.0'
      endIpAddress: '0.0.0.0'
    }
  }

  resource db 'databases@2023-08-01-preview' = {
    name: databaseName
    location: location
    sku: {
      name: 'GP_S_Gen5_1' // General Purpose serverless, 1 vCore — auto-pauses.
      tier: 'GeneralPurpose'
    }
    properties: {
      autoPauseDelay: 60
      minCapacity: json('0.5')
      zoneRedundant: false
    }
  }
}

var connectionString = 'Server=tcp:${sqlServer.properties.fullyQualifiedDomainName},1433;Database=${databaseName};User Id=${sqlAdminLogin};Password=${sqlAdminPassword};Encrypt=True;TrustServerCertificate=False;'

resource environment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: '${appName}-env'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

resource apiApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: '${appName}-api'
  location: location
  properties: {
    managedEnvironmentId: environment.id
    configuration: {
      ingress: {
        external: false // internal only; the web app proxies to it
        targetPort: 8080
        transport: 'http'
      }
      secrets: [
        { name: 'connection-string', value: connectionString }
        { name: 'jwt-signing-key', value: jwtSigningKey }
        { name: 'admin-password', value: adminPassword }
      ]
    }
    template: {
      containers: [
        {
          name: 'api'
          image: apiImage
          resources: { cpu: json('0.5'), memory: '1Gi' }
          env: [
            { name: 'ASPNETCORE_ENVIRONMENT', value: aspnetEnvironment }
            { name: 'ASPNETCORE_URLS', value: 'http://+:8080' }
            { name: 'ConnectionStrings__Default', secretRef: 'connection-string' }
            { name: 'Jwt__SigningKey', secretRef: 'jwt-signing-key' }
            { name: 'Admin__Email', value: adminEmail }
            { name: 'Admin__Password', secretRef: 'admin-password' }
          ]
        }
      ]
      scale: { minReplicas: 1, maxReplicas: 2 }
    }
  }
}

resource webApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: '${appName}-web'
  location: location
  properties: {
    managedEnvironmentId: environment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 80
        transport: 'auto'
      }
    }
    template: {
      containers: [
        {
          name: 'web'
          image: webImage
          resources: { cpu: json('0.25'), memory: '0.5Gi' }
          env: [
            // nginx proxies /api to the API app's internal FQDN (port 80).
            { name: 'API_UPSTREAM', value: apiApp.properties.configuration.ingress.fqdn }
          ]
        }
      ]
      scale: { minReplicas: 1, maxReplicas: 2 }
    }
  }
}

output webUrl string = 'https://${webApp.properties.configuration.ingress.fqdn}'
output apiInternalFqdn string = apiApp.properties.configuration.ingress.fqdn
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName
