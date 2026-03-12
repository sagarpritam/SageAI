/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AgentListResponse } from '../models/AgentListResponse';
import type { AssessmentRequest } from '../models/AssessmentRequest';
import type { AsyncAssessmentResponse } from '../models/AsyncAssessmentResponse';
import type { AttackPathResponse } from '../models/AttackPathResponse';
import type { PluginListingResponse } from '../models/PluginListingResponse';
import type { PluginRunAllResponse } from '../models/PluginRunAllResponse';
import type { PluginRunRequest } from '../models/PluginRunRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MultiAgentAiService {
    /**
     * Run Full Multi-Agent Security Assessment
     * Triggers the full 5-agent security assessment:
     * ReconAgent → ScannerAgent → ExploitAgent → KnowledgeGraph → ReportAgent
     *
     * For large targets use mode='quick' for a faster 2-agent run.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static runAssessmentAgentsAssessPost(
        requestBody: AssessmentRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/agents/assess',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Start Async Assessment (Background)
     * Starts multi-agent assessment in background. Poll scan results for status.
     * @param requestBody
     * @returns AsyncAssessmentResponse Successful Response
     * @throws ApiError
     */
    public static runAssessmentAsyncAgentsAssessAsyncPost(
        requestBody: AssessmentRequest,
    ): CancelablePromise<AsyncAssessmentResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/agents/assess/async',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Available Agents
     * Returns the list of AI agents available in the system.
     * @returns AgentListResponse Successful Response
     * @throws ApiError
     */
    public static listAgentsAgentsStatusGet(): CancelablePromise<AgentListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/agents/status',
        });
    }
    /**
     * Get Attack Paths from Knowledge Graph
     * Retrieve stored attack paths from the Security Knowledge Graph.
     * @returns AttackPathResponse Successful Response
     * @throws ApiError
     */
    public static getAttackPathsAgentsGraphPathsGet(): CancelablePromise<AttackPathResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/agents/graph/paths',
        });
    }
    /**
     * Plugin Marketplace Listing
     * Lists all available security plugins with metadata.
     * @returns PluginListingResponse Successful Response
     * @throws ApiError
     */
    public static listPluginsAgentsPluginsGet(): CancelablePromise<PluginListingResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/agents/plugins',
        });
    }
    /**
     * Run a Specific Plugin
     * Run a named security plugin against a target.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static runPluginEndpointAgentsPluginsRunPost(
        requestBody: PluginRunRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/agents/plugins/run',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Run All Plugins Against a Target
     * Run all applicable plugins against a target (or filter by category).
     * @param target
     * @param category
     * @returns PluginRunAllResponse Successful Response
     * @throws ApiError
     */
    public static runAllPluginsEndpointAgentsPluginsRunAllPost(
        target: string,
        category?: (string | null),
    ): CancelablePromise<PluginRunAllResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/agents/plugins/run-all',
            query: {
                'target': target,
                'category': category,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
