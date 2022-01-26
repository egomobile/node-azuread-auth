/* eslint-disable spaced-comment */

// This file is part of the @egomobile/azuread-auth distribution.
// Copyright (c) Next.e.GO Mobile SE, Aachen, Germany (https://e-go-mobile.com/)
//
// @egomobile/azuread-auth is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as
// published by the Free Software Foundation, version 3.
//
// @egomobile/azuread-auth is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

/// <reference path="../index.d.ts" />

import Passport, { AuthenticateOptions } from 'passport';
import PassportAzureAd, { BearerStrategy, IBearerStrategyOption } from 'passport-azure-ad';
import { HttpMiddleware, IHttpServer } from '@egomobile/http-server';
import { isNil, isTruely } from './utils/internal';
import type { Nilable } from './types/internal';

/**
 * Options for 'initServerForAzureADBearerStrategy()' function.
 */
export interface IInitServerForAzureADOptions {
    /**
     * Options for passport stradegy.
     */
    strategyConfig?: Nilable<IBearerStrategyOption>;
}

/**
 * Options for 'withAzureADBearer()' function.
 */
export interface IWithAzureADBearerOptions {
    /**
     * Options for 'authenticate' method of passport.
     */
    authenticateOptions?: Nilable<AuthenticateOptions>;
    /**
     * Name of the stradegy. Default: 'oauth-bearer'
     */
    stradegy?: Nilable<string>;
}

const allowedLogLevels = ['info', 'warn', 'error'];

/**
 * Initializes a server and passport instance using
 * BearerStrategy in Azure AD context.
 *
 * @example
 * ```
 * import createServer from '@egomobile/http-server'
 * import { initServerForAzureADBearerStrategy, withAzureADBearer } from '@egomobile/azuread-auth'
 *
 * const app = createServer()
 *
 * // by default, the following environment variables are used
 * // which represent the options of BearerStrategy by
 * // 'passport-azure-ad' module:
 * //
 * // - [required] AZURE_AD_CLIENT_ID => IBearerStrategyOption.clientID
 * // - [required] AZURE_AD_IDENTITY_METADATA => IBearerStrategyOption.identityMetadata
 * // - [optional] AZURE_AD_AUDIENCE => IBearerStrategyOption.audience
 * // - [optional] AZURE_AD_IS_B2C => IBearerStrategyOption.isB2C
 * // - [optional] AZURE_AD_LOGGING_LEVEL => IBearerStrategyOption.loggingLevel
 * // - [optional] AZURE_AD_POLICY_NAME => IBearerStrategyOption.policyName
 * // - [optional] AZURE_AD_VALIDATE_ISSUER => IBearerStrategyOption.validateIssuer
 * initServerForAzureADBearerStrategy(app)
 *
 * app.get('/', [withAzureADBearer()], async (request, response) => {
 *   // your code ...
 * })
 *
 * app.listen()
 *   .then(() => console.log('Server now running on port ' + app.port))
 *   .catch((err) => console.error(err))
 * ```
 *
 * @param {IHttpServer} server The server instance to setup.
 * @param {Nilable<IInitServerForAzureADOptions>} [options] Custom options.
 */
export function initServerForAzureADBearerStrategy(
    server: IHttpServer,
    options?: Nilable<IInitServerForAzureADOptions>
) {
    if (!isNil(options)) {
        if (typeof options !== 'object') {
            throw new TypeError('options must be of type object');
        }
    }

    let strategyConfig = options?.strategyConfig;
    if (!strategyConfig) {
        const loggingLevel: any = process.env.AZURE_AD_LOGGING_LEVEL?.toLowerCase().trim() || undefined;
        if (loggingLevel?.length) {
            if (!allowedLogLevels.includes(loggingLevel)) {
                throw new TypeError(`AZURE_AD_LOGGING_LEVEL must be one of the following values: ${allowedLogLevels.join(', ')}`);
            }
        }

        strategyConfig = {
            identityMetadata: process.env.AZURE_AD_IDENTITY_METADATA!.trim(),
            clientID: process.env.AZURE_AD_CLIENT_ID!.trim(),
            audience: process.env.AZURE_AD_AUDIENCE?.trim() || undefined,
            policyName: process.env.AZURE_AD_POLICY_NAME?.trim() || undefined,
            isB2C: isTruely(process.env.AZURE_AD_IS_B2C),
            validateIssuer: isTruely(process.env.AZURE_AD_VALIDATE_ISSUER),
            loggingLevel
        };
    }

    const strategy = new BearerStrategy(strategyConfig, (token, done) => {
        done(null, {}, token);
    });

    server.use(Passport.initialize() as any);
    Passport.use(strategy);
}

/**
 * Creates a new middleware, which checks if an Azure AD
 * OAuth Token is valid or not, by using 'oauth-bearer'
 * stradegy.
 *
 * @example
 * ```
 * import createServer from '@egomobile/http-server'
 * import { initServerForAzureADBearerStrategy, withAzureADBearer } from '@egomobile/azuread-auth'
 *
 * const app = createServer()
 *
 * initServerForAzureADBearerStrategy(app)
 *
 * // use middleware by 'withAzureADBearer()' to validate and extract
 * // bearer token by Azure AD instance
 * app.get('/', [withAzureADBearer()], async (request, response) => {
 *   // at this point we have a value token here
 *   console.log('authInfo', request.authInfo)
 * })
 *
 * app.listen()
 *   .then(() => console.log('Server now running on port ' + app.port))
 *   .catch((err) => console.error(err))
 * ```
 *
 * @param {Nilable<IWithAzureADBearerOptions>} [options] Custom options.
 *
 * @returns {HttpMiddleware} The new middleware.
 */
export function withAzureADBearer(options?: Nilable<IWithAzureADBearerOptions>): HttpMiddleware {
    if (!isNil(options?.authenticateOptions)) {
        if (typeof options!.authenticateOptions !== 'object') {
            throw new TypeError('options.authenticateOptions must be of type object');
        }
    }

    if (!isNil(options?.stradegy)) {
        if (typeof options!.stradegy !== 'string') {
            throw new TypeError('options.stradegy must be of type string');
        }
    }

    const authenticateOpts: AuthenticateOptions = {
        session: false,

        ...(options?.authenticateOptions || {})
    };

    return Passport.authenticate(
        options?.stradegy || 'oauth-bearer',
        authenticateOpts
    ) as any;
}

export * from './types';

// export passport stuff
export const passport = Passport;
export const passportAzureAD = PassportAzureAd;
