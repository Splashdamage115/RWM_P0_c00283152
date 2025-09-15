import { describe, it, expect } from 'vitest';
import { cubeFilter } from './cubeFilter';

describe("cube numbers filter", () => {
    it('cubes a string of numbers', () => {
        const inputVals = [0, 2, 4, 6];
        const outputVals = [0, 8, 64, 216];
        expect(cubeFilter(inputVals)).toEqual(outputVals);
    })
});