export function cubeFilter(x: number[]) : number[]
{
    let out: number[] = [];
    x.forEach(num => {
        out.fill(num * num * num);
    });
    return out;
}