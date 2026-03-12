/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ScanListItem } from '../models/ScanListItem';
import type { ScanRequest } from '../models/ScanRequest';
import type { ScanResponse } from '../models/ScanResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ScanningService {
    /**
     * Create Scan
     * Run a security scan against a target URL and persist results.
     * @param requestBody
     * @returns ScanResponse Successful Response
     * @throws ApiError
     */
    public static createScanScanPost(
        requestBody: ScanRequest,
    ): CancelablePromise<ScanResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/scan',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Scan
     * Retrieve a specific scan result (scoped to user's organization).
     * @param scanId
     * @returns ScanResponse Successful Response
     * @throws ApiError
     */
    public static getScanScanScanIdGet(
        scanId: string,
    ): CancelablePromise<ScanResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/scan/{scan_id}',
            path: {
                'scan_id': scanId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Scan Findings
     * Retrieve granular findings linked to a specific scan.
     * @param scanId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getScanFindingsScanScanIdFindingsGet(
        scanId: string,
    ): CancelablePromise<Array<Record<string, any>>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/scan/{scan_id}/findings',
            path: {
                'scan_id': scanId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Scans
     * List all scans for the current user's organization (multi-tenant).
     * @returns ScanListItem Successful Response
     * @throws ApiError
     */
    public static listScansScansGet(): CancelablePromise<Array<ScanListItem>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/scans',
        });
    }
}
