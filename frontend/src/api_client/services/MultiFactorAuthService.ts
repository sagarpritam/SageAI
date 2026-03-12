/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MFASetupResponse } from '../models/MFASetupResponse';
import type { MFAStateResponse } from '../models/MFAStateResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MultiFactorAuthService {
    /**
     * Setup Mfa
     * Generate TOTP secret and QR code for authenticator app setup.
     * @returns MFASetupResponse Successful Response
     * @throws ApiError
     */
    public static setupMfaAuthMfaSetupPost(): CancelablePromise<MFASetupResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/mfa/setup',
        });
    }
    /**
     * Verify Mfa
     * Verify TOTP code and activate MFA.
     * @param code
     * @returns MFAStateResponse Successful Response
     * @throws ApiError
     */
    public static verifyMfaAuthMfaVerifyPost(
        code: string,
    ): CancelablePromise<MFAStateResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/mfa/verify',
            query: {
                'code': code,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Disable Mfa
     * Disable MFA (requires valid TOTP code).
     * @param code
     * @returns MFAStateResponse Successful Response
     * @throws ApiError
     */
    public static disableMfaAuthMfaDisablePost(
        code: string,
    ): CancelablePromise<MFAStateResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/mfa/disable',
            query: {
                'code': code,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
