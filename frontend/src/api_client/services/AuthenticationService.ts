/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MessageResponse } from '../models/MessageResponse';
import type { ResetPasswordRequest } from '../models/ResetPasswordRequest';
import type { TokenResponse } from '../models/TokenResponse';
import type { UserCreate } from '../models/UserCreate';
import type { UserLogin } from '../models/UserLogin';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthenticationService {
    /**
     * Register
     * Register a new user and organization.
     * @param requestBody
     * @returns TokenResponse Successful Response
     * @throws ApiError
     */
    public static registerAuthRegisterPost(
        requestBody: UserCreate,
    ): CancelablePromise<TokenResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Login
     * Authenticate and return a JWT token.
     * @param requestBody
     * @returns TokenResponse Successful Response
     * @throws ApiError
     */
    public static loginAuthLoginPost(
        requestBody: UserLogin,
    ): CancelablePromise<TokenResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Forgot Password
     * Send a password reset link to the user's email asynchronously.
     * @param email
     * @returns MessageResponse Successful Response
     * @throws ApiError
     */
    public static forgotPasswordAuthForgotPasswordPost(
        email: string,
    ): CancelablePromise<MessageResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/forgot-password',
            query: {
                'email': email,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Reset Password
     * Reset password using a valid reset token.
     * @param requestBody
     * @returns MessageResponse Successful Response
     * @throws ApiError
     */
    public static resetPasswordAuthResetPasswordPost(
        requestBody: ResetPasswordRequest,
    ): CancelablePromise<MessageResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/reset-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
