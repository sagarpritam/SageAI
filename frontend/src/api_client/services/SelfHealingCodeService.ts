/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AutoFixRequest } from '../models/AutoFixRequest';
import type { AutoFixStatusResponse } from '../models/AutoFixStatusResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SelfHealingCodeService {
    /**
     * Autofix Status
     * Check if the Self-Healing Code feature is ready (GitHub token configured).
     * @returns AutoFixStatusResponse Successful Response
     * @throws ApiError
     */
    public static autofixStatusAutofixStatusGet(): CancelablePromise<AutoFixStatusResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/autofix/status',
        });
    }
    /**
     * Run Autofix
     * Run the full Self-Healing Code pipeline:
     * 1. SAST scan the repository
     * 2. AI generates secure patches for each vulnerability
     * 3. Opens GitHub Pull Requests with the fixes
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static runAutofixAutofixRunPost(
        requestBody: AutoFixRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/autofix/run',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
