/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CommandRequest } from '../models/CommandRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AiCommandsService {
    /**
     * Execute Ai Command
     * Translates a natural language command into specific security tool operations,
     * executes them concurrently, analyzes the results, and returns an executive summary.
     *
     * Example Command: "Scan for XSS and check SSL"
     * Example Target: "https://example.com"
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static executeAiCommandAiCommandPost(
        requestBody: CommandRequest,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/ai/command',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
