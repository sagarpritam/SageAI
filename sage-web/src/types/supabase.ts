export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4";
  };
  public: {
    Tables: {
      agent_logs: {
        Row: {
          action_text: string;
          agent_name: string;
          details: string | null;
          id: string;
          scan_id: string;
          timestamp: string | null;
        };
        Insert: {
          action_text: string;
          agent_name: string;
          details?: string | null;
          id: string;
          scan_id: string;
          timestamp?: string | null;
        };
        Update: {
          action_text?: string;
          agent_name?: string;
          details?: string | null;
          id?: string;
          scan_id?: string;
          timestamp?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "agent_logs_scan_id_fkey";
            columns: ["scan_id"];
            isOneToOne: false;
            referencedRelation: "scans";
            referencedColumns: ["id"];
          },
        ];
      };
      api_keys: {
        Row: {
          created_at: string | null;
          created_by: string;
          id: string;
          is_active: boolean;
          key: string;
          last_used_at: string | null;
          name: string;
          organization_id: string;
        };
        Insert: {
          created_at?: string | null;
          created_by: string;
          id: string;
          is_active: boolean;
          key: string;
          last_used_at?: string | null;
          name: string;
          organization_id: string;
        };
        Update: {
          created_at?: string | null;
          created_by?: string;
          id?: string;
          is_active?: boolean;
          key?: string;
          last_used_at?: string | null;
          name?: string;
          organization_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "api_keys_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "api_keys_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      asm_events: {
        Row: {
          asset_id: string | null;
          created_at: string;
          description: string | null;
          details: string;
          event_type: Database["public"]["Enums"]["asmeventtype"];
          id: string;
          is_alert_sent: boolean;
          organization_id: string;
          scan_id: string | null;
          severity: Database["public"]["Enums"]["asmeventseverity"];
          title: string;
        };
        Insert: {
          asset_id?: string | null;
          created_at: string;
          description?: string | null;
          details: string;
          event_type: Database["public"]["Enums"]["asmeventtype"];
          id: string;
          is_alert_sent: boolean;
          organization_id: string;
          scan_id?: string | null;
          severity: Database["public"]["Enums"]["asmeventseverity"];
          title: string;
        };
        Update: {
          asset_id?: string | null;
          created_at?: string;
          description?: string | null;
          details?: string;
          event_type?: Database["public"]["Enums"]["asmeventtype"];
          id?: string;
          is_alert_sent?: boolean;
          organization_id?: string;
          scan_id?: string | null;
          severity?: Database["public"]["Enums"]["asmeventseverity"];
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "asm_events_asset_id_fkey";
            columns: ["asset_id"];
            isOneToOne: false;
            referencedRelation: "assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "asm_events_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "asm_events_scan_id_fkey";
            columns: ["scan_id"];
            isOneToOne: false;
            referencedRelation: "scans";
            referencedColumns: ["id"];
          },
        ];
      };
      assets: {
        Row: {
          asset_type: Database["public"]["Enums"]["assettype"];
          created_at: string;
          discovered_in_scan: string | null;
          dns_records: string;
          first_seen: string;
          http_status: number | null;
          http_title: string | null;
          id: string;
          ip_address: string | null;
          is_verified: boolean;
          last_scanned: string | null;
          last_seen: string;
          open_ports: string;
          organization_id: string;
          risk_level: string;
          risk_score: number;
          risk_summary: string;
          shodan_data: string;
          ssl_info: string;
          status: Database["public"]["Enums"]["assetstatus"];
          technologies: string;
          updated_at: string;
          value: string;
          verification_method: string | null;
          verification_token: string | null;
          verified_at: string | null;
          virustotal_data: string;
        };
        Insert: {
          asset_type: Database["public"]["Enums"]["assettype"];
          created_at: string;
          discovered_in_scan?: string | null;
          dns_records: string;
          first_seen: string;
          http_status?: number | null;
          http_title?: string | null;
          id: string;
          ip_address?: string | null;
          is_verified: boolean;
          last_scanned?: string | null;
          last_seen: string;
          open_ports: string;
          organization_id: string;
          risk_level: string;
          risk_score: number;
          risk_summary: string;
          shodan_data: string;
          ssl_info: string;
          status: Database["public"]["Enums"]["assetstatus"];
          technologies: string;
          updated_at: string;
          value: string;
          verification_method?: string | null;
          verification_token?: string | null;
          verified_at?: string | null;
          virustotal_data: string;
        };
        Update: {
          asset_type?: Database["public"]["Enums"]["assettype"];
          created_at?: string;
          discovered_in_scan?: string | null;
          dns_records?: string;
          first_seen?: string;
          http_status?: number | null;
          http_title?: string | null;
          id?: string;
          ip_address?: string | null;
          is_verified?: boolean;
          last_scanned?: string | null;
          last_seen?: string;
          open_ports?: string;
          organization_id?: string;
          risk_level?: string;
          risk_score?: number;
          risk_summary?: string;
          shodan_data?: string;
          ssl_info?: string;
          status?: Database["public"]["Enums"]["assetstatus"];
          technologies?: string;
          updated_at?: string;
          value?: string;
          verification_method?: string | null;
          verification_token?: string | null;
          verified_at?: string | null;
          virustotal_data?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assets_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      attack_surface_diffs: {
        Row: {
          asset_id: string | null;
          created_at: string | null;
          current_scan_id: string;
          id: string;
          organization_id: string;
          overall_risk_shift: string | null;
          ports_diff: string | null;
          previous_scan_id: string | null;
          subdomains_diff: string | null;
          technologies_diff: string | null;
          vulnerabilities_diff: string | null;
        };
        Insert: {
          asset_id?: string | null;
          created_at?: string | null;
          current_scan_id: string;
          id: string;
          organization_id: string;
          overall_risk_shift?: string | null;
          ports_diff?: string | null;
          previous_scan_id?: string | null;
          subdomains_diff?: string | null;
          technologies_diff?: string | null;
          vulnerabilities_diff?: string | null;
        };
        Update: {
          asset_id?: string | null;
          created_at?: string | null;
          current_scan_id?: string;
          id?: string;
          organization_id?: string;
          overall_risk_shift?: string | null;
          ports_diff?: string | null;
          previous_scan_id?: string | null;
          subdomains_diff?: string | null;
          technologies_diff?: string | null;
          vulnerabilities_diff?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "attack_surface_diffs_asset_id_fkey";
            columns: ["asset_id"];
            isOneToOne: false;
            referencedRelation: "assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attack_surface_diffs_current_scan_id_fkey";
            columns: ["current_scan_id"];
            isOneToOne: false;
            referencedRelation: "scans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attack_surface_diffs_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attack_surface_diffs_previous_scan_id_fkey";
            columns: ["previous_scan_id"];
            isOneToOne: false;
            referencedRelation: "scans";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          action: string;
          created_at: string | null;
          details: string | null;
          id: string;
          ip_address: string | null;
          organization_id: string;
          resource_id: string | null;
          resource_type: string;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string | null;
          details?: string | null;
          id: string;
          ip_address?: string | null;
          organization_id: string;
          resource_id?: string | null;
          resource_type: string;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string | null;
          details?: string | null;
          id?: string;
          ip_address?: string | null;
          organization_id?: string;
          resource_id?: string | null;
          resource_type?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      findings: {
        Row: {
          asset_identified: string | null;
          assigned_to: string | null;
          created_at: string;
          cvss_score: number | null;
          description: string;
          evidence: string | null;
          id: string;
          notes: string | null;
          remediation_steps: string | null;
          resolved_at: string | null;
          scan_id: string;
          severity: Database["public"]["Enums"]["findingseverity"];
          status: Database["public"]["Enums"]["findingstatus"];
          title: string;
        };
        Insert: {
          asset_identified?: string | null;
          assigned_to?: string | null;
          created_at: string;
          cvss_score?: number | null;
          description: string;
          evidence?: string | null;
          id: string;
          notes?: string | null;
          remediation_steps?: string | null;
          resolved_at?: string | null;
          scan_id: string;
          severity: Database["public"]["Enums"]["findingseverity"];
          status: Database["public"]["Enums"]["findingstatus"];
          title: string;
        };
        Update: {
          asset_identified?: string | null;
          assigned_to?: string | null;
          created_at?: string;
          cvss_score?: number | null;
          description?: string;
          evidence?: string | null;
          id?: string;
          notes?: string | null;
          remediation_steps?: string | null;
          resolved_at?: string | null;
          scan_id?: string;
          severity?: Database["public"]["Enums"]["findingseverity"];
          status?: Database["public"]["Enums"]["findingstatus"];
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "findings_scan_id_fkey";
            columns: ["scan_id"];
            isOneToOne: false;
            referencedRelation: "scans";
            referencedColumns: ["id"];
          },
        ];
      };
      kg_edges: {
        Row: {
          created_at: string | null;
          edge_type: string;
          id: string;
          org_id: string;
          properties: string;
          source_id: string;
          target_id: string;
          weight: number | null;
        };
        Insert: {
          created_at?: string | null;
          edge_type: string;
          id: string;
          org_id: string;
          properties: string;
          source_id: string;
          target_id: string;
          weight?: number | null;
        };
        Update: {
          created_at?: string | null;
          edge_type?: string;
          id?: string;
          org_id?: string;
          properties?: string;
          source_id?: string;
          target_id?: string;
          weight?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "kg_edges_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      kg_nodes: {
        Row: {
          created_at: string | null;
          id: string;
          label: string;
          node_type: string;
          org_id: string;
          properties: string;
          risk_score: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id: string;
          label: string;
          node_type: string;
          org_id: string;
          properties: string;
          risk_score?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          label?: string;
          node_type?: string;
          org_id?: string;
          properties?: string;
          risk_score?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "kg_nodes_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      notification_channels: {
        Row: {
          channel_type: string;
          created_at: string;
          id: string;
          is_active: boolean;
          min_severity: string;
          name: string;
          organization_id: string;
          webhook_url: string;
        };
        Insert: {
          channel_type: string;
          created_at: string;
          id: string;
          is_active: boolean;
          min_severity: string;
          name: string;
          organization_id: string;
          webhook_url: string;
        };
        Update: {
          channel_type?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          min_severity?: string;
          name?: string;
          organization_id?: string;
          webhook_url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_channels_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          ci_auto_remediate: boolean;
          ci_fail_on_critical: boolean;
          ci_fail_on_high: boolean;
          created_at: string;
          github_token_encrypted: string | null;
          id: string;
          name: string;
          plan: string;
          require_verified_domains: boolean;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
        };
        Insert: {
          ci_auto_remediate: boolean;
          ci_fail_on_critical: boolean;
          ci_fail_on_high: boolean;
          created_at: string;
          github_token_encrypted?: string | null;
          id: string;
          name: string;
          plan: string;
          require_verified_domains: boolean;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
        };
        Update: {
          ci_auto_remediate?: boolean;
          ci_fail_on_critical?: boolean;
          ci_fail_on_high?: boolean;
          created_at?: string;
          github_token_encrypted?: string | null;
          id?: string;
          name?: string;
          plan?: string;
          require_verified_domains?: boolean;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
        };
        Relationships: [];
      };
      remediation_patches: {
        Row: {
          approved_at: string | null;
          approved_by: string | null;
          base_branch: string;
          created_at: string;
          diff: string;
          file_path: string;
          finding_id: string | null;
          id: string;
          lines_changed: number;
          organization_id: string;
          original_code: string;
          patch_branch: string;
          patched_code: string;
          pr_number: number | null;
          pr_url: string | null;
          rejection_reason: string | null;
          repository: string;
          requested_by: string;
          sandbox_details: string;
          sandbox_passed: boolean;
          severity: string;
          status: Database["public"]["Enums"]["patchstatus"];
          updated_at: string;
          vulnerability_type: string;
        };
        Insert: {
          approved_at?: string | null;
          approved_by?: string | null;
          base_branch: string;
          created_at: string;
          diff: string;
          file_path: string;
          finding_id?: string | null;
          id: string;
          lines_changed: number;
          organization_id: string;
          original_code: string;
          patch_branch: string;
          patched_code: string;
          pr_number?: number | null;
          pr_url?: string | null;
          rejection_reason?: string | null;
          repository: string;
          requested_by: string;
          sandbox_details: string;
          sandbox_passed: boolean;
          severity: string;
          status: Database["public"]["Enums"]["patchstatus"];
          updated_at: string;
          vulnerability_type: string;
        };
        Update: {
          approved_at?: string | null;
          approved_by?: string | null;
          base_branch?: string;
          created_at?: string;
          diff?: string;
          file_path?: string;
          finding_id?: string | null;
          id?: string;
          lines_changed?: number;
          organization_id?: string;
          original_code?: string;
          patch_branch?: string;
          patched_code?: string;
          pr_number?: number | null;
          pr_url?: string | null;
          rejection_reason?: string | null;
          repository?: string;
          requested_by?: string;
          sandbox_details?: string;
          sandbox_passed?: boolean;
          severity?: string;
          status?: Database["public"]["Enums"]["patchstatus"];
          updated_at?: string;
          vulnerability_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "remediation_patches_finding_id_fkey";
            columns: ["finding_id"];
            isOneToOne: false;
            referencedRelation: "findings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "remediation_patches_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      scan_schedules: {
        Row: {
          created_at: string | null;
          created_by: string;
          frequency: string;
          id: string;
          is_active: boolean | null;
          last_run_at: string | null;
          next_run_at: string | null;
          organization_id: string;
          run_count: number | null;
          target: string;
        };
        Insert: {
          created_at?: string | null;
          created_by: string;
          frequency: string;
          id: string;
          is_active?: boolean | null;
          last_run_at?: string | null;
          next_run_at?: string | null;
          organization_id: string;
          run_count?: number | null;
          target: string;
        };
        Update: {
          created_at?: string | null;
          created_by?: string;
          frequency?: string;
          id?: string;
          is_active?: boolean | null;
          last_run_at?: string | null;
          next_run_at?: string | null;
          organization_id?: string;
          run_count?: number | null;
          target?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scan_schedules_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scan_schedules_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      scans: {
        Row: {
          celery_task_id: string | null;
          created_at: string;
          findings: string;
          id: string;
          idempotency_key: string | null;
          is_authorized: boolean;
          organization_id: string;
          progress: number;
          retry_count: number;
          risk_level: string;
          risk_score: number;
          scan_type: string;
          share_token: string | null;
          stage: string | null;
          status: string;
          target: string;
          user_id: string;
        };
        Insert: {
          celery_task_id?: string | null;
          created_at: string;
          findings: string;
          id: string;
          idempotency_key?: string | null;
          is_authorized: boolean;
          organization_id: string;
          progress: number;
          retry_count: number;
          risk_level: string;
          risk_score: number;
          scan_type: string;
          share_token?: string | null;
          stage?: string | null;
          status: string;
          target: string;
          user_id: string;
        };
        Update: {
          celery_task_id?: string | null;
          created_at?: string;
          findings?: string;
          id?: string;
          idempotency_key?: string | null;
          is_authorized?: boolean;
          organization_id?: string;
          progress?: number;
          retry_count?: number;
          risk_level?: string;
          risk_score?: number;
          scan_type?: string;
          share_token?: string | null;
          stage?: string | null;
          status?: string;
          target?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scans_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scans_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          mfa_backup_codes: string | null;
          mfa_enabled: boolean;
          mfa_secret: string | null;
          organization_id: string;
          password_hash: string;
          role: string;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id: string;
          mfa_backup_codes?: string | null;
          mfa_enabled: boolean;
          mfa_secret?: string | null;
          organization_id: string;
          password_hash: string;
          role: string;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          mfa_backup_codes?: string | null;
          mfa_enabled?: boolean;
          mfa_secret?: string | null;
          organization_id?: string;
          password_hash?: string;
          role?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      webhooks: {
        Row: {
          created_at: string;
          event: string;
          id: string;
          is_active: boolean;
          organization_id: string;
          secret: string;
          url: string;
        };
        Insert: {
          created_at: string;
          event: string;
          id: string;
          is_active: boolean;
          organization_id: string;
          secret: string;
          url: string;
        };
        Update: {
          created_at?: string;
          event?: string;
          id?: string;
          is_active?: boolean;
          organization_id?: string;
          secret?: string;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "webhooks_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      asmeventseverity: "info" | "low" | "medium" | "high" | "critical";
      asmeventtype:
        | "new_subdomain"
        | "new_ip"
        | "new_port"
        | "new_service"
        | "port_closed"
        | "service_changed"
        | "dns_changed"
        | "new_vulnerability";
      assetstatus: "active" | "stale" | "unknown";
      assettype:
        | "domain"
        | "subdomain"
        | "ip"
        | "server"
        | "api"
        | "cloud_resource";
      findingseverity: "critical" | "high" | "medium" | "low" | "info";
      findingstatus:
        | "new"
        | "confirmed"
        | "in_progress"
        | "fixed"
        | "accepted_risk"
        | "reopened";
      patchstatus: "proposed" | "approved" | "rejected" | "applied" | "failed";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
