// `feature: true` entries render as full cards with result bullets, media and
// (optionally) a click-to-launch live app. The rest render as a bento row of equal
// tiles with an optional figure. Every image is a real output of the project — no stock art.
const BASE = import.meta.env.BASE_URL

export const projects = [
  {
    idx: 'FIG.01',
    feature: true,
    tag: 'Flagship',
    years: '2026–now',
    title: 'VoroNav: offline navigation for autonomous systems',
    metric: '≤0.1%',
    metricSub: 'collisions · A* 0.6–1.1%',
    method:
      'A robot navigation stack that runs fully offline: SAM 2 segments first-person video, a from-scratch parallel Voronoi engine (Jump Flooding) builds a maximum-clearance roadmap, and the planner keeps the robot away from walls. The engine has NumPy, multithreaded Numba, fused Metal and C++20 backends, all bit-identical to the NumPy reference.',
    points: [
      'C++20 core (pybind11, hand-written thread pool, GoogleTest, ASan/UBSan/TSan in CI): 19.1 ms for a 2048² diagram, 3.4× faster than 10-thread Numba and 17× faster than the first serial port, from a division-free int16 layout the compiler vectorizes and a lock-free dynamic row scheduler. The fused Metal kernel still wins on large grids (14.3 ms), and the README says so.',
      'Benchmarked against A*, clearance-weighted A* and RRT* on 94 maps (58K planner runs): minimum clearance matched or beat A* in 99.5% of queries (+70% mean clearance) with 1.5× faster queries. A tuned weighted A* ties it on safety; narrow passages are its weak spot (2.1× longer paths).',
      'On real SAM 2 masks of first-person video, the clearance planners collided on ≤0.1% of plans against 0.6–1.1% for grid A*. A segmentation-error study showed a temporal filter cuts wall-leak collisions from 14% to 4%.',
    ],
    media: [
      {
        src: 'https://raw.githubusercontent.com/winxonn44/voro-navi-system/main/docs/q4/demo.gif',
        alt: 'First-person video, SAM 2 floor mask, bird’s-eye grid and Voronoi roadmap with planned paths',
      },
    ],
    caption: 'First-person video → SAM 2 mask → bird’s-eye grid → Voronoi path (blue) vs grid A* (orange). ~0.5 s/frame on an M4 MacBook Air.',
    stack: ['Python', 'C++20', 'pybind11', 'PyTorch / Metal', 'Numba', 'SAM 2'],
    links: [
      ['Code + results', 'https://github.com/winxonn44/voro-navi-system'],
      ['C++ optimization log', 'https://github.com/winxonn44/voro-navi-system/blob/main/docs/CORE.md'],
      ['Benchmarks (README)', 'https://github.com/winxonn44/voro-navi-system#q1-first-results-measured-apple-m4-10-cores'],
    ],
  },
  {
    idx: 'FIG.02',
    feature: true,
    tag: 'In progress',
    years: '2026–now',
    title: 'nav-ekf: state estimation for GPS-denied navigation',
    metric: '1.2 µs',
    metricSub: 'per IMU step · C++, zero heap',
    method:
      'The estimation layer of the VoroNav stack: a 15-state error-state Kalman filter fusing a 6-axis IMU with position fixes. Derived by hand with every Jacobian checked against finite differences, with a Python reference and a C++20/Eigen port that matches it to 1e-13 in simulation.',
    points: [
      'Statistically consistent in simulation: over a 50-run Monte Carlo with a 30 s GPS dropout, NIS averaged 3.00 (expected 3) and NEES 15.75 sat inside its 95% χ² band, and the filter’s 3σ envelope held 96% of runs at the end of the outage.',
      'C++20/Eigen port: 1.21 µs per IMU propagation and 1.86 µs per GPS update with zero heap allocations (about 0.03% of one core at 200 Hz), 55 GoogleTests under ASan/UBSan, and parity with Python on 32,000 steps of real flight data.',
      'On five real EuRoC drone flights (200 Hz MEMS IMU), the untuned filter proved overconfident during outages. The diagnosis: in-flight IMU noise is 30–40× the datasheet values. That finding stays in the README, and tuning is the next checkpoint.',
    ],
    media: [
      {
        src: `${BASE}projects/nav-ekf/e2_outage.png`,
        alt: 'Position error of 50 runs during a 30-second GPS outage, inside the filter’s plus or minus 3 sigma envelope',
      },
    ],
    caption: 'Simulated GPS outage, 50 runs: each blue line is one run’s position error; orange is the filter’s own ±3σ, dashed is 3× the measured RMS.',
    stack: ['C++20', 'Eigen', 'Python', 'GoogleTest · pytest', 'EuRoC MAV'],
    links: [
      ['Code', 'https://github.com/winxonn44/nav-ekf'],
      ['Results', 'https://github.com/winxonn44/nav-ekf/blob/main/docs/results.md'],
      ['Derivation', 'https://github.com/winxonn44/nav-ekf/blob/main/docs/derivation.md'],
    ],
  },
  {
    idx: 'FIG.03',
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
    idx: 'FIG.04',
    feature: true,
    tag: 'Full stack',
    years: '2026',
    title: 'PairRank: ranking by “better or worse?”, tested on simulated users',
    metric: '14×',
    metricSub: 'less placement error · 2× questions',
    method:
      'How few “better or worse?” questions place a new restaurant in someone’s ranked list when people answer inconsistently. A simulation study plus a small app (Django REST Framework, PostgreSQL, Angular), inspired by the restaurant app Beli. Every user is simulated with known true preferences, so error is measured exactly and no data is collected from people.',
    points: [
      'Placement: with 10% wrong answers in a list of 49, Bayesian bisection cuts error from 2.88 to 0.20 positions (about 14×) for 10.9 questions instead of 5.6, right at the ~10.6-question information floor. When mistakes cluster on close pairs, the gain shrinks to about 2×.',
      'Experiment design: a simulated A/B test needs 481 users per arm to detect a 0.25-position improvement at 80% power, checked against 2,000 simulated experiments (A/A false-positive rate 4.35%). The hypotheses that failed are kept in the results.',
      'The app runs the evaluated code: 1,080 simulated transcripts replayed through the REST API give identical questions and final positions, with idempotent answers, 409s on concurrent conflicts, and 8 PostgreSQL metric queries matching pandas to 6e-14, Postgres included in CI.',
    ],
    media: [
      { src: `${BASE}projects/pair-rank/demo.gif`, alt: 'The PairRank app adding a tenth restaurant to a list by answering better-or-worse questions' },
      { src: `${BASE}projects/pair-rank/q1_error_vs_questions.png`, alt: 'Average placement error against questions asked for five ranking strategies' },
    ],
    caption: 'The local app with scripted answers, and the trade-off: fewer mistakes cost more questions (list of 49, 10% wrong answers).',
    stack: ['Python', 'Django REST Framework', 'PostgreSQL', 'Angular / TypeScript', 'Docker', 'GitHub Actions'],
    links: [
      ['Code', 'https://github.com/winxonn44/pair-rank'],
      ['Results', 'https://github.com/winxonn44/pair-rank/blob/main/docs/RESULTS.md'],
      ['Write-up', 'https://github.com/winxonn44/pair-rank/blob/main/docs/WRITEUP.md'],
    ],
  },
  {
    idx: 'FIG.05',
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
    idx: 'FIG.06',
    years: '2025–26',
    title: 'Real-time EEG focus detection',
    metric: '250 Hz',
    metricSub: 'live EEG stream',
    method:
      'CruX Neuroscience. Streams live 8-channel EEG at 250 Hz through notch and band-pass filtering and artifact rejection into a per-user calibrated workload index (frontal θ / parietal α), exposed through a Python API.',
    figure: {
      src: `${BASE}projects/crux/eeg-workload.png`,
      alt: 'Filtered frontal EEG traces and the theta/alpha workload index over a three-minute session',
      caption: 'A recorded session from the project repo: filtered EEG, and the workload index per 2 s window.',
    },
    links: [],
  },
  {
    idx: 'FIG.07',
    years: '2026',
    title: 'Multimodal signals for event-contract trading',
    metric: '1.38',
    metricSub: 'backtest Sharpe · ~50 markets',
    method:
      'Founder, UCLA Startup Labs. A scraping and embedding pipeline (custom CNN for images, adapted NLP model for text) maps social signals into a 4-D feature space; backtested on Kalshi markets over four months.',
    links: [],
  },
]
