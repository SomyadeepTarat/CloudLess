const store = require('../data/store');

function registerNode(workerId, cpu = 0, ram = 0, status = 'idle') {
    if (!workerId) return null;

    store.nodes[workerId] = {
        cpu,
        ram,
        status,
        lastSeen: Date.now(),
        cpu_usage: 0,
        ram_usage: 0
    };

    return workerId;
}

function heartbeat(workerId, cpu_usage = null, ram_usage = null) {
    if (!store.nodes[workerId]) return false;

    store.nodes[workerId].lastSeen = Date.now();
    if (cpu_usage !== null) store.nodes[workerId].cpu_usage = cpu_usage;
    if (ram_usage !== null) store.nodes[workerId].ram_usage = ram_usage;
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