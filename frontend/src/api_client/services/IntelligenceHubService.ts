/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IntelligenceSweepRequest } from '../models/IntelligenceSweepRequest';
import type { ModuleScanRequest } from '../models/ModuleScanRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class IntelligenceHubService {
    /**
     * Run Intelligence Sweep
     * Run a full intelligence sweep across all OSINT modules.
     *
     * This is the 'Blacklight' — the full 9-module intelligence pipeline.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static runIntelligenceSweepIntelligenceSweepPost(
        requestBody: IntelligenceSweepRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/intelligence/sweep',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Run Shodan Scan
     * 01 // SHODAN: THE PANOPTICON — Device & infrastructure search.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static runShodanScanIntelligenceShodanPost(
        requestBody: ModuleScanRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/intelligence/shodan',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Run Censys Scan
     * 08 // CENSYS: THE GLOBAL RADAR — Server & certificate monitoring.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static runCensysScanIntelligenceCensysPost(
        requestBody: ModuleScanRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/intelligence/censys',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Run Intelx Search
     * 06 // INTEL X: THE ARCHIVE OF SECRETS — Breach & dark web archives.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static runIntelxSearchIntelligenceIntelxPost(
        requestBody: ModuleScanRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/intelligence/intelx',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Run Osint Industries
     * 09 // OSINT INDUSTRIES: THE INTERCEPTOR — Email/phone correlation.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static runOsintIndustriesIntelligenceOsintIndustriesPost(
        requestBody: ModuleScanRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/intelligence/osint-industries',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Run Spiderfoot
     * 04 // SPIDERFOOT: RECON AUTOMATION — Multi-source profiling.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static runSpiderfootIntelligenceSpiderfootPost(
        requestBody: ModuleScanRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/intelligence/spiderfoot',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Run Recon Ng
     * 07 // RECON-NG: THE FRAMEWORK — Modular recon.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static runReconNgIntelligenceReconNgPost(
        requestBody: ModuleScanRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/intelligence/recon-ng',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Run Darkweb Search
     * 03 // BABEL X: THE LINGUISTIC MESH — Dark web monitoring.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static runDarkwebSearchIntelligenceDarkwebPost(
        requestBody: ModuleScanRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/intelligence/darkweb',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Run Identity Resolve
     * 05 // SOCIAL LINKS: NEURAL DE-MASKING — Identity resolution.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static runIdentityResolveIntelligenceIdentityPost(
        requestBody: ModuleScanRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/intelligence/identity',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Build Relationship Graph
     * 02 // MALTEGO: LINK ANALYSIS — Build entity relationship graph.
     *
     * Note: This requires running a full sweep first to collect data.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static buildRelationshipGraphIntelligenceGraphPost(
        requestBody: ModuleScanRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/intelligence/graph',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Intelligence Modules
     * List all available intelligence modules and their status.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listIntelligenceModulesIntelligenceModulesGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/intelligence/modules',
        });
    }
}
