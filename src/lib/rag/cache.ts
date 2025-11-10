import { RetrievalResult, RAGResponse } from './retrieval';

// Cache configuration
const CACHE_CONFIG = {
  // Query cache (in memory)
  QUERY_CACHE_SIZE: 100,
  QUERY_CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  
  // Document cache (localStorage)
  DOCUMENT_CACHE_TTL: 30 * 60 * 1000, // 30 minutes
  
  // Embedding cache (localStorage)
  EMBEDDING_CACHE_TTL: 24 * 60 * 60 * 1000, // 24 hours
  
  // Analytics cache (localStorage)
  ANALYTICS_CACHE_TTL: 10 * 60 * 1000, // 10 minutes
};

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface QueryCacheEntry extends CacheEntry<RAGResponse> {
  query: string;
  userId: string;
  options: any;
}

interface DocumentCacheEntry extends CacheEntry<any> {
  documentId: string;
  userId: string;
}

interface EmbeddingCacheEntry extends CacheEntry<number[]> {
  text: string;
}

interface AnalyticsCacheEntry extends CacheEntry<any> {
  userId: string;
  type: 'stats' | 'usage';
}

class RAGCache {
  private queryCache: Map<string, QueryCacheEntry> = new Map();
  private cacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0
  };

  constructor() {
    // Clean up expired entries periodically
    setInterval(() => this.cleanup(), 60 * 1000); // Every minute
  }

  // Query Cache (in-memory)
  getQueryCache(query: string, userId: string, options: any = {}): RAGResponse | null {
    const key = this.generateQueryKey(query, userId, options);
    const entry = this.queryCache.get(key);

    if (!entry) {
      this.cacheStats.misses++;
      return null;
    }

    if (this.isExpired(entry)) {
      this.queryCache.delete(key);
      this.cacheStats.misses++;
      return null;
    }

    this.cacheStats.hits++;
    return entry.data;
  }

  setQueryCache(query: string, userId: string, response: RAGResponse, options: any = {}): void {
    const key = this.generateQueryKey(query, userId, options);
    
    // Evict oldest entries if cache is full
    if (this.queryCache.size >= CACHE_CONFIG.QUERY_CACHE_SIZE) {
      const oldestKey = this.queryCache.keys().next().value;
      if (oldestKey) {
        this.queryCache.delete(oldestKey);
        this.cacheStats.evictions++;
      }
    }

    this.queryCache.set(key, {
      data: response,
      query,
      userId,
      options,
      timestamp: Date.now(),
      ttl: CACHE_CONFIG.QUERY_CACHE_TTL
    });
  }

  // Document Cache (localStorage)
  getDocumentCache(documentId: string, userId: string): any | null {
    try {
      const key = `document_${documentId}_${userId}`;
      const cached = localStorage.getItem(key);
      
      if (!cached) return null;

      const entry: DocumentCacheEntry = JSON.parse(cached);
      
      if (this.isExpired(entry)) {
        localStorage.removeItem(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Error getting document from cache:', error);
      return null;
    }
  }

  setDocumentCache(documentId: string, userId: string, data: any): void {
    try {
      const key = `document_${documentId}_${userId}`;
      const entry: DocumentCacheEntry = {
        data,
        documentId,
        userId,
        timestamp: Date.now(),
        ttl: CACHE_CONFIG.DOCUMENT_CACHE_TTL
      };

      localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.error('Error setting document cache:', error);
    }
  }

  // Embedding Cache (localStorage)
  getEmbeddingCache(text: string): number[] | null {
    try {
      const key = `embedding_${this.hashText(text)}`;
      const cached = localStorage.getItem(key);
      
      if (!cached) return null;

      const entry: EmbeddingCacheEntry = JSON.parse(cached);
      
      if (this.isExpired(entry)) {
        localStorage.removeItem(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Error getting embedding from cache:', error);
      return null;
    }
  }

  setEmbeddingCache(text: string, embedding: number[]): void {
    try {
      const key = `embedding_${this.hashText(text)}`;
      const entry: EmbeddingCacheEntry = {
        data: embedding,
        text,
        timestamp: Date.now(),
        ttl: CACHE_CONFIG.EMBEDDING_CACHE_TTL
      };

      localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.error('Error setting embedding cache:', error);
    }
  }

  // Analytics Cache (localStorage)
  getAnalyticsCache(userId: string, type: 'stats' | 'usage'): any | null {
    try {
      const key = `analytics_${type}_${userId}`;
      const cached = localStorage.getItem(key);
      
      if (!cached) return null;

      const entry: AnalyticsCacheEntry = JSON.parse(cached);
      
      if (this.isExpired(entry)) {
        localStorage.removeItem(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Error getting analytics from cache:', error);
      return null;
    }
  }

  setAnalyticsCache(userId: string, type: 'stats' | 'usage', data: any): void {
    try {
      const key = `analytics_${type}_${userId}`;
      const entry: AnalyticsCacheEntry = {
        data,
        userId,
        type,
        timestamp: Date.now(),
        ttl: CACHE_CONFIG.ANALYTICS_CACHE_TTL
      };

      localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.error('Error setting analytics cache:', error);
    }
  }

  // Cache management
  clearQueryCache(): void {
    this.queryCache.clear();
  }

  clearDocumentCache(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('document_')) {
        localStorage.removeItem(key);
      }
    });
  }

  clearEmbeddingCache(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('embedding_')) {
        localStorage.removeItem(key);
      }
    });
  }

  clearAnalyticsCache(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('analytics_')) {
        localStorage.removeItem(key);
      }
    });
  }

  clearAllCache(): void {
    this.clearQueryCache();
    this.clearDocumentCache();
    this.clearEmbeddingCache();
    this.clearAnalyticsCache();
  }

  // Cache statistics
  getCacheStats(): {
    queryCache: {
      size: number;
      hits: number;
      misses: number;
      hitRate: number;
      evictions: number;
    };
    localStorage: {
      usedSpace: number;
      totalSpace: number;
      usagePercentage: number;
    };
  } {
    const totalQueries = this.cacheStats.hits + this.cacheStats.misses;
    const hitRate = totalQueries > 0 ? (this.cacheStats.hits / totalQueries) * 100 : 0;

    // Calculate localStorage usage
    let usedSpace = 0;
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      usedSpace += localStorage.getItem(key)?.length || 0;
    });

    // Estimate total localStorage space (typically 5-10MB)
    const totalSpace = 5 * 1024 * 1024; // 5MB
    const usagePercentage = (usedSpace / totalSpace) * 100;

    return {
      queryCache: {
        size: this.queryCache.size,
        hits: this.cacheStats.hits,
        misses: this.cacheStats.misses,
        hitRate: Math.round(hitRate * 100) / 100,
        evictions: this.cacheStats.evictions
      },
      localStorage: {
        usedSpace,
        totalSpace,
        usagePercentage: Math.round(usagePercentage * 100) / 100
      }
    };
  }

  // Private helper methods
  private generateQueryKey(query: string, userId: string, options: any): string {
    const optionsStr = JSON.stringify(options);
    return `${userId}_${this.hashText(query)}_${this.hashText(optionsStr)}`;
  }

  private hashText(text: string): string {
    // Simple hash function (in production, use a proper hash function)
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  public cleanup(): void {
    // Clean up expired query cache entries
    for (const [key, entry] of this.queryCache.entries()) {
      if (this.isExpired(entry)) {
        this.queryCache.delete(key);
      }
    }

    // Clean up expired localStorage entries
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const entry = JSON.parse(cached);
          if (entry.timestamp && entry.ttl && this.isExpired(entry)) {
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        // Remove invalid entries
        localStorage.removeItem(key);
      }
    });
  }
}

// Export singleton instance
export const ragCache = new RAGCache();

// Cache optimization utilities
export class CacheOptimizer {
  // Preload common queries
  static async preloadCommonQueries(userId: string, commonQueries: string[]): Promise<void> {
    // This would be implemented to preload common queries
    // For now, it's a placeholder
    console.log('Preloading common queries for user:', userId);
  }

  // Optimize cache based on usage patterns
  static optimizeCache(): void {
    const stats = ragCache.getCacheStats();
    
    // If hit rate is low, increase TTL
    if (stats.queryCache.hitRate < 50) {
      console.log('Low cache hit rate, consider increasing TTL');
    }

    // If localStorage is getting full, clean up old entries
    if (stats.localStorage.usagePercentage > 80) {
      console.log('High localStorage usage, cleaning up old entries');
      // Make cleanup method public
      ragCache.cleanup();
    }
  }

  // Warm up cache with frequently accessed documents
  static async warmUpCache(userId: string, documentIds: string[]): Promise<void> {
    // This would be implemented to warm up cache
    console.log('Warming up cache for user:', userId);
  }

  // Get cache recommendations
  static getRecommendations(): string[] {
    const stats = ragCache.getCacheStats();
    const recommendations: string[] = [];

    if (stats.queryCache.hitRate < 50) {
      recommendations.push('Consider increasing query cache TTL for better hit rates');
    }

    if (stats.localStorage.usagePercentage > 80) {
      recommendations.push('LocalStorage usage is high, consider cleaning up old cache entries');
    }

    if (stats.queryCache.evictions > 10) {
      recommendations.push('Consider increasing query cache size to reduce evictions');
    }

    if (recommendations.length === 0) {
      recommendations.push('Cache performance is optimal');
    }

    return recommendations;
  }
}

// Export cache utilities
export { CACHE_CONFIG };