import { spawn } from 'node:child_process';

/**
 * @param {string} command
 * @param {ReadonlyArray<string>} args
 * @param {object} [options]
 */
export async function exec(command, args, options) {
  return new Promise((resolve, reject) => {
    const _process = spawn(command, args, {
      stdio: [
        'ignore', // stdin
        'pipe', // stdout
        'pipe', // stderr
      ],
      ...options,
      shell: process.platform === 'win32',
    });

    /**
     * @type {Buffer[]}
     */
    const stderrChunks = [];
    /**
     * @type {Buffer[]}
     */
    const stdoutChunks = [];

    _process.stderr?.on('data', (chunk) => {
      console.error(chunk.toString());
      stderrChunks.push(chunk);
    });

    _process.stdout?.on('data', (chunk) => {
      console.log(chunk.toString());
      stdoutChunks.push(chunk);
    });

    _process.on('error', (error) => {
      reject(error);
    });

    _process.on('exit', (code) => {
      const ok = code === 0;
      const stderr = Buffer.concat(stderrChunks).toString().trim();
      const stdout = Buffer.concat(stdoutChunks).toString().trim();

      if (ok) {
        const result = { ok, code, stderr, stdout };
        resolve(result);
      } else {
        const error = new Error(
          `Failed to execute command: ${command} ${args.join(' ')}`
        );
        error.stderr = stderr;
        error.stdout = stdout;
        reject(error);
      }
    });
  });
}
