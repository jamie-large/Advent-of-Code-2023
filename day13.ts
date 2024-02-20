import Utils from "./utils";
import path from "path";

const debug = false;
const fname = debug ? "inputs/test.txt" : "inputs/" + path.basename(__filename).slice(0, -2) + "txt";
const u = new Utils(debug, fname);

function find_mirror(grid: string[], m: Map<string, Set<number>>): number {
    for (let i = 0.5; i < grid.length - 1; i++) {
        let broken = false;
        for (let j = 0.5; j <= i; j++) {
            if (i + j >= grid.length) {
                break;
            }
            if (!m.get(grid[i+j])!.has(i-j)) {
                broken = true;
                break;
            }
        }
        if (!broken) {
            return i + 0.5;
        }
    }
    return -1;
}

function find_almost_mirror(grid: string[], m: Map<string, Set<number>>, almost_m: Map<string, Set<number>>): number {
    for (let i = 0.5; i < grid.length - 1; i++) {
        let foundAlmost = false;
        let broken = false;
        for (let j = 0.5; j <= i; j++) {
            if (i + j >= grid.length) {
                break;
            }
            if (!m.get(grid[i+j])!.has(i-j)) {
                if (!foundAlmost && almost_m.get(grid[i-j])!.has(i+j)) {
                    foundAlmost = true;
                }
                else {
                    broken = true;
                    break;
                }
            }
        }
        if (!broken && foundAlmost) {
            return i + 0.5;
        }
    }
    return -1;
}

function calculate_value(grid: string[], row_map: Map<string, Set<number>>, part2: boolean = false, row_almost_map?: Map<string, Set<number>>): number {
    const res = part2 ? find_almost_mirror(grid, row_map, row_almost_map!) : find_mirror(grid, row_map);
    if (res === -1) {
        const column_grid: string[] = [];
        const col_map: Map<string, Set<number>> = new Map();
        const col_almost_map: Map<string, Set<number>> = new Map();
        for (let i = 0; i < grid[0].length; i++) {
            const l = grid.map(val => val.at(i)).join("");
            column_grid.push(l);
            if (!col_map.has(l)) {
                col_map.set(l, new Set());
                col_almost_map.set(l, new Set());
            }
            col_map.get(l)!.add(column_grid.length - 1);
            if (part2) {
                const almost_strings = get_almost_strings(l);
                for (const as of almost_strings) {
                    if (col_almost_map.has(as)) {
                        col_almost_map.get(as)!.add(column_grid.length - 1);
                        for (const ind of col_map.get(as)!) {
                            col_almost_map.get(l)!.add(ind);
                        }
                    }
                }
            }
        }
        return part2 ? find_almost_mirror(column_grid, col_map, col_almost_map) : find_mirror(column_grid, col_map);
    }
    else {
        return 100 * res;
    }
}

async function solution_part1() {
    const lr = u.getLineReader();
    let result = 0;
    let grid: string[] = [];
    const row_map: Map<string, Set<number>> = new Map();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    lr.on('line', line => {
        if (line.length === 0) {
            result += calculate_value(grid, row_map);
            grid = [];
            row_map.clear();
        }
        else {
            grid.push(line);
            if (!row_map.has(line)) {
                row_map.set(line, new Set());
            }
            row_map.get(line)!.add(grid.length - 1);
        }
    });

    await u.closeLineReader();
    result += calculate_value(grid, row_map);
    return result;
}

const almost_cache: Map<string, string[]> = new Map();

function get_almost_strings(value: string): string[] {
    if (almost_cache.has(value)) {
        return almost_cache.get(value)!;
    }
    const result: string[] = [];
    for (let i = 0; i < value.length; i++) {
        const newChar = value.at(i) === "#" ? "." : "#";
        result.push(value.slice(0, i) + newChar + value.slice(i+1));
    }
    almost_cache.set(value, result);
    return result;
}

async function solution_part2() {
    const lr = u.getLineReader();
    let result = 0;
    let grid: string[] = [];
    const row_map: Map<string, Set<number>> = new Map();
    const row_almost_map: Map<string, Set<number>> = new Map();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    lr.on('line', line => {
        if (line.length === 0) {
            const val = calculate_value(grid, row_map, true, row_almost_map);
            result += val;
            grid = [];
            row_map.clear();
            row_almost_map.clear();
        }
        else {
            grid.push(line);
            if (!row_map.has(line)) {
                row_map.set(line, new Set());
                row_almost_map.set(line, new Set());
            }
            row_map.get(line)!.add(grid.length - 1);
            const almost_strings = get_almost_strings(line);
            for (const as of almost_strings) {
                if (row_almost_map.has(as)) {
                    row_almost_map.get(as)!.add(grid.length - 1);
                    for (const ind of row_map.get(as)!) {
                        row_almost_map.get(line)!.add(ind);
                    }
                }
            }
        }
    });

    await u.closeLineReader();
    result += calculate_value(grid, row_map, true, row_almost_map);
    return result;
}

let start_time = new Date().getTime();
solution_part1().then(result => console.log(`Part 1 solution: ${result} in ${new Date().getTime() - start_time} ms`));
solution_part2().then(result => console.log(`Part 2 solution: ${result} in ${new Date().getTime() - start_time} ms`));
