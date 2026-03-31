const store = require('../data/store');

async function registerNode(workerId, cpu = 0, ram = 0, status = 'idle', capabilities = {}, maxWorkers = 1) {
    if (!workerId) return null;

    await store.withLock(async () => {
        const nodes = await store.getNodes();
        nodes[workerId] = {
            cpu,
            ram,
            status,
            capabilities,
            max_workers: Number(maxWorkers) > 0 ? Number(maxWorkers) : 1,
            available_slots: Number(maxWorkers) > 0 ? Number(maxWorkers) : 1,
            lastSeen: Date.now(),
            cpu_usage: 0,
            ram_usage: 0
        };
        await store.setNodes(nodes);
    });

    return workerId;
}

async function heartbeat(workerId, cpu_usage = null, ram_usage = null, status = null, availableSlots = null) {
    let updated = false;

    await store.withLock(async () => {
        const nodes = await store.getNodes();
        if (!nodes[workerId]) {
            return;
        }

        nodes[workerId].lastSeen = Date.now();
        if (cpu_usage !== null) nodes[workerId].cpu_usage = cpu_usage;
        if (ram_usage !== null) nodes[workerId].ram_usage = ram_usage;
        if (status !== null) nodes[workerId].status = status;
        if (availableSlots !== null) {
            const parsedSlots = Number(availableSlots);
            nodes[workerId].available_slots = Number.isFinite(parsedSlots)
                ? Math.max(0, parsedSlots)
                : nodes[workerId].available_slots;
        }
        nodes[workerId].status = nodes[workerId].status || 'idle';
        await store.setNodes(nodes);
        updated = true;
    });

    return updated;
}

async function getAllNodes() {
    return store.getNodes();
}

async function removeDeadNodes(timeout = 10000) {
    const now = Date.now();
    await store.withLock(async () => {
        const nodes = await store.getNodes();
        for (const nodeId of Object.keys(nodes)) {
            if (now - nodes[nodeId].lastSeen > timeout) {
                console.log(`Node ${nodeId} removed (dead)`);
                delete nodes[nodeId];
            }
        }
        await store.setNodes(nodes);
    });
}

module.exports = { registerNode, heartbeat, getAllNodes, removeDeadNodes };
