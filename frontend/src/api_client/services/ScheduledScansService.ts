/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ScheduledScansService {
    /**
     * Create Schedule
     * Create a scheduled scan (admin only).
     * @param target
     * @param frequency
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createScheduleSchedulesPost(
        target: string,
        frequency: string = 'weekly',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/schedules',
            query: {
                'target': target,
                'frequency': frequency,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Schedules
     * List all scheduled scans for the organization.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listSchedulesSchedulesGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/schedules',
        });
    }
    /**
     * Delete Schedule
     * Delete a scheduled scan.
     * @param scheduleId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteScheduleSchedulesScheduleIdDelete(
        scheduleId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/schedules/{schedule_id}',
            path: {
                'schedule_id': scheduleId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
