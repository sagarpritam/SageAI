/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RiskSummary } from './RiskSummary';
import type { Vulnerability } from './Vulnerability';
/**
 * Full scan result returned to client.
 */
export type ScanResponse = {
    id: string;
    target: string;
    status: string;
    timestamp: string;
    findings: Array<Vulnerability>;
    risk_summary: RiskSummary;
};

