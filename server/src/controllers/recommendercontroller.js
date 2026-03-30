const recommenderService = require('../services/recommenderservice');

exports.recommendResources = async (req, res) => {
    const { code, filename } = req.body;

    if (!code || !String(code).trim()) {
        return res.status(400).json({ error: 'code is required' });
    }

    try {
        const result = await recommenderService.analyzePythonCode(code, filename);
        const recommendedRamMb = Number(result.predicted_ram_mb || 0);
        const recommendedRamGb = Math.max(1, Math.ceil(recommendedRamMb / 1024));

        res.json({
            recommendedRamMb,
            recommendedRamGb,
            cpuLoad: result.cpu_load,
            gpuNeeded: Boolean(result.gpu_needed),
            system: result.system || {},
        });
    } catch (error) {
        console.error('Resource recommendation failed:', error);
        res.status(500).json({ error: error.message || 'Unable to analyze file' });
    }
};
