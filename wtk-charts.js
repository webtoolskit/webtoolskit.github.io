/**
 * WebToolsKit Chart Library v1.0
 * Reusable charts for all tools — dark theme, yellow/teal accent
 * Uses Chart.js (loaded via CDN)
 * 
 * HOW TO USE:
 * 1. Add this script to your HTML page (after Chart.js CDN):
 *    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
 *    <script src="/wtk-charts.js"></script>
 * 
 * 2. Add a canvas element where you want the chart:
 *    <canvas id="myChart"></canvas>
 * 
 * 3. Call the chart function from your calculator script:
 *    WTKCharts.lineChart('myChart', labels, data, 'Wealth Growth')
 */

const WTKCharts = (() => {

  // ── Brand tokens (matches your site exactly) ──────────────────────
  const C = {
    bg:       '#0f1117',
    card:     '#1a1d27',
    border:   '#2a2d3a',
    white:    '#ffffff',
    grey:     '#8b8fa8',
    light:    '#c8cad8',
    yellow:   '#f5c518',
    yellow2:  '#e6b800',
    teal:     '#1D9E75',
    teal2:    '#0f6e52',
    red:      '#c50337',
    purple:   '#6c63ff',
  };

  // ── Global Chart.js defaults ───────────────────────────────────────
  const applyGlobalDefaults = () => {
    if (typeof Chart === 'undefined') return;
    Chart.defaults.color          = C.grey;
    Chart.defaults.borderColor    = C.border;
    Chart.defaults.font.family    = "'DM Sans', sans-serif";
    Chart.defaults.font.size      = 12;
    Chart.defaults.plugins.legend.labels.color     = C.light;
    Chart.defaults.plugins.legend.labels.boxWidth  = 12;
    Chart.defaults.plugins.legend.labels.padding   = 16;
    Chart.defaults.plugins.tooltip.backgroundColor = C.card;
    Chart.defaults.plugins.tooltip.borderColor     = C.border;
    Chart.defaults.plugins.tooltip.borderWidth     = 1;
    Chart.defaults.plugins.tooltip.titleColor      = C.white;
    Chart.defaults.plugins.tooltip.bodyColor       = C.light;
    Chart.defaults.plugins.tooltip.padding         = 12;
    Chart.defaults.plugins.tooltip.cornerRadius    = 10;
  };

  // ── Destroy existing chart on canvas ──────────────────────────────
  const destroyExisting = (id) => {
    const existing = Chart.getChart(id);
    if (existing) existing.destroy();
  };

  // ── Yellow gradient helper ─────────────────────────────────────────
  const yellowGradient = (ctx, chartArea) => {
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0,   'rgba(245,197,24,0.35)');
    gradient.addColorStop(0.6, 'rgba(245,197,24,0.08)');
    gradient.addColorStop(1,   'rgba(245,197,24,0.00)');
    return gradient;
  };

  // ── Teal gradient helper ───────────────────────────────────────────
  const tealGradient = (ctx, chartArea) => {
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0,   'rgba(29,158,117,0.35)');
    gradient.addColorStop(0.6, 'rgba(29,158,117,0.08)');
    gradient.addColorStop(1,   'rgba(29,158,117,0.00)');
    return gradient;
  };

  // ══════════════════════════════════════════════════════════════════
  // 1. LINE CHART — for SIP, EMI balance over time, loan balance
  // ══════════════════════════════════════════════════════════════════
  /**
   * @param {string} id       - canvas element id
   * @param {string[]} labels - x-axis labels e.g. ['Year 1','Year 2']
   * @param {number[]} data   - y-axis values
   * @param {string} label    - dataset label e.g. 'Wealth Growth'
   * @param {string} prefix   - value prefix e.g. '₹' or '$'
   * @param {string} color    - 'yellow' (default) or 'teal'
   */
  const lineChart = (id, labels, data, label = 'Value', prefix = '₹', color = 'yellow') => {
    destroyExisting(id);
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const accent = color === 'teal' ? C.teal : C.yellow;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label,
          data,
          borderColor: accent,
          borderWidth: 2.5,
          pointBackgroundColor: accent,
          pointBorderColor: C.card,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true,
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return 'transparent';
            return color === 'teal' ? tealGradient(c, chartArea) : yellowGradient(c, chartArea);
          },
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${prefix}${Number(ctx.raw).toLocaleString('en-IN')}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: C.border },
            ticks: { color: C.grey, maxTicksLimit: 10 }
          },
          y: {
            grid: { color: C.border },
            ticks: {
              color: C.grey,
              callback: (val) => `${prefix}${Number(val).toLocaleString('en-IN')}`
            }
          }
        }
      }
    });
  };

  // ══════════════════════════════════════════════════════════════════
  // 2. DUAL LINE CHART — for SIP: invested vs returns
  // ══════════════════════════════════════════════════════════════════
  /**
   * @param {string} id
   * @param {string[]} labels
   * @param {number[]} data1   - e.g. total invested
   * @param {number[]} data2   - e.g. total value
   * @param {string} label1
   * @param {string} label2
   * @param {string} prefix
   */
  const dualLineChart = (id, labels, data1, data2, label1 = 'Invested', label2 = 'Value', prefix = '₹') => {
    destroyExisting(id);
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: label1,
            data: data1,
            borderColor: C.grey,
            borderWidth: 2,
            pointBackgroundColor: C.grey,
            pointRadius: 3,
            tension: 0.4,
            fill: false,
            borderDash: [5, 5],
          },
          {
            label: label2,
            data: data2,
            borderColor: C.yellow,
            borderWidth: 2.5,
            pointBackgroundColor: C.yellow,
            pointBorderColor: C.card,
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4,
            fill: true,
            backgroundColor: (context) => {
              const chart = context.chart;
              const { ctx: c, chartArea } = chart;
              if (!chartArea) return 'transparent';
              return yellowGradient(c, chartArea);
            },
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${prefix}${Number(ctx.raw).toLocaleString('en-IN')}`
            }
          }
        },
        scales: {
          x: { grid: { color: C.border }, ticks: { color: C.grey, maxTicksLimit: 10 } },
          y: {
            grid: { color: C.border },
            ticks: { color: C.grey, callback: (val) => `${prefix}${Number(val).toLocaleString('en-IN')}` }
          }
        }
      }
    });
  };

  // ══════════════════════════════════════════════════════════════════
  // 3. PIE / DONUT CHART — for EMI breakdown, budget allocation
  // ══════════════════════════════════════════════════════════════════
  /**
   * @param {string} id
   * @param {string[]} labels   - e.g. ['Principal','Interest']
   * @param {number[]} data
   * @param {string} prefix
   * @param {boolean} donut     - true for donut, false for pie
   */
  const donutChart = (id, labels, data, prefix = '₹', donut = true) => {
    destroyExisting(id);
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const colors = [C.yellow, C.teal, C.purple, C.red, C.grey, C.light];

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.slice(0, data.length),
          borderColor: C.card,
          borderWidth: 3,
          hoverBorderColor: C.white,
          hoverBorderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        cutout: donut ? '65%' : '0%',
        plugins: {
          legend: { display: true, position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = ((ctx.raw / total) * 100).toFixed(1);
                return ` ${ctx.label}: ${prefix}${Number(ctx.raw).toLocaleString('en-IN')} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  };

  // ══════════════════════════════════════════════════════════════════
  // 4. BAR CHART — for salary comparison, calorie burn, budget
  // ══════════════════════════════════════════════════════════════════
  /**
   * @param {string} id
   * @param {string[]} labels
   * @param {number[]} data
   * @param {string} label
   * @param {string} prefix
   * @param {string} color    - 'yellow' or 'teal'
   * @param {boolean} horizontal
   */
  const barChart = (id, labels, data, label = 'Value', prefix = '₹', color = 'yellow', horizontal = false) => {
    destroyExisting(id);
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const accent = color === 'teal' ? C.teal : C.yellow;
    const accent2 = color === 'teal' ? C.teal2 : C.yellow2;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label,
          data,
          backgroundColor: data.map((_, i) =>
            i === data.indexOf(Math.max(...data)) ? accent : `${accent}66`
          ),
          borderColor: accent,
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        indexAxis: horizontal ? 'y' : 'x',
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${prefix}${Number(ctx.raw).toLocaleString('en-IN')}`
            }
          }
        },
        scales: {
          x: { grid: { color: C.border }, ticks: { color: C.grey } },
          y: {
            grid: { color: C.border },
            ticks: {
              color: C.grey,
              callback: horizontal ? undefined : (val) => `${prefix}${Number(val).toLocaleString('en-IN')}`
            }
          }
        }
      }
    });
  };

  // ══════════════════════════════════════════════════════════════════
  // 5. GROUPED BAR CHART — for before vs after salary, rent vs buy
  // ══════════════════════════════════════════════════════════════════
  /**
   * @param {string} id
   * @param {string[]} labels
   * @param {Array<{label, data, color}>} datasets
   * @param {string} prefix
   */
  const groupedBarChart = (id, labels, datasets, prefix = '₹') => {
    destroyExisting(id);
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const colorMap = { yellow: C.yellow, teal: C.teal, purple: C.purple, red: C.red, grey: C.grey };

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: datasets.map(ds => ({
          label: ds.label,
          data: ds.data,
          backgroundColor: `${colorMap[ds.color] || C.yellow}99`,
          borderColor: colorMap[ds.color] || C.yellow,
          borderWidth: 1.5,
          borderRadius: 6,
          borderSkipped: false,
        }))
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${prefix}${Number(ctx.raw).toLocaleString('en-IN')}`
            }
          }
        },
        scales: {
          x: { grid: { color: C.border }, ticks: { color: C.grey } },
          y: {
            grid: { color: C.border },
            ticks: { color: C.grey, callback: (val) => `${prefix}${Number(val).toLocaleString('en-IN')}` }
          }
        }
      }
    });
  };

  // ══════════════════════════════════════════════════════════════════
  // 6. GAUGE CHART — for BMI, body fat, attendance progress
  // ══════════════════════════════════════════════════════════════════
  /**
   * @param {string} id
   * @param {number} value      - 0 to 100
   * @param {string} label
   * @param {string[]} zones    - zone labels e.g. ['Low','Normal','High']
   * @param {number[]} zoneVals - zone boundaries e.g. [18.5, 25, 30, 40]
   * @param {string[]} zoneColors
   */
  const gaugeChart = (id, value, label = '', zones = [], zoneVals = [], zoneColors = []) => {
    destroyExisting(id);
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const max = zoneVals[zoneVals.length - 1] || 100;
    const segmentData = [];
    const segmentColors = [];

    for (let i = 0; i < zoneVals.length; i++) {
      const prev = i === 0 ? 0 : zoneVals[i - 1];
      segmentData.push(zoneVals[i] - prev);
      segmentColors.push(zoneColors[i] || C.grey);
    }

    // needle position
    const clampedVal = Math.min(Math.max(value, 0), max);
    const needlePct = clampedVal / max;

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [...segmentData, max],
          backgroundColor: [...segmentColors, 'transparent'],
          borderWidth: 0,
          circumference: 180,
          rotation: 270,
        }]
      },
      options: {
        responsive: true,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        }
      },
      plugins: [{
        id: 'gaugeNeedle',
        afterDatasetDraw(chart) {
          const { ctx: c, chartArea: { width, height, left, top } } = chart;
          const cx = left + width / 2;
          const cy = top + height * 0.85;
          const r = width * 0.35;
          const angle = Math.PI + needlePct * Math.PI;

          c.save();
          c.beginPath();
          c.moveTo(cx, cy);
          c.lineTo(
            cx + Math.cos(angle) * r * 0.9,
            cy + Math.sin(angle) * r * 0.9
          );
          c.strokeStyle = C.white;
          c.lineWidth = 2.5;
          c.lineCap = 'round';
          c.stroke();

          c.beginPath();
          c.arc(cx, cy, 6, 0, Math.PI * 2);
          c.fillStyle = C.white;
          c.fill();

          c.fillStyle = C.white;
          c.font = `bold 18px 'Outfit', sans-serif`;
          c.textAlign = 'center';
          c.fillText(`${value}`, cx, cy - 20);

          c.fillStyle = C.grey;
          c.font = `12px 'DM Sans', sans-serif`;
          c.fillText(label, cx, cy - 4);
          c.restore();
        }
      }]
    });
  };

  // ══════════════════════════════════════════════════════════════════
  // 7. PROGRESS BAR CHART — for attendance status
  // ══════════════════════════════════════════════════════════════════
  /**
   * @param {string} id
   * @param {number} value      - current percentage
   * @param {number} target     - target percentage e.g. 75
   * @param {string} label
   */
  const progressBar = (id, value, target = 75, label = 'Attendance') => {
    destroyExisting(id);
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const isSafe = value >= target;
    const color = isSafe ? C.teal : C.red;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [label],
        datasets: [
          {
            label: 'Current',
            data: [Math.min(value, 100)],
            backgroundColor: `${color}cc`,
            borderColor: color,
            borderWidth: 1.5,
            borderRadius: 8,
            borderSkipped: false,
          },
          {
            label: `Target (${target}%)`,
            data: [target],
            backgroundColor: `${C.grey}33`,
            borderColor: `${C.grey}66`,
            borderWidth: 1,
            borderRadius: 8,
            borderSkipped: false,
            borderDash: [5, 5],
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}%`
            }
          }
        },
        scales: {
          x: {
            max: 100,
            grid: { color: C.border },
            ticks: { color: C.grey, callback: (val) => `${val}%` }
          },
          y: { grid: { display: false }, ticks: { color: C.grey } }
        }
      }
    });
  };

  // ══════════════════════════════════════════════════════════════════
  // 8. TIMELINE / SLEEP CHART — for sleep cycle visualisation
  // ══════════════════════════════════════════════════════════════════
  /**
   * @param {string} id
   * @param {Array<{time, label, recommended}>} options
   */
  const sleepTimeline = (id, options = []) => {
    destroyExisting(id);
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: options.map(o => o.time),
        datasets: [{
          label: 'Wake-up Options',
          data: options.map(() => 1),
          backgroundColor: options.map(o => o.recommended ? `${C.yellow}cc` : `${C.teal}66`),
          borderColor: options.map(o => o.recommended ? C.yellow : C.teal),
          borderWidth: 1.5,
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const opt = options[ctx.dataIndex];
                return [` Wake at: ${opt.time}`, ` ${opt.label}`, opt.recommended ? ' ⭐ Recommended' : ''];
              }
            }
          }
        },
        scales: {
          x: { grid: { color: C.border }, ticks: { color: C.grey } },
          y: { display: false }
        }
      }
    });
  };

  // ── Initialise defaults when DOM is ready ─────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyGlobalDefaults);
  } else {
    applyGlobalDefaults();
  }

  // ── Public API ────────────────────────────────────────────────────
  return {
    lineChart,
    dualLineChart,
    donutChart,
    barChart,
    groupedBarChart,
    gaugeChart,
    progressBar,
    sleepTimeline,
  };

})();
