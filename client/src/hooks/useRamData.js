// src/hooks/useRAMData.js
import { useState, useEffect } from 'react';
import RAMService from '../utils/ramUtils';

export const useRAMData = () => {
  const [ramData, setRamData] = useState({
    total: null,
    free: null,
    used: null,
    usagePercent: null,
    totalGB: null,
    freeGB: null,
    usedGB: null,
    shareable: null,
    loading: true,
    error: null,
    isAccurate: false
  });

  const fetchRAMData = async () => {
    try {
      setRamData(prev => ({ ...prev, loading: true, error: null }));
      
      const memoryInfo = await RAMService.getSystemMemory();
      
      if (memoryInfo) {
        const shareableInfo = RAMService.calculateSafeShareableRAM(
          memoryInfo.total,
          memoryInfo.free,
          memoryInfo.usagePercent
        );
        
        setRamData({
          ...memoryInfo,
          shareable: shareableInfo,
          loading: false,
          error: null
        });
        
        // Return the recommended shareable amount for potential auto-fill
        return shareableInfo.recommendedShareableGBRaw;
      } else {
        throw new Error('Failed to fetch memory info');
      }
    } catch (error) {
      console.error('RAM detection error:', error);
      setRamData(prev => ({
        ...prev,
        loading: false,
        error: 'Unable to detect system memory'
      }));
      return null;
    }
  };

  useEffect(() => {
    fetchRAMData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchRAMData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { ramData, refreshRAMData: fetchRAMData };
};