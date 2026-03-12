/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ApiKeysService {
    /**
     * Create Api Key
     * Create a new API key (admin only). The key is shown only once.
     * @param name
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createApiKeyApiKeysPost(
        name: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api-keys',
            query: {
                'name': name,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Api Keys
     * List all API keys for the organization (admin only).
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listApiKeysApiKeysGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api-keys',
        });
    }
    /**
     * Revoke Api Key
     * Revoke an API key (admin only).
     * @param keyId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static revokeApiKeyApiKeysKeyIdDelete(
        keyId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api-keys/{key_id}',
            path: {
                'key_id': keyId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
