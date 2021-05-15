import { HttpClient } from '../lib/internal/httpClient';
import { ContentService } from '../lib';

const client = new HttpClient({
    baseURL: 'http://localhost:36462',
});
const sut = new ContentService(client);

describe('ContentService', () => {
    it('listFiles', async () => {
        const entries = await sut.listFiles('project1', 'repo1');
        expect(entries.length).toBe(2);
        expect(entries[0].path).toBe('/test1.json');
        expect(entries[0].content).toEqual({
            field1: 'foo',
        });
        expect(entries[1].path).toBe('/test2.json');
        expect(entries[1].content).toEqual({
            field1: 'bar',
        });
    });

    it('getFile', async () => {
        const entry = await sut.getFile('project1', 'repo1', '/test1.json');
        expect(entry.path).toBe('/test1.json');
        expect(entry.content).toEqual({
            field1: 'foo',
        });
    });
});
