#!/usr/bin/env python3
"""
SageAI/SageStrike Project Development Lifecycle Documentation
Comprehensive PDF covering phases, workflow, and SDLC
"""

import datetime

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


def create_sdlc_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=18,
    )

    # Container for elements
    elements = []

    # Custom styles
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Heading1"],
        fontSize=24,
        textColor=colors.HexColor("#1a1a2e"),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName="Helvetica-Bold",
    )

    heading_style = ParagraphStyle(
        "CustomHeading",
        parent=styles["Heading2"],
        fontSize=16,
        textColor=colors.HexColor("#16213e"),
        spaceAfter=12,
        spaceBefore=12,
        fontName="Helvetica-Bold",
    )

    subheading_style = ParagraphStyle(
        "CustomSubHeading",
        parent=styles["Heading3"],
        fontSize=13,
        textColor=colors.HexColor("#0f3460"),
        spaceAfter=10,
        spaceBefore=10,
        fontName="Helvetica-Bold",
    )

    body_style = ParagraphStyle(
        "CustomBody",
        parent=styles["BodyText"],
        fontSize=10,
        alignment=TA_JUSTIFY,
        spaceAfter=10,
        fontName="Helvetica",
    )

    bullet_style = ParagraphStyle(
        "BulletStyle",
        parent=styles["BodyText"],
        fontSize=10,
        leftIndent=20,
        spaceAfter=5,
        fontName="Helvetica",
    )

    # Title Page
    elements.append(Spacer(1, 2 * inch))
    elements.append(Paragraph("SageAI / SageStrike", title_style))
    elements.append(Spacer(1, 0.3 * inch))
    elements.append(Paragraph("Project Development Lifecycle", title_style))
    elements.append(Spacer(1, 0.3 * inch))
    elements.append(Paragraph("Comprehensive Documentation", title_style))
    elements.append(Spacer(1, inch))

    # Metadata
    meta_style = ParagraphStyle(
        "Meta",
        parent=styles["Normal"],
        fontSize=12,
        alignment=TA_CENTER,
        textColor=colors.gray,
    )
    elements.append(
        Paragraph(
            f"Generated: {datetime.datetime.now().strftime('%Y-%m-%d')}", meta_style
        )
    )
    elements.append(Paragraph("Version: 2.0 - Astronomical Edition", meta_style))
    elements.append(PageBreak())

    # Table of Contents
    elements.append(Paragraph("Table of Contents", heading_style))
    elements.append(Spacer(1, 0.2 * inch))

    toc_items = [
        "1. Executive Summary",
        "2. Project Overview",
        "3. Phase 1: Planning & Requirements",
        "4. Phase 2: Architecture & Design",
        "5. Phase 3: Development",
        "6. Phase 4: Testing & QA",
        "7. Phase 5: Deployment",
        "8. Phase 6: Operations & Maintenance",
        "9. Workflow Diagrams",
        "10. Risk Management",
        "11. Resource Allocation",
        "12. Timeline & Milestones",
        "13. Appendices",
    ]

    for item in toc_items:
        elements.append(Paragraph(item, bullet_style))
    elements.append(PageBreak())

    # Executive Summary
    elements.append(Paragraph("1. Executive Summary", heading_style))
    elements.append(
        Paragraph(
            """
    SageAI is an AI-powered enterprise security and OSINT platform designed for attack surface management,
    automated penetration testing, and advanced intelligence gathering. This document outlines the complete
    Software Development Lifecycle (SDLC) for both the original SageAI platform and the new SageStrike
    distributed attack engine.

    The project follows an enhanced Agile methodology with DevSecOps practices, incorporating continuous
    integration, automated security testing, and cloud-native deployment strategies. The development lifecycle
    spans 18 months with a team of 20+ engineers, security researchers, and DevOps specialists.
    """,
            body_style,
        )
    )
    elements.append(Spacer(1, 0.2 * inch))

    # Key Highlights Table
    key_data = [
        ["Metric", "Value"],
        ["Project Duration", "18 Months"],
        ["Team Size", "20-25 Engineers"],
        ["Architecture", "Microservices (K8s)"],
        ["Primary Language", "Python 3.11+, Go 1.21+"],
        ["Database", "PostgreSQL + Redis + Kafka"],
        ["Frontend", "Next.js 15 + TypeScript"],
        ["Deployment", "Multi-cloud (AWS/GCP/Azure)"],
    ]

    key_table = Table(key_data, colWidths=[2.5 * inch, 3 * inch])
    key_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#16213e")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 11),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#f5f5f5")),
                ("GRID", (0, 0), (-1, -1), 1, colors.grey),
                ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -1),
                    [colors.white, colors.HexColor("#f0f0f0")],
                ),
            ]
        )
    )
    elements.append(key_table)
    elements.append(PageBreak())

    # Project Overview
    elements.append(Paragraph("2. Project Overview", heading_style))
    elements.append(
        Paragraph(
            """
    SageAI represents a paradigm shift in automated security testing, combining traditional vulnerability
    scanning with AI-powered analysis and distributed exploitation capabilities. The platform is built
    on a modern microservices architecture designed for horizontal scalability and cloud-native deployment.
    """,
            body_style,
        )
    )

    elements.append(Paragraph("2.1 Core Components", subheading_style))
    components = [
        (
            "Intelligence Hub",
            "9 OSINT modules for reconnaissance across public data sources",
        ),
        (
            "Multi-Agent AI",
            "LLM-powered agents for reconnaissance, scanning, exploitation, and reporting",
        ),
        (
            "Distributed Scanner",
            "Go-based high-performance port scanner with SYN stealth capability",
        ),
        (
            "Exploit Framework",
            "Python-based exploitation engine with 10+ vulnerability classes",
        ),
        ("Risk Engine", "CVSS-weighted scoring with AI-enhanced contextual analysis"),
        (
            "Asset Management",
            "Real-time attack surface inventory with relationship mapping",
        ),
    ]

    comp_data = [["Component", "Description"]]
    for name, desc in components:
        comp_data.append([name, desc])

    comp_table = Table(comp_data, colWidths=[2 * inch, 3.5 * inch])
    comp_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f3460")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 11),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                ("GRID", (0, 0), (-1, -1), 1, colors.grey),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -1),
                    [colors.white, colors.HexColor("#f8f9fa")],
                ),
            ]
        )
    )
    elements.append(comp_table)
    elements.append(PageBreak())

    # Phase 1: Planning
    elements.append(
        Paragraph("3. Phase 1: Planning & Requirements (Month 1-2)", heading_style)
    )

    elements.append(Paragraph("3.1 Stakeholder Analysis", subheading_style))
    elements.append(
        Paragraph(
            """
    Primary stakeholders include enterprise security teams, bug bounty hunters, MSSPs (Managed Security Service Providers),
    and internal red teams. Requirements were gathered through 50+ interviews with CISOs, penetration testers, and
    security architects across Fortune 500 companies.
    """,
            body_style,
        )
    )

    elements.append(Paragraph("3.2 Requirements Categories", subheading_style))

    req_data = [
        ["Category", "Requirements", "Priority"],
        [
            "Functional",
            "9 OSINT modules, Multi-agent pipeline, Real-time scanning",
            "Critical",
        ],
        ["Performance", "100k ports/sec, <5ms latency, 99.9% uptime", "Critical"],
        ["Security", "Zero-trust architecture, Encryption at rest/transit", "Critical"],
        ["Scalability", "100+ pod scaling, 1M+ targets/day", "High"],
        ["Compliance", "GDPR, SOC2, ISO 27001 ready", "High"],
        ["Integration", "REST API, WebSocket, Webhook support", "Medium"],
    ]

    req_table = Table(req_data, colWidths=[1.5 * inch, 3 * inch, 1 * inch])
    req_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e94560")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 10),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
                ("GRID", (0, 0), (-1, -1), 1, colors.grey),
                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -1),
                    [colors.white, colors.HexColor("#f8f9fa")],
                ),
            ]
        )
    )
    elements.append(req_table)
    elements.append(PageBreak())

    # Phase 2: Architecture
    elements.append(
        Paragraph("4. Phase 2: Architecture & Design (Month 2-4)", heading_style)
    )

    elements.append(
        Paragraph(
            """
    The architecture follows microservices principles with event-driven communication. Each component is designed
    for independent deployment, scaling, and failure isolation. The system uses a polyglot persistence approach
    with specialized databases for different data patterns.
    """,
            body_style,
        )
    )

    elements.append(Paragraph("4.1 Technology Stack", subheading_style))

    stack_data = [
        ["Layer", "Technology", "Purpose"],
        ["API Gateway", "Kong/AWS API Gateway", "Rate limiting, auth, routing"],
        ["Frontend", "Next.js 15 + Tailwind", "React SSR, TypeScript"],
        ["Backend API", "FastAPI + Python 3.11", "Async REST API"],
        ["Scanning", "Go 1.21", "High-performance network I/O"],
        ["Message Queue", "Apache Kafka", "Event streaming"],
        ["Cache/Stream", "Redis Cluster", "Real-time data, sessions"],
        ["Database", "PostgreSQL + TimescaleDB", "Relational + time-series"],
        ["Graph DB", "Neo4j", "Relationship mapping"],
        ["ML/AI", "PyTorch + Transformers", "Vulnerability detection"],
        ["K8s Platform", "EKS/GKE", "Container orchestration"],
    ]

    stack_table = Table(stack_data, colWidths=[1.5 * inch, 2 * inch, 2.5 * inch])
    stack_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#16213e")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 10),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
                ("GRID", (0, 0), (-1, -1), 1, colors.grey),
                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -1),
                    [colors.white, colors.HexColor("#f8f9fa")],
                ),
            ]
        )
    )
    elements.append(stack_table)
    elements.append(PageBreak())

    # Phase 3: Development
    elements.append(Paragraph("5. Phase 3: Development (Month 4-12)", heading_style))

    elements.append(
        Paragraph(
            """
    Development follows trunk-based development with feature flags. The codebase is organized into microservices
    with clear API contracts defined in OpenAPI specifications. Each service has independent CI/CD pipelines
    with automated testing, security scanning, and deployment.
    """,
            body_style,
        )
    )

    elements.append(Paragraph("5.1 Development Workflow", subheading_style))

    workflow_steps = [
        "Feature Request → Product Backlog Refinement",
        "Sprint Planning → Story Point Estimation",
        "Feature Branch Creation → TDD Development",
        "Code Review (2+ approvals required)",
        "Automated Testing (Unit, Integration, E2E)",
        "Security Scanning (SAST, DAST, Dependency)",
        "Merge to Main → Staged Deployment",
        "Canary Release → Production Rollout",
    ]

    for i, step in enumerate(workflow_steps, 1):
        elements.append(Paragraph(f"{i}. {step}", bullet_style))

    elements.append(Paragraph("5.2 Service Architecture", subheading_style))

    svc_data = [
        ["Service", "Language", "Responsibility", "Scale"],
        ["api-gateway", "Go", "Request routing, auth", "3 pods"],
        ["web-frontend", "TypeScript", "Next.js SSR app", "5 pods"],
        ["scan-orchestrator", "Python", "Scan coordination", "3 pods"],
        ["scan-worker", "Go", "Port scanning", "10-100 pods"],
        ["exploit-engine", "Python", "Vulnerability exploitation", "5-50 pods"],
        ["intelligence-hub", "Python", "OSINT data collection", "5 pods"],
        ["ai-agent", "Python", "LLM analysis", "3 pods"],
        ["event-processor", "Python", "Kafka consumers", "5 pods"],
        ["report-generator", "Python", "PDF/report creation", "2 pods"],
    ]

    svc_table = Table(svc_data, colWidths=[1.5 * inch, 1 * inch, 2.5 * inch, 1 * inch])
    svc_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f3460")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 9),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
                ("GRID", (0, 0), (-1, -1), 1, colors.grey),
                ("FONTSIZE", (0, 1), (-1, -1), 8),
                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -1),
                    [colors.white, colors.HexColor("#f8f9fa")],
                ),
            ]
        )
    )
    elements.append(svc_table)
    elements.append(PageBreak())

    # Phase 4: Testing
    elements.append(Paragraph("6. Phase 4: Testing & QA (Continuous)", heading_style))

    elements.append(Paragraph("6.1 Testing Pyramid", subheading_style))

    test_data = [
        ["Level", "Coverage Target", "Tools", "Environment"],
        ["Unit Tests", "80% code coverage", "pytest, Go test", "Local/CI"],
        ["Integration Tests", "API contracts", "pytest-asyncio, TestContainers", "CI"],
        ["Contract Tests", "All service APIs", "Pact", "CI"],
        ["E2E Tests", "Critical user paths", "Playwright, Cypress", "Staging"],
        ["Security Tests", "OWASP Top 10", "Bandit, Semgrep, ZAP", "CI/Staging"],
        ["Performance Tests", "100k req/sec", "k6, Locust", "Staging/Prod"],
    ]

    test_table = Table(
        test_data, colWidths=[1.3 * inch, 1.5 * inch, 2 * inch, 1.2 * inch]
    )
    test_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e94560")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 10),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
                ("GRID", (0, 0), (-1, -1), 1, colors.grey),
                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -1),
                    [colors.white, colors.HexColor("#f8f9fa")],
                ),
            ]
        )
    )
    elements.append(test_table)

    elements.append(Paragraph("6.2 Quality Gates", subheading_style))
    gates = [
        "All unit tests passing (>80% coverage)",
        "No critical/high security vulnerabilities (SAST/DAST)",
        "Performance benchmarks within 10% of baseline",
        "Code review approved by 2+ senior engineers",
        "Documentation updated (API specs, changelogs)",
        "Feature flags configured for rollback",
    ]
    for gate in gates:
        elements.append(Paragraph(f"• {gate}", bullet_style))
    elements.append(PageBreak())

    # Phase 5: Deployment
    elements.append(Paragraph("7. Phase 5: Deployment (Month 12-14)", heading_style))

    elements.append(Paragraph("7.1 Deployment Strategy", subheading_style))
    elements.append(
        Paragraph(
            """
    The platform uses a GitOps workflow with ArgoCD for Kubernetes deployment. Each service has
    independent deployment pipelines with automated canary releases. The deployment environment
    progression: Local → CI → Development → Staging → Production.
    """,
            body_style,
        )
    )

    elements.append(Paragraph("7.2 Infrastructure as Code", subheading_style))

    iac_data = [
        ["Component", "Tool", "Purpose"],
        ["K8s Manifests", "Kustomize + Helm", "Service deployment"],
        ["Infrastructure", "Terraform", "AWS/GCP/Azure resources"],
        ["Networking", "Cilium", "Service mesh, policies"],
        ["Secrets", "Vault", "Secret management"],
        ["Monitoring", "Prometheus Operator", "Metrics collection"],
        ["Logging", "Loki + Fluentd", "Log aggregation"],
        ["Tracing", "Jaeger", "Distributed tracing"],
    ]

    iac_table = Table(iac_data, colWidths=[1.5 * inch, 2 * inch, 2.5 * inch])
    iac_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#16213e")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 10),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
                ("GRID", (0, 0), (-1, -1), 1, colors.grey),
                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -1),
                    [colors.white, colors.HexColor("#f8f9fa")],
                ),
            ]
        )
    )
    elements.append(iac_table)
    elements.append(PageBreak())

    # Phase 6: Operations
    elements.append(
        Paragraph("8. Phase 6: Operations & Maintenance (Ongoing)", heading_style)
    )

    elements.append(Paragraph("8.1 Monitoring & Observability", subheading_style))

    obs_data = [
        ["Category", "Metrics", "Alert Threshold"],
        ["Performance", "P95 latency, throughput", "Latency > 100ms"],
        ["Reliability", "Error rate, uptime", "Errors > 0.1%"],
        ["Security", "Failed auth, anomalies", "Any critical alert"],
        ["Business", "Active scans, findings", "Queue depth > 1000"],
        ["Infrastructure", "CPU, memory, disk", "Resource > 80%"],
    ]

    obs_table = Table(obs_data, colWidths=[1.5 * inch, 2.5 * inch, 2 * inch])
    obs_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f3460")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 10),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
                ("GRID", (0, 0), (-1, -1), 1, colors.grey),
                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -1),
                    [colors.white, colors.HexColor("#f8f9fa")],
                ),
            ]
        )
    )
    elements.append(obs_table)

    elements.append(Paragraph("8.2 Incident Response", subheading_style))
    elements.append(
        Paragraph(
            """
    P0 (Critical): Service down, security breach - Response: 15 min, Resolution: 2 hours
    P1 (High): Major feature degraded - Response: 1 hour, Resolution: 4 hours
    P2 (Medium): Partial impact - Response: 4 hours, Resolution: 24 hours
    P3 (Low): Minor issues - Response: 24 hours, Resolution: 72 hours
    """,
            body_style,
        )
    )
    elements.append(PageBreak())

    # Workflow Diagrams Section
    elements.append(Paragraph("9. Workflow Diagrams", heading_style))

    elements.append(Paragraph("9.1 CI/CD Pipeline Workflow", subheading_style))

    cicd_steps = [
        "1. Developer pushes code to feature branch",
        "2. GitHub Actions triggers: Lint → Unit Tests → Build",
        "3. Security scanning: SAST (Bandit/Semgrep), Dependency check",
        "4. Docker image built and pushed to ECR with SHA tag",
        "5. Integration tests run against ephemeral environment",
        "6. PR reviewed and merged to main branch",
        "7. ArgoCD detects change and updates staging",
        "8. Canary deployment: 10% → 50% → 100% traffic",
        "9. Automated rollback if error rate > threshold",
        "10. Production deployment with feature flags",
    ]

    for step in cicd_steps:
        elements.append(Paragraph(step, bullet_style))

    elements.append(Spacer(1, 0.2 * inch))
    elements.append(Paragraph("9.2 Data Flow Architecture", subheading_style))
    elements.append(
        Paragraph(
            """
    User Request → Kong Gateway → Auth Service → API Gateway → Kafka Event Bus →
    Service Consumers → PostgreSQL/Redis → WebSocket → User Dashboard

    Scanning: Coordinator → Kafka → Scan Workers → Results → Exploit Engine →
    Findings DB → AI Analysis → Report Generator
    """,
            body_style,
        )
    )

    elements.append(Spacer(1, 0.2 * inch))
    elements.append(Paragraph("9.3 Multi-Agent AI Workflow", subheading_style))
    elements.append(
        Paragraph(
            """
    ReconAgent: Subdomain enumeration → DNS resolution → Shodan enrichment
    ↓
    ScannerAgent: Tool selection → Nmap/SSL/DNS execution → Vulnerability triage
    ↓
    ExploitAgent: Safe exploitation → Evidence collection → Risk assessment
    ↓
    ReportAgent: Executive summary → Risk scoring → Attack path analysis
    ↓
    Delivery: PDF report → WebSocket notification → Dashboard update
    """,
            body_style,
        )
    )
    elements.append(PageBreak())

    # Risk Management
    elements.append(Paragraph("10. Risk Management", heading_style))

    elements.append(Paragraph("10.1 Technical Risks", subheading_style))

    risk_data = [
        ["Risk", "Probability", "Impact", "Mitigation"],
        ["K8s complexity", "High", "High", "Training, runbooks, managed EKS"],
        [
            "Performance at scale",
            "Medium",
            "High",
            "Load testing, caching, rate limiting",
        ],
        [
            "Security vulnerabilities",
            "Medium",
            "Critical",
            "Penetration testing, bug bounty",
        ],
        ["AI model failures", "Medium", "Medium", "Fallback rules, human oversight"],
        [
            "Dependency vulnerabilities",
            "High",
            "High",
            "Automated scanning, SLSA compliance",
        ],
        ["Data breaches", "Low", "Critical", "Encryption, zero-trust, audit logging"],
    ]

    risk_table = Table(
        risk_data, colWidths=[1.5 * inch, 0.8 * inch, 0.8 * inch, 2 * inch]
    )
    risk_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e94560")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 9),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
                ("GRID", (0, 0), (-1, -1), 1, colors.grey),
                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -1),
                    [colors.white, colors.HexColor("#f8f9fa")],
                ),
            ]
        )
    )
    elements.append(risk_table)
    elements.append(PageBreak())

    # Resource Allocation
    elements.append(Paragraph("11. Resource Allocation", heading_style))

    elements.append(Paragraph("11.1 Team Structure", subheading_style))

    team_data = [
        ["Role", "Count", "Responsibility"],
        ["Engineering Manager", "1", "Team coordination, roadmap"],
        ["Tech Lead", "1", "Architecture decisions, mentoring"],
        ["Senior Backend Engineers", "4", "Core services, APIs"],
        ["Backend Engineers", "4", "Feature development"],
        ["Go Developers", "2", "Scanner, performance-critical"],
        ["Frontend Engineers", "3", "Next.js, React components"],
        ["DevOps Engineers", "2", "K8s, CI/CD, infrastructure"],
        ["Security Engineers", "2", "Exploits, hardening, audits"],
        ["ML Engineers", "2", "AI agents, model training"],
        ["QA Engineers", "2", "Testing, automation"],
        ["Product Manager", "1", "Requirements, prioritization"],
        ["UI/UX Designer", "1", "Design system, prototypes"],
    ]

    team_table = Table(team_data, colWidths=[2 * inch, 0.8 * inch, 2.7 * inch])
    team_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#16213e")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 10),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
                ("GRID", (0, 0), (-1, -1), 1, colors.grey),
                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -1),
                    [colors.white, colors.HexColor("#f8f9fa")],
                ),
            ]
        )
    )
    elements.append(team_table)

    elements.append(Paragraph("11.2 Infrastructure Costs (Monthly)", subheading_style))

    cost_data = [
        ["Component", "Specification", "Monthly Cost"],
        ["EKS Cluster", "3 nodes x c5.2xlarge", "$1,200"],
        ["Worker Nodes", "20-100 x c5.4xlarge (spot)", "$3,000-15,000"],
        ["Kafka", "3 x r5.xlarge", "$1,200"],
        ["PostgreSQL", "RDS db.r5.2xlarge", "$800"],
        ["Redis", "ElastiCache r5.xlarge", "$400"],
        ["Load Balancers", "ALB x 3", "$300"],
        ["Storage", "5TB EBS + S3", "$500"],
        ["Networking", "NAT, data transfer", "$400"],
        ["Monitoring", "CloudWatch, Datadog", "$600"],
        ["Total", "", "$8,400-22,400"],
    ]

    cost_table = Table(cost_data, colWidths=[1.5 * inch, 2 * inch, 1.5 * inch])
    cost_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f3460")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 10),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
                ("GRID", (0, 0), (-1, -1), 1, colors.grey),
                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -1),
                    [colors.white, colors.HexColor("#f8f9fa")],
                ),
                ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
                ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#e8f4f8")),
            ]
        )
    )
    elements.append(cost_table)
    elements.append(PageBreak())

    # Timeline
    elements.append(Paragraph("12. Timeline & Milestones", heading_style))

    elements.append(Paragraph("12.1 Release Schedule", subheading_style))

    timeline_data = [
        ["Milestone", "Date", "Deliverables", "Status"],
        ["MVP", "Month 3", "Core API, basic scanning", "Completed"],
        ["Alpha", "Month 6", "9 OSINT modules, auth", "Completed"],
        ["Beta", "Month 9", "Multi-agent AI, reports", "Completed"],
        ["v1.0", "Month 12", "Production launch", "In Progress"],
        ["v1.5", "Month 15", "SageStrike integration", "In Progress"],
        ["v2.0", "Month 18", "Advanced exploits, ML", "Planned"],
        ["v2.5", "Month 21", "Dark web, custom ASIC", "Planned"],
        ["v3.0", "Month 24", "Autonomous pentesting", "Planned"],
    ]

    timeline_table = Table(
        timeline_data, colWidths=[1 * inch, 0.8 * inch, 2.2 * inch, 0.8 * inch]
    )
    timeline_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#16213e")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 10),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
                ("GRID", (0, 0), (-1, -1), 1, colors.grey),
                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -1),
                    [colors.white, colors.HexColor("#f8f9fa")],
                ),
            ]
        )
    )
    elements.append(timeline_table)
    elements.append(PageBreak())

    # Appendices
    elements.append(Paragraph("13. Appendices", heading_style))

    elements.append(Paragraph("Appendix A: Definition of Done", subheading_style))
    elements.append(
        Paragraph(
            """
    A feature is considered "Done" when:
    • Code is written and reviewed by 2+ engineers
    • Unit tests achieve >80% coverage
    • Integration tests pass in CI
    • Documentation is updated (API specs, user guides)
    • Security scan passes with no critical/high issues
    • Performance benchmarks meet targets
    • Feature flags are configured
    • Monitoring and alerting are in place
    • Runbook is updated for operational procedures
    """,
            body_style,
        )
    )

    elements.append(Paragraph("Appendix B: Security Requirements", subheading_style))
    elements.append(
        Paragraph(
            """
    All code must adhere to:
    • OWASP ASVS Level 2 compliance
    • All secrets in Vault (never in code)
    • Input validation on all API endpoints
    • SQL injection prevention (parameterized queries)
    • XSS prevention (output encoding)
    • CSRF protection for state-changing operations
    • Rate limiting on all public endpoints
    • Encryption at rest (AES-256) and in transit (TLS 1.3)
    • Audit logging for security events
    """,
            body_style,
        )
    )

    elements.append(Paragraph("Appendix C: Performance Targets", subheading_style))
    elements.append(
        Paragraph(
            """
    Scanner Performance:
    • Port scanning: 100,000 ports/second per pod
    • API response time: P95 < 100ms
    • WebSocket latency: < 50ms
    • Database queries: P95 < 10ms
    • Kafka throughput: 50,000 events/second
    • System availability: 99.9% uptime
    • Concurrent scans: 10,000+ simultaneous
    • Report generation: < 30 seconds for 1000 findings
    """,
            body_style,
        )
    )

    # Build PDF
    doc.build(elements)
    print(f"PDF generated successfully: {filename}")


if __name__ == "__main__":
    import argparse
    from pathlib import Path

    default_output = (
        Path(__file__).resolve().parent.parent / "SageAI_SDLC_Documentation.pdf"
    )
    parser = argparse.ArgumentParser(
        description="Generate SageAI SDLC Documentation PDF"
    )
    parser.add_argument(
        "-o",
        "--output",
        default=str(default_output),
        help=f"Output PDF file path (default: {default_output})",
    )
    args = parser.parse_args()
    create_sdlc_pdf(args.output)
