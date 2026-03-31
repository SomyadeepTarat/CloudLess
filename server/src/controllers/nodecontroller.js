const nodeService = require('../services/nodeservice');

exports.registerNode = async (req, res) => {
    const { worker_id, cpu, ram, status, capabilities, max_workers } = req.body;

    if (!worker_id) {
        return res.status(400).json({ error: 'worker_id is required' });
    }

    try {
        const registeredId = await nodeService.registerNode(
            worker_id,
            cpu,
            ram,
            status || 'idle',
            capabilities || {},
            max_workers
        );
        res.json({ worker_id: registeredId });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Unable to register node' });
    }
};

exports.heartbeat = async (req, res) => {
    const { worker_id, cpu_usage, ram_usage, status, available_slots } = req.body;

    if (!worker_id) {
        return res.status(400).json({ error: 'worker_id is required' });
    }

    const ok = await nodeService.heartbeat(worker_id, cpu_usage, ram_usage, status, available_slots);

    if (!ok) {
        return res.status(400).json({ error: 'Invalid worker_id' });
    }

    res.json({ message: 'Heartbeat received' });
};

exports.getNodes = async (req, res) => {
    try {
        const nodes = await nodeService.getAllNodes();
        res.json(nodes);
    } catch (error) {
        res.status(500).json({ error: error.message || 'Unable to fetch nodes' });
    }
};
