import React, { useState, useRef, useId, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MetricRange,
  MetricDefinition,
  METRIC_EXPLORER_DATA,
} from '../data/metricData';
import {
  X,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Calendar,
  Layers,
  ArrowRightLeft,
  Check,
} from 'lucide-react';
import { playTactileTick } from '../utils/audio';

interface MetricExplorerProps {
  onNavigateToSystem?: (system: 'wms' | 'buss' | 'mips' | 'oracle_odi') => void;
  isSoundEnabled?: boolean;
}

const RANGES: { id: MetricRange; label: string }[] = [
  { id: '7D', label: '7D' },
  { id: '30D', label: '30D' },
  { id: '90D', label: '90D' },
  { id: '12M', label: '12M' },
];

export const MetricExplorer: React.FC<MetricExplorerProps> = ({
  onNavigateToSystem,
  isSoundEnabled = true,
}) => {
  const [selectedMetricId, setSelectedMetricId] = useState<string | null>(null);
  const [compareMetricId, setCompareMetricId] = useState<string | null>(null);
  const [isCompareMenuOpen, setIsCompareMenuOpen] = useState(false);
  const [range, setRange] = useState<MetricRange>('30D');
  const [scrubIndex, setScrubIndex] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [announcement, setAnnouncement] = useState<string>('');

  const chartRef = useRef<SVGSVGElement | null>(null);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const tabListRef = useRef<HTMLDivElement | null>(null);
  const panelId = useId();

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const activeMetric: MetricDefinition = useMemo(() => {
    return (
      METRIC_EXPLORER_DATA.find((m) => m.id === selectedMetricId) ||
      METRIC_EXPLORER_DATA[0]
    );
  }, [selectedMetricId]);

  const compareMetric: MetricDefinition | null = useMemo(() => {
    if (!compareMetricId || compareMetricId === activeMetric.id) return null;
    return METRIC_EXPLORER_DATA.find((m) => m.id === compareMetricId) || null;
  }, [compareMetricId, activeMetric.id]);

  const activePoints = useMemo(() => {
    return activeMetric.series[range] || [];
  }, [activeMetric, range]);

  const comparePoints = useMemo(() => {
    if (!compareMetric) return [];
    return compareMetric.series[range] || [];
  }, [compareMetric, range]);

  // Reset scrub index when metric or range changes
  useEffect(() => {
    setScrubIndex(null);
  }, [selectedMetricId, range, compareMetricId]);

  // Calculate current vs baseline delta for any metric and range
  const getMetricSummary = useCallback(
    (metric: MetricDefinition, targetRange: MetricRange) => {
      const pts = metric.series[targetRange] || [];
      if (!pts.length) {
        return { latest: 0, start: 0, delta: 0, deltaPct: 0, isGood: true };
      }
      const start = pts[0].value;
      const latest = pts[pts.length - 1].value;
      const delta = latest - start;
      const deltaPct = start !== 0 ? (delta / start) * 100 : 0;
      const isPositive = delta >= 0;
      const isGood = metric.isInverseGood ? !isPositive : isPositive;

      return { latest, start, delta, deltaPct, isGood };
    },
    []
  );

  // Current display point (either scrubbed or latest in range)
  const displayPoint = useMemo(() => {
    if (scrubIndex !== null && activePoints[scrubIndex]) {
      return activePoints[scrubIndex];
    }
    return activePoints[activePoints.length - 1] || { value: 0, date: '', timestamp: 0 };
  }, [activePoints, scrubIndex]);

  const compareDisplayPoint = useMemo(() => {
    if (!comparePoints.length) return null;
    if (scrubIndex !== null && comparePoints[scrubIndex]) {
      return comparePoints[scrubIndex];
    }
    return comparePoints[comparePoints.length - 1];
  }, [comparePoints, scrubIndex]);

  // Change relative to range start for current display point
  const currentDeltaFromStart = useMemo(() => {
    if (!activePoints.length) return { delta: 0, deltaPct: 0 };
    const startVal = activePoints[0].value;
    const currentVal = displayPoint.value;
    const delta = currentVal - startVal;
    const deltaPct = startVal !== 0 ? (delta / startVal) * 100 : 0;
    return { delta, deltaPct };
  }, [activePoints, displayPoint]);

  // High, Low, Average for Primary
  const stats = useMemo(() => {
    if (!activePoints.length) return { min: 0, max: 0, avg: 0 };
    const vals = activePoints.map((p) => p.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { min, max, avg };
  }, [activePoints]);

  // High, Low for Comparison
  const compareStats = useMemo(() => {
    if (!comparePoints.length) return { min: 0, max: 0, avg: 0 };
    const vals = comparePoints.map((p) => p.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { min, max, avg };
  }, [comparePoints]);

  // Pearson Correlation Coefficient calculation
  const correlation = useMemo(() => {
    if (!compareMetric || !activePoints.length || !comparePoints.length) return null;
    const n = Math.min(activePoints.length, comparePoints.length);
    if (n < 3) return null;

    const x = activePoints.slice(0, n).map((p) => p.value);
    const y = comparePoints.slice(0, n).map((p) => p.value);

    const xMean = x.reduce((a, b) => a + b, 0) / n;
    const yMean = y.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
      const dx = x[i] - xMean;
      const dy = y[i] - yMean;
      numerator += dx * dy;
      denomX += dx * dx;
      denomY += dy * dy;
    }

    const denom = Math.sqrt(denomX * denomY);
    if (denom === 0) return 0;
    return Number((numerator / denom).toFixed(2));
  }, [activePoints, comparePoints, compareMetric]);

  const formatValue = useCallback(
    (val: number, metric: MetricDefinition) => {
      const formatted = val.toLocaleString('en-US', {
        minimumFractionDigits: metric.decimals,
        maximumFractionDigits: metric.decimals,
      });
      return `${metric.unitPrefix || ''}${formatted} ${metric.unit}`;
    },
    []
  );

  const handleOpenMetric = (metricId: string) => {
    if (isSoundEnabled) playTactileTick();
    setSelectedMetricId(metricId);
    if (compareMetricId === metricId) setCompareMetricId(null);
    const target = METRIC_EXPLORER_DATA.find((m) => m.id === metricId);
    if (target) {
      setAnnouncement(`Opened ${target.title} chart in ${range} view.`);
    }
  };

  const handleClose = useCallback(() => {
    if (isSoundEnabled) playTactileTick();
    setSelectedMetricId(null);
    setCompareMetricId(null);
    setScrubIndex(null);
    setAnnouncement('Closed chart view. Returned to KPI cards.');
  }, [isSoundEnabled]);

  const handleRangeChange = (newRange: MetricRange) => {
    if (isSoundEnabled) playTactileTick();
    setRange(newRange);
    setAnnouncement(`Switched range to ${newRange}.`);
  };

  // Keyboard navigation for global and chart interactions
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!selectedMetricId) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        if (scrubIndex !== null) {
          setScrubIndex(null);
        } else {
          handleClose();
        }
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setScrubIndex((prev) => {
          const next = prev === null ? activePoints.length - 2 : Math.max(0, prev - 1);
          if (isSoundEnabled) playTactileTick();
          return next;
        });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setScrubIndex((prev) => {
          const next =
            prev === null
              ? activePoints.length - 1
              : Math.min(activePoints.length - 1, prev + 1);
          if (isSoundEnabled) playTactileTick();
          return next;
        });
      } else if (e.key === 'Home') {
        e.preventDefault();
        setScrubIndex(0);
        if (isSoundEnabled) playTactileTick();
      } else if (e.key === 'End') {
        e.preventDefault();
        setScrubIndex(activePoints.length - 1);
        if (isSoundEnabled) playTactileTick();
      }
    },
    [selectedMetricId, scrubIndex, activePoints.length, handleClose, isSoundEnabled]
  );

  // SVG Chart Geometry Calculation
  const viewBoxWidth = 800;
  const viewBoxHeight = 260;
  const paddingX = 24;
  const paddingY = 32;

  const chartCoords = useMemo(() => {
    if (!activePoints.length) return [];
    const minVal = stats.min;
    const maxVal = stats.max;
    const valRange = maxVal - minVal || 1;
    const width = viewBoxWidth - paddingX * 2;
    const height = viewBoxHeight - paddingY * 2;

    return activePoints.map((point, index) => {
      const x = paddingX + (index / (activePoints.length - 1 || 1)) * width;
      const normalizedY = (point.value - minVal) / valRange;
      const y = viewBoxHeight - paddingY - normalizedY * height;
      return { x, y, point, index };
    });
  }, [activePoints, stats.min, stats.max]);

  // Construct smooth cubic bezier SVG path for primary metric
  const { linePath, areaPath } = useMemo(() => {
    if (!chartCoords.length) return { linePath: '', areaPath: '' };

    if (chartCoords.length === 1) {
      const p = chartCoords[0];
      return { linePath: `M ${p.x} ${p.y}`, areaPath: '' };
    }

    let d = `M ${chartCoords[0].x} ${chartCoords[0].y}`;
    for (let i = 0; i < chartCoords.length - 1; i++) {
      const p0 = i > 0 ? chartCoords[i - 1] : chartCoords[0];
      const p1 = chartCoords[i];
      const p2 = chartCoords[i + 1];
      const p3 = i < chartCoords.length - 2 ? chartCoords[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }

    const last = chartCoords[chartCoords.length - 1];
    const first = chartCoords[0];
    const baselineY = viewBoxHeight - paddingY + 16;
    const area = `${d} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;

    return { linePath: d, areaPath: area };
  }, [chartCoords]);

  // Comparison curve coordinates & path
  const compareCoords = useMemo(() => {
    if (!comparePoints.length) return [];
    const minVal = compareStats.min;
    const maxVal = compareStats.max;
    const valRange = maxVal - minVal || 1;
    const width = viewBoxWidth - paddingX * 2;
    const height = viewBoxHeight - paddingY * 2;

    return comparePoints.map((point, index) => {
      const x = paddingX + (index / (comparePoints.length - 1 || 1)) * width;
      const normalizedY = (point.value - minVal) / valRange;
      const y = viewBoxHeight - paddingY - normalizedY * height;
      return { x, y, point, index };
    });
  }, [comparePoints, compareStats.min, compareStats.max]);

  const compareLinePath = useMemo(() => {
    if (!compareCoords.length) return '';
    if (compareCoords.length === 1) return `M ${compareCoords[0].x} ${compareCoords[0].y}`;

    let d = `M ${compareCoords[0].x} ${compareCoords[0].y}`;
    for (let i = 0; i < compareCoords.length - 1; i++) {
      const p0 = i > 0 ? compareCoords[i - 1] : compareCoords[0];
      const p1 = compareCoords[i];
      const p2 = compareCoords[i + 1];
      const p3 = i < compareCoords.length - 2 ? compareCoords[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }
    return d;
  }, [compareCoords]);

  // Pointer Scrubbing Handler
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!chartRef.current || !chartCoords.length) return;
    const rect = chartRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clientX / rect.width));

    const targetIndex = Math.round(ratio * (chartCoords.length - 1));
    if (targetIndex !== scrubIndex) {
      setScrubIndex(targetIndex);
    }
  };

  const handlePointerLeave = () => {
    setScrubIndex(null);
  };

  // Mini Sparkline Generator for Collapsed Cards
  const renderCardSparkline = (points: { value: number }[]) => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points.map((p) => p.value));
    const max = Math.max(...points.map((p) => p.value));
    const rangeVal = max - min || 1;
    const w = 72;
    const h = 24;

    const coords = points.map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p.value - min) / rangeVal) * (h - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return (
      <svg width={w} height={h} className="overflow-visible shrink-0">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords.join(' ')}
          className="text-slate-400 dark:text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors"
        />
      </svg>
    );
  };

  const activeCoord = scrubIndex !== null ? chartCoords[scrubIndex] : chartCoords[chartCoords.length - 1];
  const compareCoord = compareCoords.length
    ? scrubIndex !== null
      ? compareCoords[scrubIndex]
      : compareCoords[compareCoords.length - 1]
    : null;

  return (
    <div className="w-full relative" onKeyDown={handleKeyDown}>
      {/* Screen Reader Live Region */}
      <div className="sr-only" aria-live="polite">
        {announcement}
      </div>

      <AnimatePresence mode="wait">
        {!selectedMetricId ? (
          /* ========================================================================= */
          /* COLLAPSED KPI CARDS ROW (4 CARDS MORPHABLE)                              */
          /* ========================================================================= */
          <motion.div
            key="kpi-cards-grid"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5"
          >
            {METRIC_EXPLORER_DATA.map((metric) => {
              const summary = getMetricSummary(metric, range);
              const changeSign = summary.deltaPct > 0 ? '+' : '';
              const changeText = `${changeSign}${summary.deltaPct.toFixed(1)}%`;
              const valueLabel = formatValue(summary.latest, metric);

              return (
                <motion.button
                  key={metric.id}
                  layoutId={prefersReducedMotion ? undefined : `metric-card-${metric.id}`}
                  onClick={() => handleOpenMetric(metric.id)}
                  aria-label={`${metric.title}: ${valueLabel}, ${changeText} over ${range}. Click to open scrubbable chart.`}
                  className="group relative text-left p-4 rounded-lg bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-[#283652] transition-all flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                >
                  <div>
                    {/* Header: System & Range Indicator */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 uppercase tracking-wider">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {metric.system}
                        </span>
                        <span>·</span>
                        <span>{metric.systemName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 border border-slate-200 dark:border-[#1e273a] px-1.5 py-0.2 rounded bg-slate-50 dark:bg-[#101524]">
                        {range}
                      </span>
                    </div>

                    {/* Metric Title */}
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                      {metric.title}
                    </h3>
                  </div>

                  {/* Body: Value, Trend & Sparkline */}
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-2xl font-bold font-mono tracking-tight text-slate-950 dark:text-white tabular-nums">
                        {metric.unitPrefix || ''}
                        {summary.latest.toLocaleString('en-US', {
                          minimumFractionDigits: metric.decimals,
                          maximumFractionDigits: metric.decimals,
                        })}
                        <span className="text-xs font-sans text-slate-500 font-normal ml-1">
                          {metric.unit}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 mt-1 text-xs font-mono">
                        {summary.deltaPct >= 0 ? (
                          <TrendingUp
                            className={`w-3.5 h-3.5 ${
                              summary.isGood
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          />
                        ) : (
                          <TrendingDown
                            className={`w-3.5 h-3.5 ${
                              summary.isGood
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          />
                        )}
                        <span
                          className={`font-semibold ${
                            summary.isGood
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          {changeText}
                        </span>
                        <span className="text-slate-400 text-[10px]">vs {range} start</span>
                      </div>
                    </div>

                    {/* Mini Trend Sparkline */}
                    <div>{renderCardSparkline(metric.series[range])}</div>
                  </div>

                  {/* Action Affordance */}
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#172033] flex items-center justify-between text-[11px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                    <span className="font-mono">Explore series</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        ) : (
          /* ========================================================================= */
          /* EXPANDED SCRUBBABLE METRIC EXPLORER CHART PANEL                           */
          /* ========================================================================= */
          <motion.div
            key="metric-explorer-open-panel"
            layoutId={prefersReducedMotion ? undefined : `metric-card-${activeMetric.id}`}
            id={panelId}
            role="region"
            aria-label={`${activeMetric.title} scrubbable analytics chart`}
            className="w-full rounded-xl bg-white dark:bg-[#0c1018] border border-slate-200/90 dark:border-[#1a2336] shadow-xl overflow-hidden focus:outline-none"
          >
            {/* Top Toolbar: Metric Selector Tabs + Compare Toggle + Range Switch + Close */}
            <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-[#1a2336] flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Metric Tabs Segmented Control */}
              <div
                ref={tabListRef}
                role="tablist"
                aria-label="Plant Operations Key Metrics"
                className="flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-[#121725] rounded-lg border border-slate-200/80 dark:border-[#1a2336] overflow-x-auto"
              >
                {METRIC_EXPLORER_DATA.map((metric) => {
                  const isSelected = metric.id === activeMetric.id;
                  const summary = getMetricSummary(metric, range);

                  return (
                    <button
                      key={metric.id}
                      role="tab"
                      aria-selected={isSelected}
                      aria-controls={panelId}
                      onClick={() => {
                        if (isSoundEnabled) playTactileTick();
                        setSelectedMetricId(metric.id);
                        if (compareMetricId === metric.id) setCompareMetricId(null);
                        setAnnouncement(`Switched to ${metric.title}`);
                      }}
                      className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                        isSelected
                          ? 'text-slate-950 dark:text-white font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId={prefersReducedMotion ? undefined : 'metric-explorer-tab-pill'}
                          className="absolute inset-0 bg-white dark:bg-[#1c2438] rounded-md shadow-xs border border-slate-200/90 dark:border-[#283550]"
                          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-slate-400 uppercase">
                          {metric.system}
                        </span>
                        <span>{metric.title}</span>
                      </span>
                      <span className="relative z-10 font-mono text-[11px] text-slate-500 hidden sm:inline tabular-nums">
                        {summary.latest.toLocaleString('en-US', {
                          minimumFractionDigits: metric.decimals,
                          maximumFractionDigits: metric.decimals,
                        })}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Controls: Compare Overlay + Range Switch + Close Button */}
              <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto flex-wrap">
                {/* Compare Overlay Toggle */}
                <div className="relative">
                  <button
                    onClick={() => setIsCompareMenuOpen((p) => !p)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border transition-colors ${
                      compareMetric
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent font-medium shadow-xs'
                        : 'bg-slate-100/90 dark:bg-[#121725] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-[#1a2336] hover:bg-slate-200 dark:hover:bg-[#182133]'
                    }`}
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>
                      {compareMetric ? `Comparing vs ${compareMetric.system}` : 'Overlay Metric'}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isCompareMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-[#0c1018] border border-slate-200 dark:border-[#1a2336] rounded-lg shadow-xl py-1.5 z-50 text-xs"
                      >
                        <div className="px-3 py-1 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-100 dark:border-[#182235]">
                          Select Secondary Series to Compare
                        </div>
                        {METRIC_EXPLORER_DATA.filter((m) => m.id !== activeMetric.id).map((m) => {
                          const isComparing = compareMetricId === m.id;
                          return (
                            <button
                              key={m.id}
                              onClick={() => {
                                setCompareMetricId(isComparing ? null : m.id);
                                setIsCompareMenuOpen(false);
                                if (isSoundEnabled) playTactileTick();
                              }}
                              className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#121826]"
                            >
                              <div>
                                <span className="font-medium text-slate-900 dark:text-white">
                                  {m.title}
                                </span>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {m.system} · {m.systemName}
                                </div>
                              </div>
                              {isComparing && <Check className="w-4 h-4 text-emerald-500" />}
                            </button>
                          );
                        })}
                        {compareMetric && (
                          <div className="pt-1 mt-1 border-t border-slate-100 dark:border-[#182235]">
                            <button
                              onClick={() => {
                                setCompareMetricId(null);
                                setIsCompareMenuOpen(false);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            >
                              Clear Comparison Overlay
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Range Selector */}
                <div
                  role="radiogroup"
                  aria-label="Time Horizon Range"
                  className="flex items-center p-0.5 bg-slate-100/90 dark:bg-[#121725] rounded-md border border-slate-200/80 dark:border-[#1a2336]"
                >
                  {RANGES.map((r) => {
                    const isSelected = range === r.id;
                    return (
                      <button
                        key={r.id}
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleRangeChange(r.id)}
                        className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                          isSelected
                            ? 'bg-white dark:bg-[#1c2438] text-slate-950 dark:text-white font-semibold shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>

                {/* Close Button */}
                <button
                  onClick={handleClose}
                  aria-keyshortcuts="Escape"
                  title="Close chart (Escape)"
                  aria-label="Close chart and return to KPI tiles"
                  className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161f30] border border-slate-200/80 dark:border-[#1a2336] transition-colors flex items-center gap-1 text-xs"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline font-mono text-[10px]">Esc</span>
                </button>
              </div>
            </div>

            {/* Readout Header: Animated Counter + Comparison Readout */}
            <div className="p-5 sm:p-6 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {activeMetric.systemName}
                    </span>
                    <span>·</span>
                    <span>{activeMetric.description}</span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-baseline gap-4 sm:gap-6">
                    {/* Primary Numeric Readout */}
                    <div>
                      <div className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-slate-950 dark:text-white tabular-nums flex items-baseline">
                        <span>
                          {activeMetric.unitPrefix || ''}
                          {displayPoint.value.toLocaleString('en-US', {
                            minimumFractionDigits: activeMetric.decimals,
                            maximumFractionDigits: activeMetric.decimals,
                          })}
                        </span>
                        <span className="text-base font-sans text-slate-500 font-normal ml-1.5">
                          {activeMetric.unit}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 text-xs font-mono">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                            currentDeltaFromStart.deltaPct >= 0
                              ? activeMetric.isInverseGood
                                ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20'
                              : activeMetric.isInverseGood
                              ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {currentDeltaFromStart.deltaPct >= 0 ? '+' : ''}
                          {currentDeltaFromStart.deltaPct.toFixed(1)}%
                        </span>
                        <span className="text-slate-400">
                          {scrubIndex !== null ? 'at scrubbed point' : `over ${range}`}
                        </span>
                      </div>
                    </div>

                    {/* Secondary Comparative Readout if active */}
                    {compareMetric && compareDisplayPoint && (
                      <div className="pl-4 sm:pl-6 border-l border-slate-200 dark:border-[#1e273a]">
                        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full border border-current" />
                          <span>{compareMetric.title} ({compareMetric.system})</span>
                        </div>
                        <div className="text-2xl font-bold font-mono tracking-tight text-slate-700 dark:text-slate-300 tabular-nums mt-0.5">
                          {compareMetric.unitPrefix || ''}
                          {compareDisplayPoint.value.toLocaleString('en-US', {
                            minimumFractionDigits: compareMetric.decimals,
                            maximumFractionDigits: compareMetric.decimals,
                          })}
                          <span className="text-sm font-sans text-slate-500 font-normal ml-1">
                            {compareMetric.unit}
                          </span>
                        </div>
                        {correlation !== null && (
                          <div className="text-[11px] font-mono text-slate-500 mt-1">
                            Correlation r ={' '}
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {correlation}
                            </span>{' '}
                            <span className="text-slate-400">
                              ({correlation < -0.5
                                ? 'Inverse Coupling'
                                : correlation > 0.5
                                ? 'Positive Correlation'
                                : 'Low Coupling'})
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Point Date & Scrubber Instructions */}
                <div className="text-right font-mono text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 justify-end">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {displayPoint.date || 'Current'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {scrubIndex !== null
                      ? 'Press Escape to clear scrubber'
                      : 'Hover or use Arrow keys to scrub'}
                  </div>
                </div>
              </div>
            </div>

            {/* SVG Scrubbable Chart Area */}
            <div
              ref={chartContainerRef}
              className="relative px-4 sm:px-6 py-2 touch-pan-y"
              style={{ touchAction: 'pan-y' }}
            >
              <svg
                ref={chartRef}
                viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                preserveAspectRatio="none"
                className="w-full h-56 sm:h-64 overflow-visible cursor-crosshair select-none"
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                role="slider"
                tabIndex={0}
                aria-label={`Time series for ${activeMetric.title}`}
                aria-valuemin={0}
                aria-valuemax={activePoints.length - 1}
                aria-valuenow={scrubIndex !== null ? scrubIndex : activePoints.length - 1}
                aria-valuetext={`${displayPoint.date}: ${formatValue(
                  displayPoint.value,
                  activeMetric
                )}`}
              >
                <defs>
                  {/* Primary Subtle Gradient fill under line */}
                  <linearGradient id="metric-area-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.14" />
                    <stop offset="90%" stopColor="currentColor" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Lines */}
                {[0.25, 0.5, 0.75].map((fraction, i) => {
                  const y = paddingY + fraction * (viewBoxHeight - paddingY * 2);
                  return (
                    <line
                      key={i}
                      x1={paddingX}
                      y1={y}
                      x2={viewBoxWidth - paddingX}
                      y2={y}
                      stroke="currentColor"
                      strokeDasharray="4 6"
                      strokeWidth="1"
                      className="text-slate-200 dark:text-[#182338]"
                    />
                  );
                })}

                {/* Target Benchmark Line if defined */}
                {activeMetric.targetBenchmark && (
                  (() => {
                    const minVal = stats.min;
                    const maxVal = stats.max;
                    if (activeMetric.targetBenchmark >= minVal && activeMetric.targetBenchmark <= maxVal) {
                      const normalizedY = (activeMetric.targetBenchmark - minVal) / (maxVal - minVal || 1);
                      const benchY = viewBoxHeight - paddingY - normalizedY * (viewBoxHeight - paddingY * 2);
                      return (
                        <g>
                          <line
                            x1={paddingX}
                            y1={benchY}
                            x2={viewBoxWidth - paddingX}
                            y2={benchY}
                            stroke="#10b981"
                            strokeDasharray="2 3"
                            strokeWidth="1.2"
                            opacity="0.6"
                          />
                          <text
                            x={viewBoxWidth - paddingX}
                            y={benchY - 6}
                            textAnchor="end"
                            className="fill-emerald-600 dark:fill-emerald-400 text-[10px] font-mono"
                          >
                            Target: {activeMetric.targetBenchmark} {activeMetric.unit}
                          </text>
                        </g>
                      );
                    }
                    return null;
                  })()
                )}

                {/* Primary Area Gradient Fill */}
                <path
                  d={areaPath}
                  fill="url(#metric-area-gradient)"
                  className="text-slate-900 dark:text-slate-100 transition-all duration-300"
                />

                {/* Secondary Comparison Curve (Dashed line) */}
                {compareMetric && compareLinePath && (
                  <path
                    d={compareLinePath}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-slate-400 dark:text-slate-400 opacity-80 transition-all duration-300"
                  />
                )}

                {/* Primary Curve Line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-950 dark:text-white transition-all duration-300"
                />

                {/* Active / Hover Scrub Crosshair Line & Dots */}
                {activeCoord && (
                  <g className="transition-transform duration-75">
                    {/* Vertical Hairline */}
                    <line
                      x1={activeCoord.x}
                      y1={paddingY}
                      x2={activeCoord.x}
                      y2={viewBoxHeight - paddingY + 12}
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                      className="text-slate-400 dark:text-slate-500"
                    />

                    {/* Outer Glow Halo for Primary Dot */}
                    <circle
                      cx={activeCoord.x}
                      cy={activeCoord.y}
                      r="7"
                      fill="currentColor"
                      className="text-slate-900/20 dark:text-white/20 animate-pulse"
                    />

                    {/* Primary Dot */}
                    <circle
                      cx={activeCoord.x}
                      cy={activeCoord.y}
                      r="4"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-slate-950 dark:text-white"
                    />

                    {/* Secondary Dot for Comparison Metric */}
                    {compareCoord && (
                      <circle
                        cx={compareCoord.x}
                        cy={compareCoord.y}
                        r="3.5"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-slate-400 dark:text-slate-300"
                      />
                    )}
                  </g>
                )}
              </svg>
            </div>

            {/* Bottom Telemetry & Statistics Strip */}
            <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-[#1a2336] bg-slate-50/70 dark:bg-[#0f1422] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 sm:gap-8 text-xs font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase tracking-wider block font-sans">
                    Period High
                  </span>
                  <span className="font-semibold text-slate-950 dark:text-white tabular-nums">
                    {formatValue(stats.max, activeMetric)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase tracking-wider block font-sans">
                    Period Low
                  </span>
                  <span className="font-semibold text-slate-950 dark:text-white tabular-nums">
                    {formatValue(stats.min, activeMetric)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase tracking-wider block font-sans">
                    Period Average
                  </span>
                  <span className="font-semibold text-slate-950 dark:text-white tabular-nums">
                    {formatValue(stats.avg, activeMetric)}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-slate-500 text-[10px] uppercase tracking-wider block font-sans">
                    Target SLA
                  </span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {activeMetric.targetBenchmark
                      ? `${activeMetric.targetBenchmark} ${activeMetric.unit}`
                      : 'Nominal'}
                  </span>
                </div>
              </div>

              {/* Deep-dive direct navigation link to respective System View */}
              {onNavigateToSystem && (
                <button
                  onClick={() => {
                    if (isSoundEnabled) playTactileTick();
                    const systemMap: Record<string, 'wms' | 'buss' | 'mips' | 'oracle_odi'> = {
                      WMS: 'wms',
                      BUSS: 'buss',
                      MIPS: 'mips',
                      ODI: 'oracle_odi',
                    };
                    onNavigateToSystem(systemMap[activeMetric.system]);
                    handleClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white bg-white dark:bg-[#1a2337] border border-slate-200/90 dark:border-[#263652] rounded-md shadow-xs hover:bg-slate-100 dark:hover:bg-[#202c44] transition-colors self-start sm:self-auto"
                >
                  <span>Open {activeMetric.system} Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
