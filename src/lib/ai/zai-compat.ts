// ZAI Compatibility Layer - Handles build-time and runtime issues with ZAI SDK
let _zaiInstance: any | null = null;
let _zaiModule: any = null;

// Dynamic import with error handling for build process
async function loadZAIModule() {
  if (_zaiModule) return _zaiModule;
  
  try {
    // Use dynamic import to avoid build-time errors
    _zaiModule = await import('z-ai-web-dev-sdk');
    return _zaiModule;
  } catch (error) {
    console.warn('ZAI SDK not available, using fallback implementation:', error);
    // Create a mock module to prevent runtime errors
    _zaiModule = {
      default: class MockZAI {
        constructor(config?: any) {
          console.log('Mock ZAI instance created');
        }
        
        static async create(config?: any) {
          return new MockZAI(config);
        }
        
        embeddings = {
          create: async (params: any) => ({
            data: [{ embedding: new Array(1536).fill(0.1) }]
          })
        };
        
        chat = {
          completions: {
            create: async (params: any) => ({
              choices: [{
                message: {
                  content: 'This is a fallback response from the mock ZAI implementation.'
                }
              }]
            })
          }
        };
        
        functions = {
          invoke: async (name: string, params: any) => {
            console.log(`Mock function invoke: ${name}`, params);
            return {};
          }
        };
      }
    };
    return _zaiModule;
  }
}

async function createZAIInstance() {
  try {
    const ZAIModule = await loadZAIModule();
    const ZAIDefault = ZAIModule.default;
    
    if (typeof (ZAIDefault as any).create === 'function') {
      return await (ZAIDefault as any).create();
    }
    return new (ZAIDefault as any)();
  } catch (error) {
    console.warn('Failed to create ZAI instance, using fallback:', error);
    const ZAIModule = await loadZAIModule();
    return new ZAIModule.default();
  }
}

export async function getZAI() {
  if (_zaiInstance) return _zaiInstance;
  _zaiInstance = await createZAIInstance();
  return _zaiInstance;
}

export function getZAISync() {
  if (_zaiInstance) return _zaiInstance;
  
  // For synchronous calls, we need to use a fallback
  // This prevents build-time errors when ZAI is not available
  _zaiInstance = {
    embeddings: {
      create: async (params: any) => {
        console.warn('Using fallback embedding generation');
        return { data: [{ embedding: new Array(1536).fill(0.1) }] };
      }
    },
    chat: {
      completions: {
        create: async (params: any) => {
          console.warn('Using fallback chat completion');
          return {
            choices: [{
              message: {
                content: 'This is a fallback response. The AI service is currently unavailable.'
              }
            }]
          };
        }
      }
    },
    functions: {
      invoke: async (name: string, params: any) => {
        console.warn(`Using fallback function invoke: ${name}`);
        return {};
      }
    }
  };
  
  // Try to load the real ZAI asynchronously for future calls
  createZAIInstance().then(instance => {
    _zaiInstance = instance;
  }).catch(error => {
    console.warn('Failed to load real ZAI instance, keeping fallback:', error);
  });
  
  return _zaiInstance;
}

export default { getZAI, getZAISync };