/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AiExplainerService {
    /**
     * Get Explanation
     * Get an AI-powered explanation for a vulnerability type.
     *
     * Examples: `Missing Security Headers`, `Reflected XSS`, `SQL Injection`
     * @param findingType
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getExplanationExplainFindingTypeGet(
        findingType: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/explain/{finding_type}',
            path: {
                'finding_type': findingType,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
