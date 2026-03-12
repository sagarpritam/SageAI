/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DiscoveryRequest } from '../models/DiscoveryRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AssetInventoryService {
    /**
     * Trigger Asset Discovery
     * Trigger full attack surface discovery for a root domain.
     * Runs the full pipeline: crt.sh → DNS → Shodan → HTTP probe → risk scoring → DB upsert.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static triggerDiscoveryAssetsDiscoverPost(
        requestBody: DiscoveryRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/assets/discover',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Trigger Asset Discovery (Synchronous)
     * Synchronous asset discovery — waits for completion and returns full summary.
     * Best for smaller target domains (< 20 subdomains).
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static triggerDiscoverySyncAssetsDiscoverSyncPost(
        requestBody: DiscoveryRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/assets/discover/sync',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Asset Inventory Summary
     * Returns aggregated counts for the organization's attack surface.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getAssetSummaryAssetsSummaryGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/assets/summary',
        });
    }
    /**
     * List All Assets
     * List discovered assets with optional filtering by type, risk level, and status.
     * @param assetType
     * @param riskLevel
     * @param status
     * @param limit
     * @param offset
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listAssetsAssetsGet(
        assetType?: (string | null),
        riskLevel?: (string | null),
        status?: (string | null),
        limit: number = 100,
        offset?: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/assets',
            query: {
                'asset_type': assetType,
                'risk_level': riskLevel,
                'status': status,
                'limit': limit,
                'offset': offset,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get High Risk Assets
     * Return Critical and High risk assets sorted by risk score.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getHighRiskAssetsAssetsHighRiskGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/assets/high-risk',
        });
    }
    /**
     * Recently Discovered Assets
     * Assets discovered in the last N hours.
     * @param hours
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getNewAssetsAssetsNewGet(
        hours: number = 24,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/assets/new',
            query: {
                'hours': hours,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Asset Detail
     * Get full detail for a specific asset including Shodan/SSL data.
     * @param assetId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getAssetAssetsAssetIdGet(
        assetId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/assets/{asset_id}',
            path: {
                'asset_id': assetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Asset
     * Remove a discovered asset from inventory.
     * @param assetId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteAssetAssetsAssetIdDelete(
        assetId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/assets/{asset_id}',
            path: {
                'asset_id': assetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
