import http2 from 'http2';
import { exec } from 'child_process';
import { CentralDogmaClient } from '../lib/centralDogmaClient';
import { ContentService, WatchService } from '../lib';

const { HTTP_STATUS_NOT_MODIFIED } = http2.constants;

const client = new CentralDogmaClient({
    baseURL: 'http://localhost:36462',
});
const contentService = new ContentService(client);
const sut = new WatchService(client, contentService);

describe('WatchService', () => {
    async function sleep(milliseconds: number) {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
    }

    it('watchFileInner returns Not Modified(304) response', async () => {
        const project = 'project1';
        const repo = 'repo1';
        const filePath = '/test1.json';
        const [entry] = await contentService.getFile(project, repo, filePath);
        const revision = entry.revision ?? -1;

        try {
            const timeoutSeconds = 3;

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await sut.watchFileInner(
                project,
                repo,
                filePath,
                revision,
                timeoutSeconds
            );

            // If no error occurs, let this test fail
            expect(true).toBe(false);
        } catch (e) {
            expect(e.statusCode).toBe(HTTP_STATUS_NOT_MODIFIED);
        }
    }, 10_000);

    it('watchFile', async () => {
        const project = 'project2';
        const repo = 'repo2';
        const filePath = '/test6.json';

        const emitter = sut.watchFile(project, repo, filePath);

        let count = 0;

        emitter.on('data', (data) => {
            count++;
            console.log(`data=${JSON.stringify(data)}`);
        });

        setTimeout(() => {
            // The target updates the json three times
            exec('make update-test-data', (e) => {
                if (e) {
                    // fail
                    expect(true).toBe(false);
                }
            });
        }, 1_000);

        await sleep(15_000);

        expect(count).toBe(3);
    }, 30_000);
});
