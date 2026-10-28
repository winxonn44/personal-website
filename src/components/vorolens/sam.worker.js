// SlimSAM in a module worker, after the lab app's sam.worker.js: load the model once, encode
// each image once (the expensive step), then decode one point prompt into a mask per click.
// Weights come from the Hugging Face CDN and are cached by the browser after the first visit.
import { env, SamModel, AutoProcessor, RawImage, Tensor } from '@huggingface/transformers'

env.allowLocalModels = false

const MODEL_ID = 'Xenova/slimsam-77-uniform'
let model = null
let processor = null
let device = 'wasm'
let inputs = null
let embeddings = null

const progress = (p) => {
  if (p?.status === 'progress') self.postMessage({ type: 'progress', loaded: p.loaded, total: p.total, file: p.file })
}

async function loadModel(dev) {
  device = dev
  model = await SamModel.from_pretrained(MODEL_ID, { device: dev, progress_callback: progress })
}

async function load() {
  processor = await AutoProcessor.from_pretrained(MODEL_ID)
  const gpu = typeof navigator !== 'undefined' && !!navigator.gpu && !!(await navigator.gpu.requestAdapter().catch(() => null))
  try {
    await loadModel(gpu ? 'webgpu' : 'wasm')
  } catch (e) {
    if (device !== 'webgpu') throw e
    await loadModel('wasm')
  }
  self.postMessage({ type: 'ready', device })
}

async function encode(data, width, height) {
  const image = new RawImage(new Uint8ClampedArray(data), width, height, 4).rgb()
  inputs = await processor(image)
  try {
    embeddings = await model.get_image_embeddings(inputs)
  } catch (e) {
    // Some WebGPU adapters load the graph but fail to run it; retry once on WASM.
    if (device !== 'webgpu') throw e
    await loadModel('wasm')
    self.postMessage({ type: 'ready', device })
    embeddings = await model.get_image_embeddings(inputs)
  }
  self.postMessage({ type: 'encoded' })
}

async function decode(nx, ny, gen) {
  // Point prompts live in the processor's resized input space.
  const [rh, rw] = inputs.reshaped_input_sizes[0]
  const input_points = new Tensor('float32', new Float32Array([nx * rw, ny * rh]), [1, 1, 1, 2])
  const input_labels = new Tensor('int64', new BigInt64Array([1n]), [1, 1, 1])
  const outputs = await model({ ...embeddings, input_points, input_labels })
  const masks = await processor.post_process_masks(outputs.pred_masks, inputs.original_sizes, inputs.reshaped_input_sizes)

  // Keep the candidate mask with the best predicted IoU.
  const m = masks[0]
  const dims = m.dims
  const W = dims[dims.length - 1], H = dims[dims.length - 2]
  const scores = outputs.iou_scores.data
  let best = 0
  for (let i = 1; i < scores.length; i++) if (scores[i] > scores[best]) best = i
  const out = new Uint8Array(W * H)
  const off = best * W * H
  for (let i = 0; i < W * H; i++) out[i] = m.data[off + i] ? 1 : 0
  self.postMessage({ type: 'mask', data: out.buffer, width: W, height: H, gen }, [out.buffer])
}

// Serialise everything so the model never runs two calls at once.
let chain = Promise.resolve()
self.onmessage = ({ data: msg }) => {
  chain = chain
    .then(() => {
      if (msg.type === 'load') return load()
      if (msg.type === 'encode') return encode(msg.data, msg.width, msg.height)
      if (msg.type === 'decode') return decode(msg.nx, msg.ny, msg.gen)
    })
    .catch((err) => self.postMessage({ type: 'error', message: String(err?.message || err) }))
}
