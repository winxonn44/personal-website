// FIG.01 is the flagship: it carries a demo, result bullets and code links.
// Other entries render as compact rows; leave `links` empty until the code is public.
export const projects = [
  {
    idx: 'FIG.01',
    years: '2026',
    title: 'VoroNav: offline navigation for autonomous systems',
    metric: '≤0.1%',
    metricSub: 'collisions · A* 0.6–1.1%',
    method:
      'Camera → SAM 2 floor mask → bird’s-eye grid → maximum-clearance Voronoi roadmap, fully on-device. The Voronoi engine (Jump Flooding) is written from scratch in NumPy, multithreaded Numba and a fused Metal GPU kernel, all bit-identical to an exact oracle.',
    points: [
      'Fused int32 Metal kernel: a 2048² diagram in 14 ms, 276× faster than NumPy and 100× faster than eager PyTorch. Found by testing two hypotheses one at a time.',
      'Benchmarked against A*, clearance-weighted A* and RRT* on 94 maps (58K planner runs): at least as safe as A* in 99.5% of queries; ties tuned weighted A* on safety with 1.5–3.6× faster queries.',
      'Fault-injection study (190K graded plans): clearance halves collisions from mask leaks but not from missed obstacles; a leak-detection gate raised recall from 8% to 65%.',
    ],
    media: {
      src: 'https://raw.githubusercontent.com/winxonn44/voro-navi-system/main/docs/q4/demo.gif',
      alt: 'First-person video, SAM 2 floor mask, bird’s-eye grid and Voronoi roadmap with planned paths',
      caption: 'First-person video → SAM 2 mask → bird’s-eye grid → Voronoi path (blue) vs grid A* (orange). ~0.5 s/frame on an M4 MacBook Air.',
    },
    stack: ['Python', 'PyTorch MPS', 'Metal', 'Numba', 'SAM 2', 'pytest · 358 tests'],
    links: [
      ['Code + results', 'https://github.com/winxonn44/voro-navi-system'],
      ['Benchmarks (README)', 'https://github.com/winxonn44/voro-navi-system#q1-first-results-measured-apple-m4-10-cores'],
    ],
  },
  {
    idx: 'FIG.02',
    years: '2025–now',
    title: 'Real-time EEG focus detection',
    metric: '16-ch',
    metricSub: 'live EEG stream',
    method:
      'CruX Neuroscience. Streams live 16-channel EEG through filtering and artifact rejection into a per-user calibrated band-power workload index, exposed through a Python API.',
    links: [],
  },
  {
    idx: 'FIG.03',
    years: '2026',
    title: 'Multimodal signals for event-contract trading',
    metric: '1.38',
    metricSub: 'backtest Sharpe · ~50 markets',
    method:
      'Founder, UCLA Startup Labs. A scraping and embedding pipeline (custom CNN for images, adapted NLP model for text) maps social signals into a 4-D feature space; backtested on Kalshi markets over four months.',
    links: [],
  },
  {
    idx: 'FIG.04',
    years: '2026–now',
    title: 'Segmentation-driven Voronoi mosaics',
    metric: 'SAM',
    metricSub: 'promptable segments',
    method:
      'UCLA Math + Code + Art. Lead developer of an interactive app for the Oceanside Museum of Art: Meta SAM segments drive a weighted Voronoi tessellation with Lloyd relaxation.',
    links: [['Lab site', 'https://math-code-art.github.io/']],
  },
]
