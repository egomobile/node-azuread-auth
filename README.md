[![npm](https://img.shields.io/npm/v/@egomobile/azuread-auth.svg)](https://www.npmjs.com/package/@egomobile/azuread-auth)
[![last build](https://img.shields.io/github/workflow/status/egomobile/node-azuread-auth/Publish)](https://github.com/egomobile/node-azuread-auth/actions?query=workflow%3APublish)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/egomobile/node-azuread-auth/pulls)

# @egomobile/azuread-auth

> A middleware for [@egomobile/http-server](https://github.com/egomobile/node-http-server), which wraps functions of [passport-azure-ad](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/maintenance/passport-azure-ad) module, written for [passport](https://www.passportjs.org/).

## Table of contents

- [Install](#install)
- [Usage](#usage)
  - [Quick example](#quick-example)

<a name="install"></a>

## Install [<a href="#toc">↑</a>]

Execute the following command from your project folder, where your
`package.json` file is stored:

```bash
npm install --save @egomobile/azuread-auth
```

<a name="usage"></a>

## Usage [<a href="#toc">↑</a>]

### Quick example [<a href="#usage">↑</a>]

```typescript
import createServer from "@egomobile/http-server";
import {
  initServerForAzureADBearerStrategy,
  withAzureADBearer,
} from "@egomobile/azuread-auth";

async function main() {
  const app = createServer();

  // this initializes the passport module and its global instance
  // to use bearer strategy in Azure AD context
  //
  // by default, the following environment variables are used
  // which represent the options of BearerStrategy by
  // 'passport-azure-ad' module:
  //
  // - [required] AZURE_AD_CLIENT_ID => IBearerStrategyOption.clientID
  // - [required] AZURE_AD_IDENTITY_METADATA => IBearerStrategyOption.identityMetadata
  // - [optional] AZURE_AD_AUDIENCE => IBearerStrategyOption.audience
  // - [optional] AZURE_AD_IS_B2C => IBearerStrategyOption.isB2C
  // - [optional] AZURE_AD_LOGGING_LEVEL => IBearerStrategyOption.loggingLevel
  // - [optional] AZURE_AD_POLICY_NAME => IBearerStrategyOption.policyName
  // - [optional] AZURE_AD_VALIDATE_ISSUER => IBearerStrategyOption.validateIssuer
  initServerForAzureADBearerStrategy(app);

  // use middleware by 'withAzureADBearer()' to validate and extract
  // bearer token by Azure AD instance
  app.get("/", [withAzureADBearer()], async (request, response) => {
    // at this point we have a value token here
    console.log("authInfo", request.authInfo);
  });

  await app.listen();
}

main().catch(console.error);
```
