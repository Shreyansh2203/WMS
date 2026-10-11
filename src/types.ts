export type Theme = 'light' | 'dark';

export type DashboardView =
  | 'topology'
  | 'reconciliation'
  | 'consolidate'
  | 'freezer'
  | 'odi_sync'
  | 'handoff';

export type HotspotNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface HotspotMeta {
  number: HotspotNumber;
  title: string;
  category: 'MIPS Demand' | 'WMS Inventory' | 'Oracle Interface';
  description: string;
  realWorldExample: string;
}

export interface ReconciliationItem {
  id: string;
  hotspotNumber: HotspotNumber;
  hotspotTitle: string;
  sku: string;
  skuName: string;
  plantLine: string;
  runNumber: string;
  workOrder: string;
  salesDate: string;
  mipsQty: number;
  wmsQty: number;
  varianceQty: number;
  unnecessaryProductionRiskQty: number;
  financialImpact: number;
  status: 'pending_approval' | 'approved_executed' | 'dismissed' | 'auto_reconciled';
  aiRecommendation: string;
  proposedAction: string;
  affectedSystems: ('MIPS' | 'WMS' | 'ORACLE_ODI' | 'BUSS')[];
  detectedAt: string;
  approvedBy?: string;
  approvedShift?: string;
  approvedAt?: string;
  notes?: string;
}

export interface ConsolidatedPosition {
  sku: string;
  description: string;
  plantLine: string;
  salesDate: string;
  totalValidDemand: number;
  usableInventory: number;
  completedProduction: number;
  returnsAdjustments: number;
  netRequirement: number;
  mipsDisplayRequirement: number;
  overproductionPrevented: number;
  status: 'reconciled' | 'mismatch_flagged' | 'in_production';
}

export interface FreezerLot {
  lotId: string;
  sku: string;
  description: string;
  quantity: number;
  usedDate: string;
  movedFromLine: string;
  movedToLine: string;
  wmsStatus: 'Ghost - Pending Deduction' | 'Deducted' | 'Active Lot';
  impactNote: string;
}

export interface OdiTransaction {
  id: string;
  ticketNumber: string;
  sku: string;
  qty: number;
  scannedAtWms: string;
  oracleStatus: 'delivered' | 'lagging_sla' | 'interface_failed';
  latencyMinutes: number;
  errorDetail?: string;
}

export interface Supervisor {
  id: string;
  name: string;
  shift: 'Shift 1 (06:00 - 14:00)' | 'Shift 2 (14:00 - 22:00)' | 'Shift 3 (22:00 - 06:00)';
  role: string;
  activeApprovalsCount: number;
  status: 'on_duty' | 'off_duty';
}

export interface ShiftHandoffLog {
  id: string;
  timestamp: string;
  fromShift: string;
  toShift: string;
  supervisorName: string;
  summary: string;
  unresolvedMismatchesCount: number;
  criticalLotsHandedOver: string[];
}
