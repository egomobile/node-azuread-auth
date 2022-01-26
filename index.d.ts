import type { ITokenPayload } from 'passport-azure-ad';

declare module 'http' {
    export interface IncomingMessage {
        /**
         * The payload of a valid token.
         */
        authInfo?: ITokenPayload;
    }
}
