import ZAIDefault from 'z-ai-web-dev-sdk';

let _zaiInstance: any | null = null;

async function createZAIInstance() {
  if (typeof (ZAIDefault as any).create === 'function') {
    return await (ZAIDefault as any).create();
  }
  return new (ZAIDefault as any)();
}

export async function getZAI() {
  if (_zaiInstance) return _zaiInstance;
  _zaiInstance = await createZAIInstance();
  return _zaiInstance;
}

export function getZAISync() {
  if (_zaiInstance) return _zaiInstance;
  try {
    _zaiInstance = new (ZAIDefault as any)();
    return _zaiInstance;
  } catch (_) {
    return null;
  }
}

export default { getZAI, getZAISync };