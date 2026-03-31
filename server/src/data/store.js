const crypto = require('crypto');

const REDIS_URL = process.env.REDIS_URL;
const KEYS = {
    nodes: 'cloudless:nodes',
    jobQueue: 'cloudless:jobQueue',
    activeJobs: 'cloudless:activeJobs',
    results: 'cloudless:results',
    disabledWorkers: 'cloudless:disabledWorkers',
    lock: 'cloudless:lock',
};

const memoryState = {
    nodes: {},
    jobQueue: [],
    activeJobs: {},
    results: {},
    disabledWorkers: {},
};

let redisClientPromise = null;

async function getRedisClient() {
    if (!REDIS_URL) {
        return null;
    }

    if (!redisClientPromise) {
        const { createClient } = require('redis');
        const client = createClient({
            url: REDIS_URL,
            socket: {
                reconnectStrategy: (retries) => Math.min(retries * 200, 2000),
            },
        });

        client.on('error', (error) => {
            console.error('Redis client error:', error);
        });

        redisClientPromise = client.connect().then(() => client);
    }

    return redisClientPromise;
}

async function readJson(key, fallback) {
    const client = await getRedisClient();
    if (!client) {
        return fallback;
    }

    const raw = await client.get(key);
    return raw ? JSON.parse(raw) : fallback;
}

async function writeJson(key, value) {
    const client = await getRedisClient();
    if (!client) {
        return;
    }

    await client.set(key, JSON.stringify(value));
}

async function withLock(callback) {
    const client = await getRedisClient();
    if (!client) {
        return callback();
    }

    const token = crypto.randomUUID();
    const maxWaitMs = 5000;
    const lockTtlMs = 5000;
    const started = Date.now();

    while (Date.now() - started < maxWaitMs) {
        const acquired = await client.set(KEYS.lock, token, {
            NX: true,
            PX: lockTtlMs,
        });

        if (acquired) {
            try {
                return await callback();
            } finally {
                await client.eval(
                    `
                    if redis.call("GET", KEYS[1]) == ARGV[1] then
                        return redis.call("DEL", KEYS[1])
                    end
                    return 0
                    `,
                    {
                        keys: [KEYS.lock],
                        arguments: [token],
                    }
                );
            }
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new Error('Failed to acquire Redis lock');
}

async function getNodes() {
    if (!REDIS_URL) {
        return memoryState.nodes;
    }
    return readJson(KEYS.nodes, {});
}

async function setNodes(nodes) {
    if (!REDIS_URL) {
        memoryState.nodes = nodes;
        return;
    }
    await writeJson(KEYS.nodes, nodes);
}

async function getJobQueue() {
    if (!REDIS_URL) {
        return memoryState.jobQueue;
    }
    return readJson(KEYS.jobQueue, []);
}

async function setJobQueue(jobQueue) {
    if (!REDIS_URL) {
        memoryState.jobQueue = jobQueue;
        return;
    }
    await writeJson(KEYS.jobQueue, jobQueue);
}

async function getActiveJobs() {
    if (!REDIS_URL) {
        return memoryState.activeJobs;
    }
    return readJson(KEYS.activeJobs, {});
}

async function setActiveJobs(activeJobs) {
    if (!REDIS_URL) {
        memoryState.activeJobs = activeJobs;
        return;
    }
    await writeJson(KEYS.activeJobs, activeJobs);
}

async function getResults() {
    if (!REDIS_URL) {
        return memoryState.results;
    }
    return readJson(KEYS.results, {});
}

async function setResults(results) {
    if (!REDIS_URL) {
        memoryState.results = results;
        return;
    }
    await writeJson(KEYS.results, results);
}

async function getStats() {
    const [nodes, jobQueue, activeJobs, results] = await Promise.all([
        getNodes(),
        getJobQueue(),
        getActiveJobs(),
        getResults(),
    ]);

    return {
        totalNodes: Object.keys(nodes).length,
        activeJobs: Object.keys(activeJobs).length,
        pendingJobs: jobQueue.length,
        completedJobs: Object.keys(results).length,
    };
}

async function getDisabledWorkers() {
    if (!REDIS_URL) {
        return memoryState.disabledWorkers;
    }
    return readJson(KEYS.disabledWorkers, {});
}

async function setDisabledWorkers(disabledWorkers) {
    if (!REDIS_URL) {
        memoryState.disabledWorkers = disabledWorkers;
        return;
    }
    await writeJson(KEYS.disabledWorkers, disabledWorkers);
}

module.exports = {
    withLock,
    getNodes,
    setNodes,
    getJobQueue,
    setJobQueue,
    getActiveJobs,
    setActiveJobs,
    getResults,
    setResults,
    getDisabledWorkers,
    setDisabledWorkers,
    getStats,
};
