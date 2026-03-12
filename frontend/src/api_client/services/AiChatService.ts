/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChatRequest } from '../models/ChatRequest';
import type { ChatResponse } from '../models/ChatResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AiChatService {
    /**
     * Ai Security Chat
     * Chat endpoint for the AI Security Assistant.
     * Retrieves relevant cybersecurity knowledge via RAG, and optionally injects live scan context.
     * @param requestBody
     * @returns ChatResponse Successful Response
     * @throws ApiError
     */
    public static aiSecurityChatAiChatPost(
        requestBody: ChatRequest,
    ): CancelablePromise<ChatResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/ai/chat',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
