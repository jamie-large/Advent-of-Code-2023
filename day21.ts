import Utils from "./utils";
import path from "path";
import { lusolve } from "mathjs";

const debug = false;
const fname = debug ? "inputs/test.txt" : "inputs/" + path.basename(__filename).slice(0, -2) + "txt";
const u = new Utils(debug, fname);

function manhattan_dist(a: [number, number], b: [number, number]) {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

function find_start(grid: string[]): [number, number] {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === "S") {
                return [i, j];
            }
        }
    }
    return [-1, -1];
}

function mod(val: number, base: number) {
    return val % base < 0 ? val % base + base : val % base;
}

function find_visited(grid: string[], start: [number, number], MAX_STEPS: number): number {
    // i, j, steps
    const queue: [number, number, number][] = [[...start, MAX_STEPS]];
    const visited: Set<string> = new Set([start.toString()]);

    let even_visited = 0;
    while (queue.length > 0) {
        const [r, c, steps] = queue.shift()!;
        even_visited += (manhattan_dist(start, [r, c]) + 1) % 2
        if (steps === 0) {
            continue;
        }

        const neighbors: [number, number][] = [[r+1, c], [r-1, c], [r, c+1], [r, c-1]];
        for (const n of neighbors) {
            if (grid[mod(n[0], grid.length)][mod(n[1], grid.length)] === "." && !visited.has(n.toString())) {
                queue.push([...n, steps - 1]);
                visited.add(n.toString());
            }
        }
    }
    return MAX_STEPS % 2 === 0 ? even_visited : visited.size - even_visited;
}

async function solution_part1() {
    const lr = u.getLineReader();
    const grid: string[] = [];
    lr.on('line', line => {
        grid.push(line);
    });

    await u.closeLineReader();

    const start = find_start(grid);
    return find_visited(grid, start, debug ? 6 : 64);
}    

async function solution_part2() {
    const lr = u.getLineReader();
    const grid: string[] = [];
    lr.on('line', line => {
        grid.push(line);
    });

    await u.closeLineReader();

    const grid_size = grid.length;
    const half_grid_size = grid_size / 2 - 0.5;
    const MAX_STEPS = 26501365;

    const start = find_start(grid);
    grid[start[0]] = grid[start[0]].substring(0, start[1]) + "." + grid[start[0]].substring(start[1] + 1);
    const grids_walked_through = (MAX_STEPS - start[0]) / grid_size;

    // NECESSARY ASSUMPTIONS
    if (!debug && (
            !grid.every(val => val.length === grid_size) ||                 // grid is square
            grid_size % 2 !== 1 ||                                          // grid has odd side length
            start[0] !== start[1] || start[0] !== half_grid_size ||         // start is in direct center
            !grid[0].split("").every(val => val === ".") ||                 // top row is blank
            !grid.at(-1)!.split("").every(val => val === ".") ||            // bottom row is blank
            !grid.every(val => val[0] === "." && val.at(-1)! === ".") ||    // first & last columns are blank
            !grid[start[0]].split("").every(val => val === ".") ||          // middle row is blank
            !grid.every(val => val[start[1]] === ".") ||                    // middle column is blank
            grids_walked_through % 2 !== 0                                  // walks through an even number of grids
        )) {
        throw Error("Bad assumption");
    }

    const val1 = find_visited(grid, start, half_grid_size);
    const val2 = find_visited(grid, start, half_grid_size + grid_size);
    const val3 = find_visited(grid, start, half_grid_size + 2 * grid_size);

    const solution = lusolve([
        [0, 0, 1],
        [1, 1, 1],
        [4, 2, 1],
    ], [val1, val2, val3]);
    
    return solution[0][0] * Math.pow(grids_walked_through, 2) + solution[1][0] * grids_walked_through + solution[2][0];
}

let start_time = new Date().getTime();
solution_part1().then(result => console.log(`Part 1 solution: ${result} in ${new Date().getTime() - start_time} ms`));
solution_part2().then(result => console.log(`Part 2 solution: ${result} in ${new Date().getTime() - start_time} ms`));
