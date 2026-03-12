/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AutoFixRequest = {
    /**
     * GitHub repo in 'owner/repo' format
     */
    repository: string;
    /**
     * Branch to scan and fix
     */
    branch?: string;
    /**
     * Max number of vulnerabilities to fix
     */
    max_fixes?: number;
};

