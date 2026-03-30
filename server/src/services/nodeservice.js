const store = require('../data/store');

function registerNode(workerId, cpu = 0, ram = 0, status = 'idle', capabilities = {}, maxWorkers = 1) {
    if (!workerId) return null;

    store.nodes[workerId] = {
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

    return workerId;
}

function heartbeat(workerId, cpu_usage = null, ram_usage = null, status = null, availableSlots = null) {
    if (!store.nodes[workerId]) return false;

    store.nodes[workerId].lastSeen = Date.now();
    if (cpu_usage !== null) store.nodes[workerId].cpu_usage = cpu_usage;
    if (ram_usage !== null) store.nodes[workerId].ram_usage = ram_usage;
    if (status !== null) store.nodes[workerId].status = status;
    if (availableSlots !== null) {
        const parsedSlots = Number(availableSlots);
        store.nodes[workerId].available_slots = Number.isFinite(parsedSlots) ? Math.max(0, parsedSlots) : store.nodes[workerId].available_slots;
    }
    store.nodes[workerId].status = store.nodes[workerId].status || 'idle';

    return true;
}

function getAllNodes() {
    return store.nodes;
}

function removeDeadNodes(timeout = 10000) {
    const now = Date.now();

    for (let nodeId in store.nodes) {
        if (now - store.nodes[nodeId].lastSeen > timeout) {
            console.log(`Node ${nodeId} removed (dead)`);
            delete store.nodes[nodeId];
        }
    }
}

module.exports = { registerNode, heartbeat, getAllNodes, removeDeadNodes };
