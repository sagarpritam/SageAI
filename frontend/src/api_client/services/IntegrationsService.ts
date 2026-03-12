/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GitHubTokenRequest } from '../models/GitHubTokenRequest';
import type { IntegrationStatusResponse } from '../models/IntegrationStatusResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class IntegrationsService {
    /**
     * Get Github Integration Status
     * Check if the organization has a GitHub Token configured.
     * @returns IntegrationStatusResponse Successful Response
     * @throws ApiError
     */
    public static getGithubIntegrationStatusIntegrationsGithubStatusGet(): CancelablePromise<IntegrationStatusResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/integrations/github/status',
        });
    }
    /**
     * Set Github Token
     * Securely encrypt and store a GitHub Personal Access Token for the organization.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static setGithubTokenIntegrationsGithubTokenPost(
        requestBody: GitHubTokenRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/integrations/github/token',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Github Token
     * Remove the GitHub Personal Access Token for the organization.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteGithubTokenIntegrationsGithubTokenDelete(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/integrations/github/token',
        });
    }
}
