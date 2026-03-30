const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');

const ML_DIR = path.resolve(__dirname, '../../../ml');
const RECOMMENDER_PATH = path.join(ML_DIR, 'recommender.py');
const PYTHON_BIN = process.env.PYTHON_BIN || '/usr/local/bin/python3';

function execFileAsync(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        execFile(command, args, options, (error, stdout, stderr) => {
            if (error) {
                error.stdout = stdout;
                error.stderr = stderr;
                reject(error);
                return;
            }

            resolve({ stdout, stderr });
        });
    });
}

async function analyzePythonCode(code, filename = 'uploaded.py') {
    const safeName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_') || 'uploaded.py';
    const tempFilePath = path.join(os.tmpdir(), `cloudless-${Date.now()}-${safeName}`);

    await fs.writeFile(tempFilePath, code, 'utf8');

    try {
        const { stdout, stderr } = await execFileAsync(
            PYTHON_BIN,
            [RECOMMENDER_PATH, '--json', tempFilePath],
            { cwd: ML_DIR }
        );

        const output = stdout
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);
        const lastLine = output[output.length - 1];

        if (!lastLine) {
            throw new Error(stderr?.trim() || 'No output from recommender');
        }

        const parsed = JSON.parse(lastLine);

        if (parsed.error) {
            throw new Error(parsed.error);
        }

        return parsed;
    } finally {
        await fs.unlink(tempFilePath).catch(() => {});
    }
}

module.exports = {
    analyzePythonCode,
};
