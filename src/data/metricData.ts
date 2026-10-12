export type MetricRange = '7D' | '30D' | '90D' | '12M';

export interface MetricPoint {
  date: string;
  timestamp: number;
  value: number;
}

export interface MetricDefinition {
  id: string;
  title: string;
  system: 'WMS' | 'BUSS' | 'MIPS' | 'ODI';
  systemName: string;
  unit: string;
  unitPrefix?: string;
  decimals: number;
  isInverseGood?: boolean; // e.g. lower latency is good
  targetBenchmark?: number;
  description: string;
  series: Record<MetricRange, MetricPoint[]>;
}

// Generate realistic daily time series ending at the current operational baseline (Oct 12, 2026)
function generateDailyPoints(
  days: number,
  baseValue: number,
  volatility: number,
  trend: number = 0,
  minVal?: number,
  maxVal?: number
): MetricPoint[] {
  const points: MetricPoint[] = [];
  const endEpoch = new Date('2026-10-12T00:00:00Z').getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  let current = baseValue;
  for (let i = days - 1; i >= 0; i--) {
    const time = endEpoch - i * dayMs;
    const d = new Date(time);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

    // deterministic pseudo-noise using sine waves + index
    const noise = Math.sin(i * 0.7) * volatility + Math.cos(i * 1.3) * (volatility * 0.5);
    current = baseValue + noise + ((days - 1 - i) / days) * trend;
    if (minVal !== undefined) current = Math.max(minVal, current);
    if (maxVal !== undefined) current = Math.min(maxVal, current);

    points.push({
      date: dateStr,
      timestamp: time,
      value: Number(current.toFixed(2)),
    });
  }

  return points;
}

export const METRIC_EXPLORER_DATA: MetricDefinition[] = [
  {
    id: 'wms-pallets',
    title: 'Stored Pallet Volume',
    system: 'WMS',
    systemName: 'Warehouse Core',
    unit: 'plts',
    decimals: 0,
    targetBenchmark: 12000,
    description: 'Active pallet units tracked across ambient aisles, staging bays, and blast freezer sub-inventory.',
    series: {
      '7D': generateDailyPoints(7, 11820, 110, 100),
      '30D': generateDailyPoints(30, 11450, 160, 470),
      '90D': generateDailyPoints(90, 10800, 240, 1120),
      '12M': generateDailyPoints(52, 9800, 320, 2120), // 52 weeks
    },
  },
  {
    id: 'buss-allocation',
    title: 'Demand Allocation Rate',
    system: 'BUSS',
    systemName: 'Demand & Scheduling',
    unit: '%',
    decimals: 1,
    targetBenchmark: 95.0,
    description: 'Percentage of customer commercial sales orders with fully allocated and balanced inventory.',
    series: {
      '7D': generateDailyPoints(7, 96.8, 0.4, 0.6, 92, 100),
      '30D': generateDailyPoints(30, 94.2, 0.8, 3.2, 90, 100),
      '90D': generateDailyPoints(90, 91.5, 1.4, 5.9, 88, 100),
      '12M': generateDailyPoints(52, 88.0, 1.9, 9.4, 85, 100),
    },
  },
  {
    id: 'mips-oee',
    title: 'Shop Floor OEE Yield',
    system: 'MIPS',
    systemName: 'Manufacturing MES',
    unit: '%',
    decimals: 1,
    targetBenchmark: 92.0,
    description: 'Overall Equipment Effectiveness and yield rate across plant lines 1–4.',
    series: {
      '7D': generateDailyPoints(7, 94.4, 0.5, 0.4, 90, 99),
      '30D': generateDailyPoints(30, 93.1, 0.9, 1.7, 88, 99),
      '90D': generateDailyPoints(90, 90.8, 1.6, 4.0, 85, 99),
      '12M': generateDailyPoints(52, 86.5, 2.1, 8.3, 80, 99),
    },
  },
  {
    id: 'odi-latency',
    title: 'ODI Interface Latency',
    system: 'ODI',
    systemName: 'Oracle Cloud ERP',
    unit: 'min',
    decimals: 1,
    isInverseGood: true,
    targetBenchmark: 10.0,
    description: 'Change data capture transfer latency between shop floor staging tables and Oracle General Ledger.',
    series: {
      '7D': generateDailyPoints(7, 6.8, 0.4, -0.6, 3, 15),
      '30D': generateDailyPoints(30, 7.9, 0.7, -1.7, 3, 16),
      '90D': generateDailyPoints(90, 9.4, 1.1, -3.2, 3, 18),
      '12M': generateDailyPoints(52, 11.2, 1.4, -5.0, 3, 22),
    },
  },
];
