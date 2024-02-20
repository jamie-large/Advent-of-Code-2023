import Utils from "./utils";
import path from "path";
import { lusolve } from "mathjs";

const debug = false;
const fname = debug ? "inputs/test.txt" : "inputs/" + path.basename(__filename).slice(0, -2) + "txt";
const u = new Utils(debug, fname);

type Point2D = [number, number];
type Point = [number, number, number];
type Velocity = [number, number, number];

function gcd_2(a: number, b: number) {
    return !b ? a : gcd_2(b, a % b);
}

function gcd(arr: number[]) {
    return arr.reduce((a, b) => gcd_2(a, b));
}

class Hailstone {
    public p: Point;
    public v: Velocity;
    public normalized_v: Velocity;

    constructor(p: Point, v: Velocity) {
        this.p = p;
        this.v = v;
        const this_gcd = gcd(v);
        this.normalized_v = v.map(x => x / this_gcd) as Velocity;
    }

    public get_2D_intersection(othe: Hailstone): Point2D | false {
        if ((this.v[0] === othe.v[0] && this.v[0] === 0) ||
            (this.v[1] === othe.v[1] && this.v[1] === 0) ||
            (this.v[0] !== 0 && othe.v[0] !== 0 && (this.v[1] / this.v[0]) === (othe.v[1] / othe.v[0]))) {
            return false;
        }

        if (this.v[0] === 0) {
            const t = (this.p[0] - othe.p[0]) / othe.v[0];
            return t >= 0 ? [this.p[0], othe.p[1] + othe.v[1] * t] : false;
        }
        if (othe.v[0] === 0) {
            const t = (othe.p[0] - this.p[0]) / this.v[0];
            return t >= 0 ? [othe.p[0], this.p[1] + this.v[1] * t] : false;
        }
        if (this.v[1] === 0) {
            const t = (this.p[1] - othe.p[1]) / othe.v[1];
            return t >= 0 ? [othe.p[0] + othe.v[0] * t, this.p[1]] : false;
        }
        if (othe.v[1] === 0) {
            const t = (othe.p[1] - this.p[1]) / this.v[1];
            return t >= 0 ? [this.p[0] + this.v[0] * t, othe.p[1]] : false;
        }
        
        const solution = lusolve([
            [-1 * this.v[1] / this.v[0], 1],
            [-1 * othe.v[1] / othe.v[0], 1]
        ], [
            [this.p[1] - (this.v[1] / this.v[0]) * this.p[0]],
            [othe.p[1] - (othe.v[1] / othe.v[0]) * othe.p[0]]
        ]);

        const t1 = (solution[0][0] - this.p[0]) / this.v[0];
        const t2 = (solution[0][0] - othe.p[0]) / othe.v[0];

        return t1 >= 0 && t2 >= 0 ? [solution[0][0], solution[1][0]] : false;
    }

    public is_3D_parallel(othe: Hailstone): boolean {
        return (this.v[0] === othe.v[0] && this.v[0] === 0) ||
               (this.v[1] === othe.v[1] && this.v[1] === 0) ||
               (this.v[2] === othe.v[2] && this.v[2] === 0) ||
               this.normalized_v.every((val, idx) => val === othe.normalized_v[idx]) ||
               this.normalized_v.every((val, idx) => val=== -1 * othe.normalized_v[idx]);
    }

    public toString() {
        return `${this.p[0]}, ${this.p[1]}, ${this.p[2]} @ ${this.v[0]}, ${this.v[1]}, ${this.v[2]}`;
    }
}

async function solution_part1() {
    const lr = u.getLineReader();
    const stones: Hailstone[] = [];

    lr.on('line', line => {
        const [p, v] = line.split("@").map(value => value.split(/,\s+/).map(x => parseInt(x)));
        stones.push(new Hailstone(p as Point, v as Point));
    });

    await u.closeLineReader();

    let result = 0;

    const boundary = debug ? [7, 27] : [200000000000000, 400000000000000];

    for (let i = 0; i < stones.length; i++) {
        for (let j = i+1; j < stones.length; j++) {
            const A = stones[i];
            const B = stones[j];
            u.log(`Hailstone A: ${A.toString()}`);
            u.log(`Hailstone B: ${B.toString()}`);
            const intersection = A.get_2D_intersection(B);
            u.log(intersection ? `${intersection[0]}, ${intersection[1]}` : false);

            if (intersection && intersection.every(x => x >= boundary[0] && x <= boundary[1])) {
                u.log("VALID");
                result++;
            }
        }
    }

    return result;

}

async function solution_part2() {
    const lr = u.getLineReader();
    const stones: Hailstone[] = [];

    lr.on('line', line => {
        const [p, v] = line.split("@").map(value => value.split(/,\s+/).map(x => parseInt(x)));
        stones.push(new Hailstone(p as Point, v as Point));
    });

    await u.closeLineReader();
    const [p0, v0, p1, v1, p2, v2, p3, v3] = [stones[0].p, stones[0].v, stones[1].p, stones[1].v, stones[2].p, stones[2].v, stones[3].p, stones[3].v];
    const [x, y, z] = [0, 1, 2];

    const A = [
        [v0[y] - v1[y], v1[x] - v0[x], 0, p1[y] - p0[y], p0[x] - p1[x], 0],
        [v0[z] - v1[z], 0, v1[x] - v0[x], p1[z] - p0[z], 0, p0[x] - p1[x]],
        [v0[y] - v2[y], v2[x] - v0[x], 0, p2[y] - p0[y], p0[x] - p2[x], 0],
        [v0[z] - v2[z], 0, v2[x] - v0[x], p2[z] - p0[z], 0, p0[x] - p2[x]],
        [v0[y] - v3[y], v3[x] - v0[x], 0, p3[y] - p0[y], p0[x] - p3[x], 0],
        [v0[z] - v3[z], 0, v3[x] - v0[x], p3[z] - p0[z], 0, p0[x] - p3[x]],
    ];

    const b = [
        [p0[x]*v0[y] - p1[x]*v1[y] + p1[y]*v1[x] - p0[y]*v0[x]],
        [p0[x]*v0[z] - p1[x]*v1[z] + p1[z]*v1[x] - p0[z]*v0[x]],
        [p0[x]*v0[y] - p2[x]*v2[y] + p2[y]*v2[x] - p0[y]*v0[x]],
        [p0[x]*v0[z] - p2[x]*v2[z] + p2[z]*v2[x] - p0[z]*v0[x]],
        [p0[x]*v0[y] - p3[x]*v3[y] + p3[y]*v3[x] - p0[y]*v0[x]],
        [p0[x]*v0[z] - p3[x]*v3[z] + p3[z]*v3[x] - p0[z]*v0[x]],
    ];

    const solution = lusolve(A, b);
    return Math.round(solution[0][0] + solution[1][0] + solution[2][0]);
}

let start_time = new Date().getTime();
solution_part1().then(result => console.log(`Part 1 solution: ${result} in ${new Date().getTime() - start_time} ms`));
solution_part2().then(result => console.log(`Part 2 solution: ${result} in ${new Date().getTime() - start_time} ms`));
