/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WebhooksService {
    /**
     * Create Webhook
     * Register a webhook endpoint (admin only).
     * @param url
     * @param event
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createWebhookWebhooksPost(
        url: string,
        event: string = 'scan.completed',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/webhooks',
            query: {
                'url': url,
                'event': event,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Webhooks
     * List all webhooks for the organization.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listWebhooksWebhooksGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/webhooks',
        });
    }
    /**
     * Delete Webhook
     * Delete a webhook.
     * @param webhookId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteWebhookWebhooksWebhookIdDelete(
        webhookId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/webhooks/{webhook_id}',
            path: {
                'webhook_id': webhookId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
