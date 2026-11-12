"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Clock,
  Activity,
  GitBranch,
  Shield,
  Sparkles,
  Radar,
  ShieldAlert,
  FileCheck,
  HeartPulse,
  Rss,
  Globe,
  Swords,
  Radio,
  AlertTriangle,
  Flame,
  Biohazard,
  ScrollText,
  Network,
  Crosshair,
  ShieldCheck,
  Lock,
  Cpu,
  Terminal,
  Cloud,
  Package,
  Search,
  AlertOctagon,
  Database,
  Share2,
  GitPullRequest,
  Fingerprint,
  PackageCheck,
  Bot,
  KeyRound,
  Microscope,
  Coins,
  Zap,
  Skull,
  FileCheck2,
  Grid3X3,
  Code2,
  Globe2,
  HardDrive,
  Compass,
  Scale,
  Antenna,
  Dna,
  Waves,
  Brain,
  Atom,
  Scissors,
  Rocket,
  Satellite,
  Sun,
  Plane,
  Orbit,
  Binary,
  Mountain,
  Layers,
  Wind,
  RotateCcw,
  Filter,
  TrendingDown,
  Award,
  Box,
  Maximize2,
  FlipHorizontal,
  BatteryCharging,
  GitCommitHorizontal,
  X,
} from "lucide-react";
import { DashboardOverview } from "@/components/DashboardOverview";
import { ScheduleManager } from "@/components/ScheduleManager";
import { ASMTimeline } from "@/components/ASMTimeline";
import { AutoFixPanel } from "@/components/AutoFixPanel";
import { AICopilot } from "@/components/AICopilot";
import { IntelligenceHub } from "@/components/IntelligenceHub";
import { RedTeamPanel } from "@/components/RedTeamPanel";
import { ComplianceCenter } from "@/components/ComplianceCenter";
import { SystemHealth } from "@/components/SystemHealth";
import { ThreatFeed } from "@/components/ThreatFeed";
import { SecurityPosture } from "@/components/SecurityPosture";
import { WarRoom } from "@/components/WarRoom";
import { ObservabilityDashboard } from "@/components/ObservabilityDashboard";
import { HoneypotCenter } from "@/components/HoneypotCenter";
import { AIConsensusArena } from "@/components/AIConsensusArena";
import { DeepAnalysisPanel } from "@/components/DeepAnalysisPanel";
import { DetonationChamber } from "@/components/DetonationChamber";
import { ThreatRuleSynthesizer } from "@/components/ThreatRuleSynthesizer";
import { IncidentCenter } from "@/components/IncidentCenter";
import { DefenseGridMonitor } from "@/components/DefenseGridMonitor";
import { CyberRangeArena } from "@/components/CyberRangeArena";
import { EnterpriseSecurityHub } from "@/components/EnterpriseSecurityHub";
import { ZeroEgressEnclave } from "@/components/ZeroEgressEnclave";
import { ThreatModelingStudio } from "@/components/ThreatModelingStudio";
import { QuantumSafeStudio } from "@/components/QuantumSafeStudio";
import { EBPFTelemetryMonitor } from "@/components/EBPFTelemetryMonitor";
import { CSPMHub } from "@/components/CSPMHub";
import { SupplyChainStudio } from "@/components/SupplyChainStudio";
import { ZTNAManager } from "@/components/ZTNAManager";
import { AdversaryMatrixViewer } from "@/components/AdversaryMatrixViewer";
import { EASMHunter } from "@/components/EASMHunter";
import { AISOCCommandCenter } from "@/components/AISOCCommandCenter";
import { ThreatHuntingStudio } from "@/components/ThreatHuntingStudio";
import { AntiRansomwareShield } from "@/components/AntiRansomwareShield";
import { DSPMHub } from "@/components/DSPMHub";
import { CTIHub } from "@/components/CTIHub";
import { AdversaryEmulationStudio } from "@/components/AdversaryEmulationStudio";
import { IaCDriftEngine } from "@/components/IaCDriftEngine";
import { SBOMVexStudio } from "@/components/SBOMVexStudio";
import { ITDRCommandCenter } from "@/components/ITDRCommandCenter";
import { CARTHub } from "@/components/CARTHub";
import { AISPMCommandCenter } from "@/components/AISPMCommandCenter";
import { KMSHSMStudio } from "@/components/KMSHSMStudio";
import { BloodHoundStudio } from "@/components/BloodHoundStudio";
import { ForensicsLab } from "@/components/ForensicsLab";
import { APIShieldCenter } from "@/components/APIShieldCenter";
import { Web3SecurityStudio } from "@/components/Web3SecurityStudio";
import { SDNShieldStudio } from "@/components/SDNShieldStudio";
import { DarkWebRadarCenter } from "@/components/DarkWebRadarCenter";
import { ZKPComplianceStudio } from "@/components/ZKPComplianceStudio";
import { D3FENDMatrixViewer } from "@/components/D3FENDMatrixViewer";
import { HardwareEnclaveStudio } from "@/components/HardwareEnclaveStudio";
import { ThreatHuntingSwarmStudio } from "@/components/ThreatHuntingSwarmStudio";
import { CanaryFabricCenter } from "@/components/CanaryFabricCenter";
import { SymbolicDeobfuscatorStudio } from "@/components/SymbolicDeobfuscatorStudio";
import { WorkloadIdentityStudio } from "@/components/WorkloadIdentityStudio";
import { MicroHotpatchStudio } from "@/components/MicroHotpatchStudio";
import { CASRedTeamStudio } from "@/components/CASRedTeamStudio";
import { APTAttributionCenter } from "@/components/APTAttributionCenter";
import { CloudForensicsVault } from "@/components/CloudForensicsVault";
import { CrossPlaneMeshStudio } from "@/components/CrossPlaneMeshStudio";
import { KyberMeshVPNStudio } from "@/components/KyberMeshVPNStudio";
import { LabyrinthHoneynetStudio } from "@/components/LabyrinthHoneynetStudio";
import { AirGapLLMGuardStudio } from "@/components/AirGapLLMGuardStudio";
import { FirmwareAttestationStudio } from "@/components/FirmwareAttestationStudio";
import { IndustrialSCADAShieldStudio } from "@/components/IndustrialSCADAShieldStudio";
import { RegulatoryIncidentCommanderStudio } from "@/components/RegulatoryIncidentCommanderStudio";
import { Telecom5GSliceStudio } from "@/components/Telecom5GSliceStudio";
import { OrbitalLaserMeshStudio } from "@/components/OrbitalLaserMeshStudio";
import { AIImmuneDefenseStudio } from "@/components/AIImmuneDefenseStudio";
import { SubseaCableStudio } from "@/components/SubseaCableStudio";
import { NeuralBCIStudio } from "@/components/NeuralBCIStudio";
import { InterGridFailoverStudio } from "@/components/InterGridFailoverStudio";
import { AIModelDePoisonStudio } from "@/components/AIModelDePoisonStudio";
import { SpaceGroundQKDStudio } from "@/components/SpaceGroundQKDStudio";
import { KineticDroneShieldStudio } from "@/components/KineticDroneShieldStudio";
import { NeuromorphicSNNStudio } from "@/components/NeuromorphicSNNStudio";
import { DeepSpaceLaserStudio } from "@/components/DeepSpaceLaserStudio";
import { HypersonicDefenseStudio } from "@/components/HypersonicDefenseStudio";
import { PhotonicQuantumStudio } from "@/components/PhotonicQuantumStudio";
import { GeomagneticShieldStudio } from "@/components/GeomagneticShieldStudio";
import { HAPSStratosphereStudio } from "@/components/HAPSStratosphereStudio";
import { MarineSonarStudio } from "@/components/MarineSonarStudio";
import { OrbitalDebrisStudio } from "@/components/OrbitalDebrisStudio";
import { AirgapExploitStudio } from "@/components/AirgapExploitStudio";
import { NeutrinoArrayStudio } from "@/components/NeutrinoArrayStudio";
import { CognitiveEWStudio } from "@/components/CognitiveEWStudio";
import { AtomicClockStudio } from "@/components/AtomicClockStudio";
import { GravitationalSeismicStudio } from "@/components/GravitationalSeismicStudio";
import { CounterQuantumStudio } from "@/components/CounterQuantumStudio";
import { PlasmaShieldStudio } from "@/components/PlasmaShieldStudio";
import { CisLunarRelayStudio } from "@/components/CisLunarRelayStudio";
import { MuonTomographyStudio } from "@/components/MuonTomographyStudio";
import { AntimatterContainmentStudio } from "@/components/AntimatterContainmentStudio";
import { RedTeamClusterStudio } from "@/components/RedTeamClusterStudio";
import { SolarSailLaserStudio } from "@/components/SolarSailLaserStudio";
import { MagnetosphereDynamoStudio } from "@/components/MagnetosphereDynamoStudio";
import { MantleGeoneutrinoStudio } from "@/components/MantleGeoneutrinoStudio";
import { QuantumGravitationalStudio } from "@/components/QuantumGravitationalStudio";
import { TachyonHorizonStudio } from "@/components/TachyonHorizonStudio";
import { SingularityContainmentStudio } from "@/components/SingularityContainmentStudio";
import { ClusterFederationStudio } from "@/components/ClusterFederationStudio";
import { DarkEnergyStudio } from "@/components/DarkEnergyStudio";
import { CasimirVacuumStudio } from "@/components/CasimirVacuumStudio";
import { AnyonBraidingStudio } from "@/components/AnyonBraidingStudio";
import { QKDSpaceMeshStudio } from "@/components/QKDSpaceMeshStudio";
import { DeSitterRepulsionStudio } from "@/components/DeSitterRepulsionStudio";
import { CalabiYauModuliStudio } from "@/components/CalabiYauModuliStudio";
import { CauchyChronologyStudio } from "@/components/CauchyChronologyStudio";
import { HyperspectralInterceptorStudio } from "@/components/HyperspectralInterceptorStudio";
import { EverettBranchStudio } from "@/components/EverettBranchStudio";
import { ERBridgeSiphonStudio } from "@/components/ERBridgeSiphonStudio";
import { FalseVacuumShieldStudio } from "@/components/FalseVacuumShieldStudio";
import { OrbitalHPMStudio } from "@/components/OrbitalHPMStudio";
import { InflatonReheatingStudio } from "@/components/InflatonReheatingStudio";
import { RandallSundrumStudio } from "@/components/RandallSundrumStudio";
import { CosmicCensorshipStudio } from "@/components/CosmicCensorshipStudio";
import { DeepCrustalMHDStudio } from "@/components/DeepCrustalMHDStudio";
import { RyuTakayanagiStudio } from "@/components/RyuTakayanagiStudio";
import { DBraneTadpoleStudio } from "@/components/DBraneTadpoleStudio";
import { NovikovGeodesicStudio } from "@/components/NovikovGeodesicStudio";
import { MHDPlasmaStealthStudio } from "@/components/MHDPlasmaStealthStudio";
import { AsymptoticSafetyStudio } from "@/components/AsymptoticSafetyStudio";
import { HoravaLifshitzStudio } from "@/components/HoravaLifshitzStudio";
import { CentesimalQuantumGravityStudio } from "@/components/CentesimalQuantumGravityStudio";
import { MagnetoInertialFusionStudio } from "@/components/MagnetoInertialFusionStudio";
import TeleparallelGravityStudio from "@/components/TeleparallelGravityStudio";
import SpinFoamStudio from "@/components/SpinFoamStudio";
import NonCommutativeSpacetimeStudio from "@/components/NonCommutativeSpacetimeStudio";
import AntimatterFusionStudio from "@/components/AntimatterFusionStudio";
import StringFieldTheoryStudio from "@/components/StringFieldTheoryStudio";
import MirrorSymmetryStudio from "@/components/MirrorSymmetryStudio";
import FibonacciAnyonStudio from "@/components/FibonacciAnyonStudio";
import MonopoleBatteryStudio from "@/components/MonopoleBatteryStudio";
import MTheoryG2Studio from "@/components/MTheoryG2Studio";
import HaPPYHolographicStudio from "@/components/HaPPYHolographicStudio";
import KTheoryDBraneStudio from "@/components/KTheoryDBraneStudio";
import KugelblitzHawkingStudio from "@/components/KugelblitzHawkingStudio";
import AmplituhedronScatteringStudio from "@/components/AmplituhedronScatteringStudio";
import TwistorHolonomyStudio from "@/components/TwistorHolonomyStudio";
import CausalSetLatticeStudio from "@/components/CausalSetLatticeStudio";
import SchwingerVacuumStudio from "@/components/SchwingerVacuumStudio";
import ChernSimonsTQFTStudio from "@/components/ChernSimonsTQFTStudio";
import QuantumExtremalIslandStudio from "@/components/QuantumExtremalIslandStudio";
import GeometricLanglandsStudio from "@/components/GeometricLanglandsStudio";
import AlcubierreLentzWarpStudio from "@/components/AlcubierreLentzWarpStudio";
import CelestialHolographyStudio from "@/components/CelestialHolographyStudio";
import NonInvertibleSymTFTStudio from "@/components/NonInvertibleSymTFTStudio";
import ConformalBootstrapStudio from "@/components/ConformalBootstrapStudio";
import AxionHaloscopeStudio from "@/components/AxionHaloscopeStudio";
import SwamplandWGCStudio from "@/components/SwamplandWGCStudio";
import SYKChaosStudio from "@/components/SYKChaosStudio";
import TMFCohomologyStudio from "@/components/TMFCohomologyStudio";
import ErgosphereSpinStudio from "@/components/ErgosphereSpinStudio";
import ComplexityHolographyStudio from "@/components/ComplexityHolographyStudio";
import CarrollianHolographyStudio from "@/components/CarrollianHolographyStudio";
import ModularBootstrapStudio from "@/components/ModularBootstrapStudio";
import CasimirSagnacStudio from "@/components/CasimirSagnacStudio";
import JTWormholeStudio from "@/components/JTWormholeStudio";
import DSStaticPatchStudio from "@/components/DSStaticPatchStudio";
import HigherFormTwoGroupStudio from "@/components/HigherFormTwoGroupStudio";
import UnruhRindlerStudio from "@/components/UnruhRindlerStudio";
import MatrixBFSSFuzzballStudio from "@/components/MatrixBFSSFuzzballStudio";
import CFTDefectBCFTStudio from "@/components/CFTDefectBCFTStudio";
import EntanglementWedgeStudio from "@/components/EntanglementWedgeStudio";
import BlochSchwingerStudio from "@/components/BlochSchwingerStudio";
import {
  PLATFORM_CAPABILITIES_COUNT,
  PLATFORM_VERSION,
  PLATFORM_WAVES_RANGE,
} from "@/lib/platform";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "matrix-bfss-fuzzball", label: "BFSS Matrix Fuzzball (Cap 128)", icon: Layers },
  { id: "cft-defect-bcft", label: "BCFT g-Theorem (Cap 129)", icon: Shield },
  { id: "entanglement-wedge-cross", label: "Entanglement Wedge E_W (Cap 130)", icon: GitBranch },
  { id: "bloch-schwinger-power", label: "Floquet-Bloch Grid (Option B)", icon: Zap },
  { id: "jt-wormhole-matrix", label: "JT Wormhole Matrix (Cap 125)", icon: Orbit },
  { id: "ds-static-patch", label: "dS Static Patch (Cap 126)", icon: Compass },
  { id: "higher-form-twogroup", label: "2-Group Higher-Form (Cap 127)", icon: Network },
  { id: "unruh-rindler-power", label: "Unruh-Rindler Grid (Option B)", icon: Flame },
  { id: "complexity-holography", label: "Complexity CA/CV (Cap 122)", icon: Layers },
  { id: "carrollian-holography", label: "Carrollian Shield (Cap 123)", icon: Compass },
  { id: "modular-bootstrap", label: "Modular Bootstrap (Cap 124)", icon: Scale },
  { id: "casimir-sagnac-power", label: "Casimir-Sagnac Grid (Option B)", icon: Radio },
  { id: "swampland-wgc", label: "Swampland WGC (Cap 119)", icon: Compass },
  { id: "syk-chaos-guard", label: "SYK Chaos Guard (Cap 120)", icon: Activity },
  { id: "tmf-cohomology", label: "TMF Cohomology (Cap 121)", icon: Layers },
  { id: "ergosphere-spin-power", label: "Ergosphere Power (Option B)", icon: Zap },
  { id: "celestial-holography", label: "Celestial w1+inf (Cap 116)", icon: Orbit },
  { id: "non-invertible-symtft", label: "SymTFT Defects (Cap 117)", icon: Layers },
  { id: "conformal-bootstrap", label: "Bootstrap SDP (Cap 118)", icon: Scale },
  { id: "axion-haloscope-power", label: "Axion Haloscope (Option B)", icon: Atom },
  { id: "chern-simons-tqft", label: "Chern-Simons TQFT (Cap 113)", icon: Layers },
  { id: "quantum-extremal-island", label: "QES Island Page Curve (Cap 114)", icon: Atom },
  { id: "geometric-langlands", label: "Langlands S-Duality (Cap 115)", icon: Network },
  { id: "alcubierre-lentz-warp", label: "Lentz Soliton Warp (Option B)", icon: Rocket },
  { id: "amplituhedron-scattering", label: "Amplituhedron Matrix (Cap 110)", icon: Layers },
  { id: "twistor-holonomy", label: "Twistor Holonomy (Cap 111)", icon: Compass },
  { id: "causal-set-lattice", label: "Causal Set Poset (Cap 112)", icon: GitCommitHorizontal },
  { id: "schwinger-vacuum", label: "Schwinger Vacuum Harvester (Option B)", icon: Zap },
  { id: "m-theory-g2", label: "M-Theory G2 Compactifier (Cap 107)", icon: Atom },
  { id: "happy-holographic-qec", label: "HaPPY Holographic QEC (Cap 108)", icon: Network },
  { id: "ktheory-dbrane", label: "K-Theory D-Brane (Cap 109)", icon: Layers },
  { id: "kugelblitz-hawking", label: "Kugelblitz Hawking Gen (Option B)", icon: Flame },
  { id: "string-field-theory", label: "String Field Theory (Cap 104)", icon: GitPullRequest },
  { id: "mirror-symmetry", label: "Mirror Symmetry (Cap 105)", icon: FlipHorizontal },
  { id: "fibonacci-anyon", label: "Fibonacci Anyons (Cap 106)", icon: Network },
  { id: "monopole-battery", label: "Monopole Battery (Option B)", icon: BatteryCharging },
  { id: "teleparallel-gravity", label: "Teleparallel Gravity (Cap 101)", icon: Compass },
  { id: "spin-foam", label: "Spin-Foam Quantizer (Cap 102)", icon: Box },
  { id: "noncommutative-spacetime", label: "Non-Commutative Spacetime (Cap 103)", icon: Maximize2 },
  { id: "antimatter-fusion", label: "Antimatter Fusion Rocket (Option B)", icon: Rocket },
  { id: "centesimal-quantum-gravity", label: "Centesimal Quantum Gravity (Century Cap 100)", icon: Award },
  { id: "asymptotic-safety", label: "Asymptotic Safety RG", icon: TrendingDown },
  { id: "horava-lifshitz", label: "Horava-Lifshitz Scaling", icon: Compass },
  { id: "magneto-inertial-fusion", label: "Magneto-Inertial Fusion", icon: Flame },
  { id: "ryu-takayanagi", label: "Ryu-Takayanagi Siphon", icon: Globe },
  { id: "dbrane-tadpole", label: "D-Brane Tadpole", icon: Filter },
  { id: "novikov-geodesic", label: "Novikov Geodesic", icon: RotateCcw },
  { id: "mhd-plasma-stealth", label: "MHD Plasma Stealth", icon: Wind },
  { id: "inflaton-reheating", label: "Inflaton Reheating", icon: Flame },
  { id: "randall-sundrum", label: "Randall-Sundrum 5D", icon: Layers },
  { id: "cosmic-censorship", label: "Cosmic Censorship", icon: ShieldAlert },
  { id: "deep-crustal-mhd", label: "Deep-Crustal MHD", icon: Mountain },
  { id: "everett-branch", label: "Everett Multiverse", icon: GitBranch },
  { id: "er-bridge", label: "ER=EPR Bridge Siphon", icon: Atom },
  { id: "false-vacuum", label: "False Vacuum Shield", icon: ShieldAlert },
  { id: "orbital-hpm", label: "Orbital HPM Grid", icon: Radio },
  { id: "desitter-repulsion", label: "de Sitter Repulsion", icon: Globe },
  { id: "calabi-yau", label: "Calabi-Yau 10D", icon: Layers },
  { id: "cauchy-chronology", label: "Cauchy Chronology", icon: Clock },
  { id: "hyperspectral-interceptor", label: "Hyperspectral Swarm", icon: Satellite },
  { id: "dark-energy", label: "Dark Energy Harvester", icon: Sparkles },
  { id: "casimir-vacuum", label: "Casimir Vacuum", icon: Zap },
  { id: "anyon-braiding", label: "Anyon Braiding Matrix", icon: Binary },
  { id: "qkd-space-mesh", label: "Interstellar QKD Mesh", icon: Network },
  { id: "quantum-gravitational", label: "Quantum Gravitational", icon: Radio },
  { id: "tachyon-horizon", label: "Tachyon Horizon", icon: Clock },
  { id: "singularity-containment", label: "Singularity Containment", icon: Flame },
  { id: "cluster-federation", label: "Cluster Federation", icon: Globe2 },
  { id: "solar-sail-laser", label: "Solar Sail Laser", icon: Sun },
  { id: "magnetosphere-dynamo", label: "Magnetosphere Dynamo", icon: Globe },
  { id: "mantle-geoneutrino", label: "Mantle Geoneutrino", icon: Flame },
  { id: "cislunar-relay", label: "Cis-Lunar Relay", icon: Satellite },
  { id: "muon-tomography", label: "Muon Tomography", icon: Mountain },
  { id: "antimatter-containment", label: "Antimatter Containment", icon: Flame },
  { id: "redteam-cluster", label: "Red-Team Cluster", icon: Skull },
  { id: "gravitational-seismic", label: "Gravitational Seismic", icon: Activity },
  { id: "counter-quantum", label: "Counter-Quantum", icon: Lock },
  { id: "plasma-shield", label: "Plasma Shield", icon: Sun },
  { id: "neutrino-array", label: "Neutrino Array", icon: Atom },
  { id: "cognitive-ew", label: "Cognitive EW", icon: Radio },
  { id: "atomic-clock", label: "Atomic Clock", icon: Clock },
  { id: "marine-sonar", label: "Ocean Sonar", icon: Waves },
  { id: "orbital-debris", label: "Debris Deflector", icon: Orbit },
  { id: "airgap-exploit-swarm", label: "Zero-Day Swarm", icon: Binary },
  { id: "photonic-quantum", label: "Photonic Quantum", icon: Sparkles },
  { id: "geomagnetic-shield", label: "CME Solar Shield", icon: Sun },
  { id: "haps-stratosphere", label: "HAPS Swarm", icon: Plane },
  { id: "neuromorphic-snn", label: "Neuro SNN", icon: Cpu },
  { id: "deep-space-laser", label: "Deep-Space Laser", icon: Satellite },
  { id: "hypersonic-defense", label: "Hypersonic Defense", icon: Rocket },
  { id: "ai-depoison", label: "AI De-Poison", icon: Scissors },
  { id: "space-ground-qkd", label: "Space QKD", icon: Atom },
  { id: "drone-swarm-shield", label: "Drone Shield", icon: Crosshair },
  { id: "subsea-cable", label: "Subsea Fiber", icon: Waves },
  { id: "neural-bci", label: "Neural BCI", icon: Brain },
  { id: "intergrid-failover", label: "Inter-Grid", icon: Zap },
  { id: "telecom-5g", label: "5G/6G RAN", icon: Antenna },
  { id: "orbital-laser", label: "Orbital Laser", icon: Globe2 },
  { id: "ai-immune", label: "AI Immune", icon: Dna },
  { id: "firmware-attestation", label: "Firmware UEFI", icon: Cpu },
  { id: "industrial-scada", label: "SCADA Kinetic", icon: Zap },
  { id: "regulatory-commander", label: "SEC 8-K Legal", icon: Scale },
  { id: "micro-hotpatch", label: "Micro-Hotpatch", icon: Cpu },
  { id: "cas-redteam", label: "CAS Red-Team", icon: Flame },
  { id: "apt-attribution", label: "APT Attribution", icon: Globe2 },
  { id: "cloud-forensics", label: "Forensic Vault", icon: HardDrive },
  { id: "crossplane-mesh", label: "Cross-Plane Mesh", icon: Network },
  { id: "kyber-mesh-vpn", label: "Kyber PQC Mesh", icon: Radio },
  { id: "labyrinth-honeynet", label: "Honeynet Labyrinth", icon: Compass },
  { id: "airgap-llm-guard", label: "Air-Gapped LLM", icon: Cpu },
  { id: "deobfuscator", label: "De-Obfuscator", icon: Code2 },
  { id: "workload-identity", label: "Workload SPIFFE", icon: Fingerprint },
  { id: "hunting-swarm", label: "Hunter Swarm", icon: Bot },
  { id: "canary-fabric", label: "Canary Fabric", icon: Radio },
  { id: "hardware-enclave", label: "Hardware Enclave", icon: Cpu },
  { id: "web3-security", label: "Web3 Security", icon: Coins },
  { id: "sdn-shield", label: "SDN Micro-Shield", icon: Zap },
  { id: "darkweb-radar", label: "Dark Web Radar", icon: Skull },
  { id: "zkp-compliance", label: "ZKP Attestation", icon: FileCheck2 },
  { id: "d3fend-matrix", label: "MITRE D3FEND", icon: Grid3X3 },
  { id: "ai-spm", label: "AI-SPM & LLMs", icon: Bot },
  { id: "kms-hsm", label: "KMS HSM & Shamir", icon: KeyRound },
  { id: "bloodhound", label: "Active Directory", icon: Network },
  { id: "forensics", label: "Live Forensics", icon: Microscope },
  { id: "api-shield", label: "API Shield (BOLA)", icon: ShieldAlert },
  { id: "adversary-emulation", label: "Adversary Emulation", icon: Crosshair },
  { id: "iac-drift", label: "IaC Drift Engine", icon: GitPullRequest },
  { id: "sbom-vex", label: "SBOM & OpenVEX", icon: PackageCheck },
  { id: "itdr", label: "Identity (ITDR)", icon: Fingerprint },
  { id: "cart-paths", label: "Attack Paths (CART)", icon: GitBranch },
  { id: "ai-soc", label: "AI SOC Triage", icon: ShieldAlert },
  { id: "threat-hunting", label: "Threat Hunting", icon: Search },
  { id: "anti-ransomware", label: "Anti-Ransomware", icon: AlertOctagon },
  { id: "dspm", label: "Cloud DSPM", icon: Database },
  { id: "cti-hub", label: "CTI & STIX", icon: Share2 },
  { id: "enterprise", label: "Enterprise Hub", icon: ShieldCheck },
  { id: "enclave", label: "Zero Egress Enclave", icon: Lock },
  { id: "threat-modeling", label: "Threat Modeling", icon: FileCheck },
  { id: "quantum-safe", label: "Quantum Safe PQC", icon: Cpu },
  { id: "ebpf-telemetry", label: "eBPF SIEM", icon: Terminal },
  { id: "cspm", label: "Cloud Posture", icon: Cloud },
  { id: "supply-chain", label: "Supply Chain", icon: Package },
  { id: "ztna", label: "Zero-Trust", icon: Network },
  { id: "adversary-matrix", label: "MITRE ATT&CK", icon: Swords },
  { id: "easm", label: "Shadow IT", icon: Globe },
  { id: "consensus", label: "Multi-AI Debate", icon: Swords },
  { id: "deep-analysis", label: "Deep Attacks", icon: Flame },
  { id: "detonation", label: "Malware Lab", icon: Biohazard },
  { id: "rules", label: "Rule Forge", icon: ScrollText },
  { id: "deception", label: "Honeypots", icon: Radio },
  { id: "defense-grid", label: "Defense Grid", icon: Network },
  { id: "cyber-range", label: "Cyber Range", icon: Crosshair },
  { id: "incidents", label: "Incidents & SOAR", icon: AlertTriangle },
  { id: "observability", label: "Observability", icon: Activity },
  { id: "posture", label: "Security Shield", icon: Shield },
  { id: "copilot", label: "AI Copilot", icon: Sparkles },
  { id: "intel", label: "Intel Hub", icon: Radar },
  { id: "redteam", label: "Red Team", icon: ShieldAlert },
  { id: "schedules", label: "Schedules", icon: Clock },
  { id: "asm", label: "ASM", icon: Activity },
  { id: "autofix", label: "Auto-Fix", icon: GitBranch },
  { id: "compliance", label: "Compliance", icon: FileCheck },
  { id: "health", label: "Health", icon: HeartPulse },
  { id: "threats", label: "Threats", icon: Rss },
  { id: "warroom", label: "War Room", icon: Globe },
] as const;

type TabId = (typeof tabs)[number]["id"];

const CORE_TAB_IDS = new Set([
  "overview",
  "incidents",
  "observability",
  "posture",
  "copilot",
  "intel",
  "redteam",
  "schedules",
  "asm",
  "autofix",
  "compliance",
  "health",
  "threats",
  "warroom",
  "ai-soc",
  "threat-hunting",
  "defense-grid",
  "cyber-range",
]);

const CLOUD_TAB_IDS = new Set([
  "cspm",
  "supply-chain",
  "ztna",
  "easm",
  "dspm",
  "cti-hub",
  "enterprise",
  "enclave",
  "threat-modeling",
  "quantum-safe",
  "ebpf-telemetry",
  "kms-hsm",
  "bloodhound",
  "api-shield",
  "iac-drift",
  "sbom-vex",
  "itdr",
  "cart-paths",
  "ai-spm",
  "crossplane-mesh",
  "workload-identity",
  "hardware-enclave",
  "web3-security",
  "sdn-shield",
  "zkp-compliance",
  "d3fend-matrix",
  "cloud-forensics",
  "regulatory-commander",
  "anti-ransomware",
]);

const OFFENSIVE_TAB_IDS = new Set([
  "adversary-matrix",
  "adversary-emulation",
  "forensics",
  "consensus",
  "deep-analysis",
  "detonation",
  "rules",
  "deception",
  "labyrinth-honeynet",
  "canary-fabric",
  "hunting-swarm",
  "deobfuscator",
  "micro-hotpatch",
  "cas-redteam",
  "apt-attribution",
  "darkweb-radar",
  "redteam-cluster",
  "airgap-exploit-swarm",
]);

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "core" | "cloud" | "offensive" | "frontier">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTabs = tabs.filter((tab) => {
    if (selectedCategory === "core" && !CORE_TAB_IDS.has(tab.id)) return false;
    if (selectedCategory === "cloud" && !CLOUD_TAB_IDS.has(tab.id)) return false;
    if (selectedCategory === "offensive" && !OFFENSIVE_TAB_IDS.has(tab.id)) return false;
    if (
      selectedCategory === "frontier" &&
      (CORE_TAB_IDS.has(tab.id) || CLOUD_TAB_IDS.has(tab.id) || OFFENSIVE_TAB_IDS.has(tab.id))
    )
      return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return tab.label.toLowerCase().includes(q) || tab.id.toLowerCase().includes(q);
    }

    return true;
  });

  return (
    <main className="min-h-screen bg-black text-emerald-50 font-sans selection:bg-emerald-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-black to-black z-0 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-900/30 rounded-lg">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black tracking-tight text-white">Command Center</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  v{PLATFORM_VERSION} &bull; {PLATFORM_WAVES_RANGE} &bull; {PLATFORM_CAPABILITIES_COUNT} Capabilities
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-mono">
                SageAI Sovereign Defense Grid &bull; {tabs.length} Active Modules &bull; 10-Pillar Orchestration
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${tabs.length} modules...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 text-xs scrollbar-none">
          {(
            [
              { id: "all", label: "All Modules", count: tabs.length },
              { id: "core", label: "Core SOC & Ops", count: tabs.filter((t) => CORE_TAB_IDS.has(t.id)).length },
              { id: "cloud", label: "Cloud & Identity", count: tabs.filter((t) => CLOUD_TAB_IDS.has(t.id)).length },
              { id: "offensive", label: "Offensive & Deception", count: tabs.filter((t) => OFFENSIVE_TAB_IDS.has(t.id)).length },
              {
                id: "frontier",
                label: "Frontier Systems",
                count: tabs.filter(
                  (t) => !CORE_TAB_IDS.has(t.id) && !CLOUD_TAB_IDS.has(t.id) && !OFFENSIVE_TAB_IDS.has(t.id)
                ).length,
              },
            ] as const
          ).map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-sm shadow-emerald-950"
                    : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:bg-zinc-900"
                }`}
              >
                <span>{cat.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800/80 text-zinc-400 font-mono">
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-1 border-b border-zinc-800">
          {filteredTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-emerald-900/30 text-emerald-400 border-b-2 border-emerald-500"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
          {filteredTabs.length === 0 && (
            <div className="py-2.5 px-3 text-xs text-zinc-500 italic flex items-center gap-2">
              No modules match &quot;{searchQuery}&quot;.
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="text-emerald-400 underline font-mono ml-2 hover:text-emerald-300 not-italic"
              >
                Reset search filter
              </button>
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {activeTab === "overview" && <DashboardOverview />}
          {activeTab === "matrix-bfss-fuzzball" && <MatrixBFSSFuzzballStudio />}
          {activeTab === "cft-defect-bcft" && <CFTDefectBCFTStudio />}
          {activeTab === "entanglement-wedge-cross" && <EntanglementWedgeStudio />}
          {activeTab === "bloch-schwinger-power" && <BlochSchwingerStudio />}
          {activeTab === "jt-wormhole-matrix" && <JTWormholeStudio />}
          {activeTab === "ds-static-patch" && <DSStaticPatchStudio />}
          {activeTab === "higher-form-twogroup" && <HigherFormTwoGroupStudio />}
          {activeTab === "unruh-rindler-power" && <UnruhRindlerStudio />}
          {activeTab === "complexity-holography" && <ComplexityHolographyStudio />}
          {activeTab === "carrollian-holography" && <CarrollianHolographyStudio />}
          {activeTab === "modular-bootstrap" && <ModularBootstrapStudio />}
          {activeTab === "casimir-sagnac-power" && <CasimirSagnacStudio />}
          {activeTab === "swampland-wgc" && <SwamplandWGCStudio />}
          {activeTab === "syk-chaos-guard" && <SYKChaosStudio />}
          {activeTab === "tmf-cohomology" && <TMFCohomologyStudio />}
          {activeTab === "ergosphere-spin-power" && <ErgosphereSpinStudio />}
          {activeTab === "celestial-holography" && <CelestialHolographyStudio />}
          {activeTab === "non-invertible-symtft" && <NonInvertibleSymTFTStudio />}
          {activeTab === "conformal-bootstrap" && <ConformalBootstrapStudio />}
          {activeTab === "axion-haloscope-power" && <AxionHaloscopeStudio />}
          {activeTab === "chern-simons-tqft" && <ChernSimonsTQFTStudio />}
          {activeTab === "quantum-extremal-island" && <QuantumExtremalIslandStudio />}
          {activeTab === "geometric-langlands" && <GeometricLanglandsStudio />}
          {activeTab === "alcubierre-lentz-warp" && <AlcubierreLentzWarpStudio />}
          {activeTab === "amplituhedron-scattering" && <AmplituhedronScatteringStudio />}
          {activeTab === "twistor-holonomy" && <TwistorHolonomyStudio />}
          {activeTab === "causal-set-lattice" && <CausalSetLatticeStudio />}
          {activeTab === "schwinger-vacuum" && <SchwingerVacuumStudio />}
          {activeTab === "m-theory-g2" && <MTheoryG2Studio />}
          {activeTab === "happy-holographic-qec" && <HaPPYHolographicStudio />}
          {activeTab === "ktheory-dbrane" && <KTheoryDBraneStudio />}
          {activeTab === "kugelblitz-hawking" && <KugelblitzHawkingStudio />}
          {activeTab === "string-field-theory" && <StringFieldTheoryStudio />}
          {activeTab === "mirror-symmetry" && <MirrorSymmetryStudio />}
          {activeTab === "fibonacci-anyon" && <FibonacciAnyonStudio />}
          {activeTab === "monopole-battery" && <MonopoleBatteryStudio />}
          {activeTab === "teleparallel-gravity" && <TeleparallelGravityStudio />}
          {activeTab === "spin-foam" && <SpinFoamStudio />}
          {activeTab === "noncommutative-spacetime" && <NonCommutativeSpacetimeStudio />}
          {activeTab === "antimatter-fusion" && <AntimatterFusionStudio />}
          {activeTab === "centesimal-quantum-gravity" && <CentesimalQuantumGravityStudio />}
          {activeTab === "asymptotic-safety" && <AsymptoticSafetyStudio />}
          {activeTab === "horava-lifshitz" && <HoravaLifshitzStudio />}
          {activeTab === "magneto-inertial-fusion" && <MagnetoInertialFusionStudio />}
          {activeTab === "ryu-takayanagi" && <RyuTakayanagiStudio />}
          {activeTab === "dbrane-tadpole" && <DBraneTadpoleStudio />}
          {activeTab === "novikov-geodesic" && <NovikovGeodesicStudio />}
          {activeTab === "mhd-plasma-stealth" && <MHDPlasmaStealthStudio />}
          {activeTab === "inflaton-reheating" && <InflatonReheatingStudio />}
          {activeTab === "randall-sundrum" && <RandallSundrumStudio />}
          {activeTab === "cosmic-censorship" && <CosmicCensorshipStudio />}
          {activeTab === "deep-crustal-mhd" && <DeepCrustalMHDStudio />}
          {activeTab === "everett-branch" && <EverettBranchStudio />}
          {activeTab === "er-bridge" && <ERBridgeSiphonStudio />}
          {activeTab === "false-vacuum" && <FalseVacuumShieldStudio />}
          {activeTab === "orbital-hpm" && <OrbitalHPMStudio />}
          {activeTab === "desitter-repulsion" && <DeSitterRepulsionStudio />}
          {activeTab === "calabi-yau" && <CalabiYauModuliStudio />}
          {activeTab === "cauchy-chronology" && <CauchyChronologyStudio />}
          {activeTab === "hyperspectral-interceptor" && <HyperspectralInterceptorStudio />}
          {activeTab === "dark-energy" && <DarkEnergyStudio />}
          {activeTab === "casimir-vacuum" && <CasimirVacuumStudio />}
          {activeTab === "anyon-braiding" && <AnyonBraidingStudio />}
          {activeTab === "qkd-space-mesh" && <QKDSpaceMeshStudio />}
          {activeTab === "quantum-gravitational" && <QuantumGravitationalStudio />}
          {activeTab === "tachyon-horizon" && <TachyonHorizonStudio />}
          {activeTab === "singularity-containment" && <SingularityContainmentStudio />}
          {activeTab === "cluster-federation" && <ClusterFederationStudio />}
          {activeTab === "solar-sail-laser" && <SolarSailLaserStudio />}
          {activeTab === "magnetosphere-dynamo" && <MagnetosphereDynamoStudio />}
          {activeTab === "mantle-geoneutrino" && <MantleGeoneutrinoStudio />}
          {activeTab === "cislunar-relay" && <CisLunarRelayStudio />}
          {activeTab === "muon-tomography" && <MuonTomographyStudio />}
          {activeTab === "antimatter-containment" && <AntimatterContainmentStudio />}
          {activeTab === "redteam-cluster" && <RedTeamClusterStudio />}
          {activeTab === "gravitational-seismic" && <GravitationalSeismicStudio />}
          {activeTab === "counter-quantum" && <CounterQuantumStudio />}
          {activeTab === "plasma-shield" && <PlasmaShieldStudio />}
          {activeTab === "neutrino-array" && <NeutrinoArrayStudio />}
          {activeTab === "cognitive-ew" && <CognitiveEWStudio />}
          {activeTab === "atomic-clock" && <AtomicClockStudio />}
          {activeTab === "marine-sonar" && <MarineSonarStudio />}
          {activeTab === "orbital-debris" && <OrbitalDebrisStudio />}
          {activeTab === "airgap-exploit-swarm" && <AirgapExploitStudio />}
          {activeTab === "photonic-quantum" && <PhotonicQuantumStudio />}
          {activeTab === "geomagnetic-shield" && <GeomagneticShieldStudio />}
          {activeTab === "haps-stratosphere" && <HAPSStratosphereStudio />}
          {activeTab === "neuromorphic-snn" && <NeuromorphicSNNStudio />}
          {activeTab === "deep-space-laser" && <DeepSpaceLaserStudio />}
          {activeTab === "hypersonic-defense" && <HypersonicDefenseStudio />}
          {activeTab === "ai-depoison" && <AIModelDePoisonStudio />}
          {activeTab === "space-ground-qkd" && <SpaceGroundQKDStudio />}
          {activeTab === "drone-swarm-shield" && <KineticDroneShieldStudio />}
          {activeTab === "subsea-cable" && <SubseaCableStudio />}
          {activeTab === "neural-bci" && <NeuralBCIStudio />}
          {activeTab === "intergrid-failover" && <InterGridFailoverStudio />}
          {activeTab === "telecom-5g" && <Telecom5GSliceStudio />}
          {activeTab === "orbital-laser" && <OrbitalLaserMeshStudio />}
          {activeTab === "ai-immune" && <AIImmuneDefenseStudio />}
          {activeTab === "firmware-attestation" && <FirmwareAttestationStudio />}
          {activeTab === "industrial-scada" && <IndustrialSCADAShieldStudio />}
          {activeTab === "regulatory-commander" && <RegulatoryIncidentCommanderStudio />}
          {activeTab === "micro-hotpatch" && <MicroHotpatchStudio />}
          {activeTab === "cas-redteam" && <CASRedTeamStudio />}
          {activeTab === "apt-attribution" && <APTAttributionCenter />}
          {activeTab === "cloud-forensics" && <CloudForensicsVault />}
          {activeTab === "crossplane-mesh" && <CrossPlaneMeshStudio />}
          {activeTab === "kyber-mesh-vpn" && <KyberMeshVPNStudio />}
          {activeTab === "labyrinth-honeynet" && <LabyrinthHoneynetStudio />}
          {activeTab === "airgap-llm-guard" && <AirGapLLMGuardStudio />}
          {activeTab === "deobfuscator" && <SymbolicDeobfuscatorStudio />}
          {activeTab === "workload-identity" && <WorkloadIdentityStudio />}
          {activeTab === "hunting-swarm" && <ThreatHuntingSwarmStudio />}
          {activeTab === "canary-fabric" && <CanaryFabricCenter />}
          {activeTab === "hardware-enclave" && <HardwareEnclaveStudio />}
          {activeTab === "web3-security" && <Web3SecurityStudio />}
          {activeTab === "sdn-shield" && <SDNShieldStudio />}
          {activeTab === "darkweb-radar" && <DarkWebRadarCenter />}
          {activeTab === "zkp-compliance" && <ZKPComplianceStudio />}
          {activeTab === "d3fend-matrix" && <D3FENDMatrixViewer />}
          {activeTab === "ai-spm" && <AISPMCommandCenter />}
          {activeTab === "kms-hsm" && <KMSHSMStudio />}
          {activeTab === "bloodhound" && <BloodHoundStudio />}
          {activeTab === "forensics" && <ForensicsLab />}
          {activeTab === "api-shield" && <APIShieldCenter />}
          {activeTab === "adversary-emulation" && <AdversaryEmulationStudio />}
          {activeTab === "iac-drift" && <IaCDriftEngine />}
          {activeTab === "sbom-vex" && <SBOMVexStudio />}
          {activeTab === "itdr" && <ITDRCommandCenter />}
          {activeTab === "cart-paths" && <CARTHub />}
          {activeTab === "ai-soc" && <AISOCCommandCenter />}
          {activeTab === "threat-hunting" && <ThreatHuntingStudio />}
          {activeTab === "anti-ransomware" && <AntiRansomwareShield />}
          {activeTab === "dspm" && <DSPMHub />}
          {activeTab === "cti-hub" && <CTIHub />}
          {activeTab === "enterprise" && <EnterpriseSecurityHub />}
          {activeTab === "enclave" && <ZeroEgressEnclave />}
          {activeTab === "threat-modeling" && <ThreatModelingStudio />}
          {activeTab === "quantum-safe" && <QuantumSafeStudio />}
          {activeTab === "ebpf-telemetry" && <EBPFTelemetryMonitor />}
          {activeTab === "cspm" && <CSPMHub />}
          {activeTab === "supply-chain" && <SupplyChainStudio />}
          {activeTab === "ztna" && <ZTNAManager />}
          {activeTab === "adversary-matrix" && <AdversaryMatrixViewer />}
          {activeTab === "easm" && <EASMHunter />}
          {activeTab === "consensus" && <AIConsensusArena />}
          {activeTab === "deep-analysis" && <DeepAnalysisPanel />}
          {activeTab === "detonation" && <DetonationChamber />}
          {activeTab === "rules" && <ThreatRuleSynthesizer />}
          {activeTab === "deception" && <HoneypotCenter />}
          {activeTab === "defense-grid" && <DefenseGridMonitor />}
          {activeTab === "cyber-range" && <CyberRangeArena />}
          {activeTab === "incidents" && <IncidentCenter />}
          {activeTab === "observability" && <ObservabilityDashboard />}
          {activeTab === "posture" && <SecurityPosture />}
          {activeTab === "copilot" && <AICopilot />}
          {activeTab === "intel" && <IntelligenceHub />}
          {activeTab === "redteam" && <RedTeamPanel />}
          {activeTab === "schedules" && <ScheduleManager />}
          {activeTab === "asm" && <ASMTimeline />}
          {activeTab === "autofix" && <AutoFixPanel />}
          {activeTab === "compliance" && <ComplianceCenter />}
          {activeTab === "health" && <SystemHealth />}
          {activeTab === "threats" && <ThreatFeed />}
          {activeTab === "warroom" && <WarRoom />}
        </div>
      </div>
    </main>
  );
}
