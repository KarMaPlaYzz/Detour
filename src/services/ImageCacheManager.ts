import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheMetadata {
  url: string;
  timestamp: number;
  size: number;
  hits: number;
}

/**
 * Image Cache Manager
 * Manages image caching with expiration and size limits
 */
export class ImageCacheManager {
  private static CACHE_PREFIX = 'image_cache_';
  private static METADATA_KEY = 'image_cache_metadata';
  private static MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
  private static CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

  /**
   * Get cached image data
   */
  static async getImageFromCache(url: string): Promise<string | null> {
    try {
      const cacheKey = this.CACHE_PREFIX + this.hashUrl(url);
      const cachedData = await AsyncStorage.getItem(cacheKey);

      if (cachedData) {
        // Update metadata - track cache hits
        await this.updateMetadata(url, true);
        return cachedData;
      }

      return null;
    } catch (error) {
      console.warn('Error reading from image cache:', error);
      return null;
    }
  }

  /**
   * Cache image data
   */
  static async cacheImage(url: string, imageData: string): Promise<void> {
    try {
      const cacheKey = this.CACHE_PREFIX + this.hashUrl(url);
      const sizeInBytes = imageData.length;

      // Check if we need to evict old items
      await this.checkAndEvictIfNeeded(sizeInBytes);

      // Store the image
      await AsyncStorage.setItem(cacheKey, imageData);

      // Update metadata
      await this.updateMetadata(url, false, sizeInBytes);
    } catch (error) {
      console.warn('Error caching image:', error);
    }
  }

  /**
   * Clear expired cache entries
   */
  static async clearExpiredCache(): Promise<void> {
    try {
      const metadataStr = await AsyncStorage.getItem(this.METADATA_KEY);
      if (!metadataStr) return;

      const metadata: Record<string, CacheMetadata> = JSON.parse(metadataStr);
      const now = Date.now();
      let cleared = 0;

      for (const [key, data] of Object.entries(metadata)) {
        if (now - data.timestamp > this.CACHE_TTL) {
          const cacheKey = this.CACHE_PREFIX + key;
          await AsyncStorage.removeItem(cacheKey);
          delete metadata[key];
          cleared++;
        }
      }

      if (cleared > 0) {
        await AsyncStorage.setItem(
          this.METADATA_KEY,
          JSON.stringify(metadata)
        );
        console.log(`Cleared ${cleared} expired cache entries`);
      }
    } catch (error) {
      console.warn('Error clearing expired cache:', error);
    }
  }

  /**
   * Clear all image cache
   */
  static async clearAllCache(): Promise<void> {
    try {
      const metadataStr = await AsyncStorage.getItem(this.METADATA_KEY);
      if (!metadataStr) return;

      const metadata: Record<string, CacheMetadata> = JSON.parse(metadataStr);

      for (const key of Object.keys(metadata)) {
        const cacheKey = this.CACHE_PREFIX + key;
        await AsyncStorage.removeItem(cacheKey);
      }

      await AsyncStorage.removeItem(this.METADATA_KEY);
      console.log('Cleared all image cache');
    } catch (error) {
      console.warn('Error clearing all cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats(): Promise<{
    totalSize: number;
    itemCount: number;
    oldestEntry: number;
    newestEntry: number;
  }> {
    try {
      const metadataStr = await AsyncStorage.getItem(this.METADATA_KEY);
      if (!metadataStr) {
        return {
          totalSize: 0,
          itemCount: 0,
          oldestEntry: 0,
          newestEntry: 0,
        };
      }

      const metadata: Record<string, CacheMetadata> = JSON.parse(metadataStr);
      const entries = Object.values(metadata);

      return {
        totalSize: entries.reduce((sum, m) => sum + m.size, 0),
        itemCount: entries.length,
        oldestEntry: entries.length ? Math.min(...entries.map(e => e.timestamp)) : 0,
        newestEntry: entries.length ? Math.max(...entries.map(e => e.timestamp)) : 0,
      };
    } catch (error) {
      console.warn('Error getting cache stats:', error);
      return {
        totalSize: 0,
        itemCount: 0,
        oldestEntry: 0,
        newestEntry: 0,
      };
    }
  }

  // Private helpers

  private static hashUrl(url: string): string {
    // Simple hash function for URL
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private static async updateMetadata(
    url: string,
    isHit: boolean,
    size: number = 0
  ): Promise<void> {
    try {
      const metadataStr = await AsyncStorage.getItem(this.METADATA_KEY);
      const metadata: Record<string, CacheMetadata> = metadataStr
        ? JSON.parse(metadataStr)
        : {};

      const hash = this.hashUrl(url);
      const now = Date.now();

      if (isHit && metadata[hash]) {
        // Increment hit count
        metadata[hash].hits++;
      } else if (!isHit) {
        // New cache entry
        metadata[hash] = {
          url,
          timestamp: now,
          size,
          hits: 0,
        };
      }

      await AsyncStorage.setItem(
        this.METADATA_KEY,
        JSON.stringify(metadata)
      );
    } catch (error) {
      console.warn('Error updating metadata:', error);
    }
  }

  private static async checkAndEvictIfNeeded(
    requiredSize: number
  ): Promise<void> {
    try {
      const stats = await this.getCacheStats();

      if (stats.totalSize + requiredSize > this.MAX_CACHE_SIZE) {
        // Evict least-used entries
        await this.evictLRU();
      }
    } catch (error) {
      console.warn('Error checking cache size:', error);
    }
  }

  private static async evictLRU(): Promise<void> {
    try {
      const metadataStr = await AsyncStorage.getItem(this.METADATA_KEY);
      if (!metadataStr) return;

      const metadata: Record<string, CacheMetadata> = JSON.parse(metadataStr);
      const entries = Object.entries(metadata).sort((a, b) => {
        // Sort by hits (ascending) then by timestamp (ascending)
        if (a[1].hits !== b[1].hits) {
          return a[1].hits - b[1].hits;
        }
        return a[1].timestamp - b[1].timestamp;
      });

      // Remove bottom 20% of entries
      const toRemove = Math.ceil(entries.length * 0.2);

      for (let i = 0; i < toRemove; i++) {
        const [key] = entries[i];
        const cacheKey = this.CACHE_PREFIX + key;
        await AsyncStorage.removeItem(cacheKey);
        delete metadata[key];
      }

      await AsyncStorage.setItem(
        this.METADATA_KEY,
        JSON.stringify(metadata)
      );
      console.log(`Evicted ${toRemove} cache entries`);
    } catch (error) {
      console.warn('Error evicting LRU entries:', error);
    }
  }
}
