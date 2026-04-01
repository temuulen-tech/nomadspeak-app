import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const androidDir = path.join(repoRoot, 'android');

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? repoRoot,
      env: options.env ?? process.env,
      stdio: 'inherit',
      shell: options.shell ?? false
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Command failed (${code}): ${command} ${args.join(' ')}`));
    });
  });
}

async function resolveJavaHomeFromJavaBinary() {
  return new Promise((resolve) => {
    const child = spawn('java', ['-XshowSettings:properties', '-version'], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stderr = '';
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', () => resolve(null));
    child.on('close', (code) => {
      if (code !== 0) {
        resolve(null);
        return;
      }

      const match = stderr.match(/\bjava\.home\s*=\s*(.+)/);
      if (!match) {
        resolve(null);
        return;
      }

      let javaHome = match[1].trim();
      if (javaHome.toLowerCase().endsWith(`${path.sep}jre`)) {
        javaHome = path.dirname(javaHome);
      }
      resolve(javaHome || null);
    });
  });
}

async function buildEnv() {
  const env = { ...process.env };
  if (env.JAVA_HOME) {
    return env;
  }

  const resolvedJavaHome = await resolveJavaHomeFromJavaBinary();
  if (resolvedJavaHome) {
    env.JAVA_HOME = resolvedJavaHome;
    console.log(`JAVA_HOME was not set. Using detected Java home: ${resolvedJavaHome}`);
  } else {
    console.log('JAVA_HOME is not set and could not be auto-detected. Gradle will use system Java if available.');
  }

  return env;
}

async function main() {
  const env = await buildEnv();

  await runCommand('npm', ['run', 'cap:copy:android'], {
    cwd: repoRoot,
    shell: process.platform === 'win32'
  });

  const gradleCommand = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
  await runCommand(gradleCommand, ['installDebug'], {
    cwd: androidDir,
    env,
    shell: process.platform === 'win32'
  });

  console.log('Android debug app updated on the connected device (if authorized and available).');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
