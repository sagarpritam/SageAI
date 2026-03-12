/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class HealthService {
    /**
     * Liveness
     * Liveness probe: verifies the application container is running.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static livenessHealthzGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/healthz',
        });
    }
    /**
     * Readiness
     * Readiness probe: verifies DB connectivity and core dependencies.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static readinessReadyzGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/readyz',
        });
    }
}
