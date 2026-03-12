/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BillingService {
    /**
     * Create Checkout Session
     * Create a Stripe checkout session for plan upgrade.
     * @param plan
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createCheckoutSessionBillingCheckoutPost(
        plan: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/billing/checkout',
            query: {
                'plan': plan,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Stripe Webhook
     * Handle Stripe webhook events.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static stripeWebhookBillingWebhookPost(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/billing/webhook',
        });
    }
    /**
     * Create Portal Session
     * Create a Stripe customer portal session for managing subscription.
     * @param customerId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createPortalSessionBillingPortalGet(
        customerId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/billing/portal',
            query: {
                'customer_id': customerId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
