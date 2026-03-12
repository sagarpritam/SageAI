/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReportsService {
    /**
     * Get Report Json
     * Get a JSON report for a completed scan.
     * @param scanId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getReportJsonReportsScanIdGet(
        scanId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/{scan_id}',
            path: {
                'scan_id': scanId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Report Pdf
     * Download a professional PDF security report for a completed scan.
     * @param scanId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getReportPdfReportsScanIdPdfGet(
        scanId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/{scan_id}/pdf',
            path: {
                'scan_id': scanId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Hackerone Report
     * Download a HackerOne-formatted Markdown report for Bug Bounty submission.
     * @param scanId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getHackeroneReportReportsScanIdHackeroneGet(
        scanId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/{scan_id}/hackerone',
            path: {
                'scan_id': scanId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
