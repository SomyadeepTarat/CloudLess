// src/utils/ramUtils.js - Browser compatible version
class RAMService {
  constructor() {
    this.totalRAM = null;
    this.freeRAM = null;
    this.usagePercent = null;
  }

  async getSystemMemory() {
    try {
      let totalRAM, usedRAM, freeRAM;
      
      // Method 1: Use navigator.deviceMemory (Chrome only, approximate)
      if (navigator.deviceMemory) {
        totalRAM = navigator.deviceMemory * 1024 ** 3; // Convert GB to bytes
        // Estimate used memory (not accurate, but better than nothing)
        usedRAM = totalRAM * 0.6; // Rough estimate
        freeRAM = totalRAM - usedRAM;
      }
      // Method 2: Use performance.memory (Chrome only, gives heap info)
      else if (performance.memory) {
        totalRAM = performance.memory.jsHeapSizeLimit;
        usedRAM = performance.memory.usedJSHeapSize;
        freeRAM = totalRAM - usedRAM;
      }
      // Method 3: Fallback to mock data with warning
      else {
        console.warn('⚠️ Browser memory API not available. Using estimated values.');
        // Default to 16GB total, assume 60% usage
        totalRAM = 16 * 1024 ** 3;
        usedRAM = totalRAM * 0.6;
        freeRAM = totalRAM - usedRAM;
      }
      
      const usagePercent = (usedRAM / totalRAM) * 100;
      
      return {
        total: totalRAM,
        free: freeRAM,
        used: usedRAM,
        usagePercent: usagePercent,
        totalGB: this.formatBytes(totalRAM),
        freeGB: this.formatBytes(freeRAM),
        usedGB: this.formatBytes(usedRAM),
        isAccurate: !!navigator.deviceMemory || !!performance.memory
      };
    } catch (error) {
      console.error('Error getting memory info:', error);
      return this.getFallbackData();
    }
  }

  getFallbackData() {
    const totalRAM = 16 * 1024 ** 3; // Assume 16GB
    const usedRAM = totalRAM * 0.6; // Assume 60% usage
    const freeRAM = totalRAM - usedRAM;
    
    return {
      total: totalRAM,
      free: freeRAM,
      used: usedRAM,
      usagePercent: 60,
      totalGB: this.formatBytes(totalRAM),
      freeGB: this.formatBytes(freeRAM),
      usedGB: this.formatBytes(usedRAM),
      isAccurate: false
    };
  }

  formatBytes(bytes) {
    const gb = bytes / (1024 ** 3);
    return `${gb.toFixed(1)} GB`;
  }

  calculateSafeShareableRAM(totalRAM, freeRAM, usagePercent) {
    const MIN_RAM_FOR_SYSTEM = 2 * 1024 ** 3; // 2GB minimum
    
    // Calculate safe reserve based on total RAM
    let safeReserve;
    if (totalRAM <= 4 * 1024 ** 3) {
      safeReserve = totalRAM * 0.4; // 40% reserve for 4GB
    } else if (totalRAM <= 8 * 1024 ** 3) {
      safeReserve = totalRAM * 0.35; // 35% reserve for 8GB
    } else if (totalRAM <= 16 * 1024 ** 3) {
      safeReserve = totalRAM * 0.3; // 30% reserve for 16GB
    } else {
      safeReserve = totalRAM * 0.25; // 25% reserve for 32GB+
    }

    // Calculate maximum shareable
    let maxShareable = totalRAM - Math.max(MIN_RAM_FOR_SYSTEM, safeReserve);
    
    // Adjust based on current usage
    let recommendedShareable;
    if (usagePercent < 50) {
      // System is idle, can share more
      recommendedShareable = Math.min(freeRAM * 0.7, maxShareable);
    } else if (usagePercent < 75) {
      // Moderate usage, be conservative
      recommendedShareable = Math.min(freeRAM * 0.5, maxShareable * 0.7);
    } else {
      // High usage, minimal sharing
      recommendedShareable = Math.min(freeRAM * 0.2, maxShareable * 0.3);
    }

    // Ensure we don't recommend negative amounts
    recommendedShareable = Math.max(0, recommendedShareable);
    maxShareable = Math.max(0, maxShareable);

    // Convert to GB for display
    const recommendedGB = recommendedShareable / (1024 ** 3);
    
    return {
      maxShareableGB: this.formatBytes(maxShareable),
      recommendedShareableGB: this.formatBytes(recommendedShareable),
      recommendedShareableGBRaw: Math.floor(recommendedGB * 10) / 10, // Round to 1 decimal
      maxShareableBytes: maxShareable,
      recommendedShareableBytes: recommendedShareable,
      riskLevel: this.getRiskLevel(usagePercent),
      reasoning: this.getReasoning(usagePercent, freeRAM, recommendedGB)
    };
  }

  getRiskLevel(usagePercent) {
    if (usagePercent < 50) return 'low';
    if (usagePercent < 75) return 'medium';
    return 'high';
  }

  getReasoning(usagePercent, freeRAM, recommendedGB) {
    const freeGB = (freeRAM / (1024 ** 3)).toFixed(1);
    
    if (usagePercent < 50) {
      return `✓ Your system appears idle with approximately ${freeGB} GB free. You can safely share ${recommendedGB.toFixed(1)} GB without affecting performance.`;
    } else if (usagePercent < 75) {
      return `⚠️ Your system is moderately active. We recommend sharing ${recommendedGB.toFixed(1)} GB to maintain smooth performance.`;
    } else {
      return `⚠️ Your system appears to be under load. Sharing only ${recommendedGB.toFixed(1)} GB is recommended to prevent slowdowns.`;
    }
  }
}

export default new RAMService();