import { describe, it, expect } from 'vitest';
import { combinedFilter } from './combined';

describe("combined filter (mine -> peer)", () => {
    it("basiic cube then cube again", () => {
        const input = [1, 2, 3, 5];
        const expectOut = [1, 512, 19683, 1953125];
        expect(combinedFilter(input)).toEqual(expectOut);
    })
});
