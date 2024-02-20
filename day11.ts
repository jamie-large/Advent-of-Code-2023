import Utils from "./utils";
import path from "path";

const debug = false;
const fname = debug ? "inputs/test.txt" : "inputs/" + path.basename(__filename).slice(0, -2) + "txt";
const u = new Utils(debug, fname);

async function solution_part1() {
    const lr = u.getLineReader();
    const grid: string[] = [];
    let r = 0;
    const empty_cols: Set<number> = new Set();
    lr.on('line', line => {
        let found = false;
        for (let c = 0; c < line.length; c++) {
            if (r == 0) {
                empty_cols.add(c);
            }
            if (line[c] === "#") {
                found = true;
                empty_cols.delete(c);
            }
        }
        if (!found) {
            grid.push(line);
        }
        grid.push(line);
        r++;
    });

    await u.closeLineReader();

    const sorted_empty_cols = [...empty_cols].sort((a, b) => b - a);
    for (let r = 0; r < grid.length; r++) {
        for (const c of sorted_empty_cols) {
            grid[r] = grid[r].slice(0, c) + "." + grid[r].slice(c);
        }
    }
    for (const s of grid) {
        u.log(s);
    }

    const galaxies: [number, number][] = [];
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === "#") {
                galaxies.push([i, j]);
            }
        }
    }


    let result = 0;
    for (let i = 0; i < galaxies.length; i++) {
        for (let j = i+1; j < galaxies.length; j++) {
            u.log(`${i} and ${j} have distance of ${Math.abs(galaxies[i][0] - galaxies[j][0]) + Math.abs(galaxies[i][1] - galaxies[j][1])}`);
            result += Math.abs(galaxies[i][0] - galaxies[j][0]) + Math.abs(galaxies[i][1] - galaxies[j][1]);
        }
    }
    return result;
}

async function solution_part2() {
    const lr = u.getLineReader();
    let r = 0;
    const empty_rows: Set<number> = new Set();
    const empty_cols: Set<number> = new Set();

    const galaxies: [number, number][] = [];
    lr.on('line', line => {
        let found = false;
        for (let c = 0; c < line.length; c++) {
            if (r == 0) {
                empty_cols.add(c);
            }
            if (line[c] === "#") {
                galaxies.push([r, c]);
                found = true;
                empty_cols.delete(c);
            }
        }
        if (!found) {
            empty_rows.add(r);
        }
        r++;
    });

    await u.closeLineReader();

    const max_row = Math.max(...galaxies.map(x => x[0]));
    const max_col = Math.max(...galaxies.map(x => x[1]));

    const empty_rows_between: number[][] = [...Array(max_row + 1)].map(() => Array(max_row + 1));
    const empty_cols_between: number[][] = [...Array(max_col + 1)].map(() => Array(max_col + 1));

    for (let i = 0; i <= max_row; i++) {
        let count = empty_rows.has(i) ? 1 : 0;
        for (let j = i; j <= max_row + 1; j++) {
            if (empty_rows.has(j)) {
                count++;
            }
            empty_rows_between[i][j] = count;
        }
    }

    for (let i = 0; i <= max_col; i++) {
        let count = empty_cols.has(i) ? 1 : 0;
        for (let j = i; j <= max_col + 1; j++) {
            if (empty_cols.has(j)) {
                count++;
            }
            empty_cols_between[i][j] = count;
        }
    }

    const MULTIPLY_VALUE = 1000000;

    let result = 0;
    for (let i = 0; i < galaxies.length; i++) {
        for (let j = i+1; j < galaxies.length; j++) {
            const smaller_row = Math.min(galaxies[i][0], galaxies[j][0]);
            const bigger_row = Math.max(galaxies[i][0], galaxies[j][0]);
            const smaller_col = Math.min(galaxies[i][1], galaxies[j][1]);
            const bigger_col = Math.max(galaxies[i][1], galaxies[j][1]);
            const er = empty_rows_between[smaller_row][bigger_row];
            const ec = empty_cols_between[smaller_col][bigger_col];
            result += (bigger_row - smaller_row) + (bigger_col - smaller_col) + (MULTIPLY_VALUE - 1) * (er + ec);
        }
    }
    return result;
}

let start_time = new Date().getTime();
solution_part1().then(result => console.log(`Part 1 solution: ${result} in ${new Date().getTime() - start_time} ms`));
solution_part2().then(result => console.log(`Part 2 solution: ${result} in ${new Date().getTime() - start_time} ms`));
