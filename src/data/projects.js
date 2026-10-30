// `feature: true` entries render as full cards with result bullets, media and
// (optionally) a click-to-launch live app. The rest render as a bento row of equal
// tiles with an optional figure. Every image is a real output of the project — no stock art.
const BASE = import.meta.env.BASE_URL

export const projects = [
  {
    idx: 'FIG.01',
    feature: true,
    tag: 'Flagship',
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
    media: [
      {
        src: 'https://raw.githubusercontent.com/winxonn44/voro-navi-system/main/docs/q4/demo.gif',
        alt: 'First-person video, SAM 2 floor mask, bird’s-eye grid and Voronoi roadmap with planned paths',
      },
    ],
    caption: 'First-person video → SAM 2 mask → bird’s-eye grid → Voronoi path (blue) vs grid A* (orange). ~0.5 s/frame on an M4 MacBook Air.',
    stack: ['Python', 'PyTorch MPS', 'Metal', 'Numba', 'SAM 2', 'pytest · 358 tests'],
    links: [
      ['Code + results', 'https://github.com/winxonn44/voro-navi-system'],
      ['Benchmarks (README)', 'https://github.com/winxonn44/voro-navi-system#q1-first-results-measured-apple-m4-10-cores'],
    ],
  },
  {
    idx: 'FIG.02',
    feature: true,
    tag: 'Try it live',
    years: '2026–now',
    title: 'VoroLens: segmentation-driven Voronoi mosaics in the browser',
    metric: 'Aug ’27',
    metricSub: 'Oceanside Museum of Art',
    method:
      'Lead developer, UCLA Math + Code + Art. An interactive app for the upcoming Algorithmic Forms exhibition: a brightness + edge density field drives weighted seeds, a Voronoi diagram and Lloyd relaxation; click any object and SlimSAM mosaics only that object.',
    points: [
      'SlimSAM runs entirely client-side in a Web Worker on WebGPU, with a WASM fallback. Images never leave the visitor’s device.',
      'Encode once, decode per click: the expensive image embedding is cached so each point prompt returns a mask interactively.',
      'Author of Chapter 2 of the lab’s open textbook, Voronoi Tessellation and Adaptive Sampling, which teaches the full pipeline in Python.',
    ],
    // Native rebuild of the lab app (src/components/vorolens), mounted on "Launch".
    app: {
      id: 'vorolens',
      note: 'Runs entirely in your browser. Switch on SlimSAM and click any object to mosaic just that object; the model (~40 MB) downloads the first time you switch it on.',
    },
    stack: ['React', 'Canvas 2D', 'transformers.js', 'SlimSAM', 'WebGPU / WASM', 'Web Workers'],
    links: [
      ['Chapter 2', 'https://math-code-art.github.io/book/voronoi-mosaic/'],
      ['Lab site', 'https://math-code-art.github.io/'],
    ],
  },
  {
    idx: 'FIG.03',
    tag: 'In progress',
    years: '2026–now',
    title: 'Fitted residual dynamics: transformers as interacting particles',
    metric: 'ODE',
    metricSub: 'depth as time',
    method:
      'BruinML, with two collaborators; manuscript in preparation. Records the residual stream of pretrained models (GPT-2, BERT, ALBERT), fits an autonomous attention ODE over windows of layers, and tests the clustering, energy and metastability predictions of the Geshkovski–Rigollet theory on real checkpoints.',
    links: [],
  },
  {
    idx: 'FIG.04',
    years: '2025–now',
    title: 'Real-time EEG focus detection',
    metric: '250 Hz',
    metricSub: 'live EEG stream',
    method:
      'CruX Neuroscience. Streams live EEG through notch and band-pass filtering and artifact rejection into a per-user calibrated workload index (frontal θ / parietal α), exposed through a Python API.',
    figure: {
      src: `${BASE}projects/crux/eeg-workload.png`,
      alt: 'Filtered frontal EEG traces and the theta/alpha workload index over a three-minute session',
      caption: 'A recorded session from the project repo: filtered EEG, and the workload index per 2 s window.',
    },
    links: [],
  },
  {
    idx: 'FIG.05',
    years: '2026',
    title: 'Multimodal signals for event-contract trading',
    metric: '1.38',
    metricSub: 'backtest Sharpe · ~50 markets',
    method:
      'Founder, UCLA Startup Labs. A scraping and embedding pipeline (custom CNN for images, adapted NLP model for text) maps social signals into a 4-D feature space; backtested on Kalshi markets over four months.',
    links: [],
  },
]
