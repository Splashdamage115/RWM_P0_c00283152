import { cubeFilter as myCube } from '$lib/filters/cubeFilter';
import { cubesFilt as peerCubes } from 'peer-filter-c00278711/src/lib/filters/cubeFilter';

export function combinedFilter(xs: number[]) : number[] 
{
    const afterMine = myCube(xs);
    return peerCubes(afterMine);
}