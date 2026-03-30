const nodeService = require('../services/nodeservice');

exports.registerNode = (req, res) => {
    const { worker_id, cpu, ram, status, capabilities, max_workers } = req.body;

    if (!worker_id) {
        return res.status(400).json({ error: 'worker_id is required' });
    }

    const registeredId = nodeService.registerNode(
        worker_id,
        cpu,
        ram,
        status || 'idle',
        capabilities || {},
        max_workers
    );
    res.json({ worker_id: registeredId });
};

exports.heartbeat = (req, res) => {
    const { worker_id, cpu_usage, ram_usage, status, available_slots } = req.body;

    if (!worker_id) {
        return res.status(400).json({ error: 'worker_id is required' });
    }

    const ok = nodeService.heartbeat(worker_id, cpu_usage, ram_usage, status, available_slots);

    if (!ok) {
        return res.status(400).json({ error: 'Invalid worker_id' });
    }

    res.json({ message: 'Heartbeat received' });
};

exports.getNodes = (req, res) => {
    const nodes = nodeService.getAllNodes();
    res.json(nodes);
};
