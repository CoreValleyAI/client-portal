// Fake data for the Corevalley console UI kit. Not production data.
window.CV_DATA = {
  regions: [
    { id: 'np-ktm-1', city: 'Kathmandu', hydro: '$0.04', latency: '~40ms', grid: 'Upper Tamakoshi' },
    { id: 'np-pkr-1', city: 'Pokhara', hydro: '$0.05', latency: '~48ms', grid: 'Kali Gandaki' },
    { id: 'np-brt-1', city: 'Biratnagar', hydro: '$0.04', latency: '~38ms', grid: 'Koshi' },
  ],
  gpus: [
    { id: 'h200', name: 'NVIDIA H200', vram: '141 GB', price: '$2.10/hr' },
    { id: 'h100', name: 'NVIDIA H100', vram: '80 GB', price: '$1.80/hr' },
    { id: 'a100', name: 'NVIDIA A100', vram: '80 GB', price: '$1.10/hr' },
    { id: 'l40s', name: 'NVIDIA L40S', vram: '48 GB', price: '$0.78/hr' },
  ],
  instances: [
    { id: 'cv-9f3a21', name: 'llama-ft-run', gpu: '8× H200', region: 'np-ktm-1', status: 'running', util: 94, uptime: '4d 02h', cost: '$402.10' },
    { id: 'cv-7b1c40', name: 'mixtral-batch', gpu: '4× H100', region: 'np-pkr-1', status: 'running', util: 71, uptime: '11h 20m', cost: '$84.40' },
    { id: 'cv-3a8d77', name: 'embeddings-svc', gpu: '2× L40S', region: 'np-ktm-1', status: 'running', util: 38, uptime: '2d 14h', cost: '$58.90' },
    { id: 'cv-1e5f09', name: 'sd-finetune', gpu: '1× A100', region: 'np-brt-1', status: 'queued', util: 0, uptime: '—', cost: '$0.00' },
    { id: 'cv-6c2b13', name: 'eval-sweep', gpu: '2× H100', region: 'np-pkr-1', status: 'stopped', util: 0, uptime: '—', cost: '$31.20' },
  ],
  nav: [
    { id: 'overview', label: 'overview', icon: 'gauge' },
    { id: 'instances', label: 'instances', icon: 'server' },
    { id: 'storage', label: 'storage', icon: 'database' },
    { id: 'regions', label: 'regions', icon: 'globe' },
    { id: 'usage', label: 'usage', icon: 'activity' },
    { id: 'settings', label: 'settings', icon: 'settings' },
  ],
};
