/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserOut } from '../models/UserOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrganizationSaaSService {
    /**
     * Get Current Plan
     * Get the current organization's subscription plan details.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getCurrentPlanOrgPlanGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/org/plan',
        });
    }
    /**
     * List Plans
     * List all available subscription plans.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listPlansOrgPlansGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/org/plans',
        });
    }
    /**
     * List Org Users
     * List all users in the organization (admin only).
     * @returns UserOut Successful Response
     * @throws ApiError
     */
    public static listOrgUsersOrgUsersGet(): CancelablePromise<Array<UserOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/org/users',
        });
    }
    /**
     * Update User Role
     * Update a user's role (admin only).
     * @param userId
     * @param role
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateUserRoleOrgUsersUserIdRolePatch(
        userId: string,
        role: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/org/users/{user_id}/role',
            path: {
                'user_id': userId,
            },
            query: {
                'role': role,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Org Stats
     * Get organization statistics.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getOrgStatsOrgStatsGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/org/stats',
        });
    }
}
