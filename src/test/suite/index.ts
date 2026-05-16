import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Mocha = require('mocha');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const glob = require('glob');

interface MochaLike {
    addFile(file: string): void;
    run(cb: (failures: number) => void): void;
}

export function run(): Promise<void> {
    const mocha: MochaLike = new Mocha({
        ui: 'tdd',
        color: true,
        timeout: 20_000,
    });
    const testsRoot = path.resolve(__dirname);

    return new Promise<void>((resolve, reject) => {
        glob(
            '**/**.test.js',
            { cwd: testsRoot },
            (err: Error | null, files: string[]) => {
                if (err) {
                    return reject(err);
                }
                files.forEach((f: string) =>
                    mocha.addFile(path.resolve(testsRoot, f)),
                );
                try {
                    mocha.run((failures: number) => {
                        if (failures > 0) {
                            reject(new Error(`${failures} tests failed`));
                        } else {
                            resolve();
                        }
                    });
                } catch (e) {
                    reject(e);
                }
            },
        );
    });
}
