import Utils from "./utils";
import path from "path";

const debug = false;
const fname = debug ? "inputs/test.txt" : "inputs/" + path.basename(__filename).slice(0, -2) + "txt";
const u = new Utils(debug, fname);

async function solution_part1() {
    const lr = u.getLineReader();
    const grid: string[] = [];
    lr.on('line', line => {
        grid.push(line);
    });
    await u.closeLineReader();
    let result = 0;
    for (let c = 0; c < grid[0].length; c++) {
        let last_rock = -1;
        let count = 0;
        for (let r = 0; r < grid.length; r++) {
            switch (grid[r][c]) {
                case "#": {
                    result += (count / 2) * (grid.length * 2 - last_rock * 2 - count - 1);
                    last_rock = r;
                    count = 0;
                    break;
                }
                case "O": {
                    count++;
                    break;
                }
                default: {
                    break;
                }
            }
        }
        result += (count / 2) * (grid.length * 2 - last_rock * 2 - count - 1);
    }
    return result;
}

type DIR = "N" | "W" | "S" | "E";

function get_next_grid(grid: string[], direction: DIR): string[] {
    switch (direction) {
        case "N":
        case "S": {
            const csymbol = direction === "N" ? "O" : ".";
            const osymbol = direction === "N" ? "." : "O";
            const new_grid: string[][] = [];
            for (let i = 0; i < grid.length; i++) {
                new_grid.push([]);
            }
            for (let c = 0; c < grid[0].length; c++) {
                let current = 0;
                let count = 0;
                for (let r = 0; r < grid.length; r++) {
                    switch (grid[r][c]) {
                        case "#": {
                            for (let i = 0; i < count; i++) {
                                new_grid[current].push(csymbol);
                                current++;
                            }
                            while (current <= r - 1) {
                                new_grid[current].push(osymbol);
                                current++;
                            }
                            new_grid[current].push("#");
                            current++;
                            count = 0;
                            break;
                        }
                        case csymbol: {
                            count++;
                            break;
                        }
                    }
                }
                for (let i = 0; i < count; i++) {
                    new_grid[current].push(csymbol);
                    current++;
                }
                while (current <= grid.length - 1) {
                    new_grid[current].push(osymbol);
                    current++;
                }
            }
            return new_grid.map(x => x.join(""));
        }
        case "W":
        case "E": {
            const csymbol = direction === "E" ? "." : "O";
            const osymbol = direction === "E" ? "O" : ".";
            const new_grid: string[][] = [];
            for (let r = 0; r < grid.length; r++) {
                new_grid.push([]);
                let count = 0;
                for (let c = 0; c < grid[r].length; c++) {
                    switch (grid[r][c]) {
                        case "#": {
                            for (let i = 0; i < count; i++) {
                                new_grid.at(-1)!.push(csymbol);
                            }
                            while (new_grid.at(-1)!.length < c) {
                                new_grid.at(-1)!.push(osymbol);
                            }
                            new_grid.at(-1)!.push("#");
                            count = 0;
                            break;
                        }
                        case csymbol: {
                            count++;
                            break;
                        }
                    }
                }
                for (let i = 0; i < count; i++) {
                    new_grid.at(-1)!.push(csymbol);
                }
                while (new_grid.at(-1)!.length < grid[0].length) {
                    new_grid.at(-1)!.push(osymbol);
                }
            }
            return new_grid.map(x => x.join(""));
        }
    }
}

async function solution_part2() {
    const lr = u.getLineReader();
    let grid: string[] = [];
    lr.on('line', line => {
        grid.push(line);
    });
    await u.closeLineReader();



    const DIRECTIONS: DIR[] = ["N", "W", "S", "E"];
    // dir + grid -> index where seen
    const cache: Map<string, number> = new Map();

    const total_shifts = 1000000000 * 4;
    for (let i = 0; i < total_shifts; i++) {
        const current_dir = DIRECTIONS[i % 4];
        const hash = current_dir + grid.join("");
        if (cache.has(hash)) {
            const moves_left = total_shifts - i;
            const cycle_length = i - cache.get(hash)!;
            i += cycle_length * Math.floor(moves_left / cycle_length);
        }
        cache.set(hash, i);
        grid = get_next_grid(grid, current_dir);
    }
    let result = 0;
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === "O") {
                result += grid.length - i;
            }
        }
    }
    return result;
}

solution_part1().then(result => console.log("Part 1 solution:", result));
solution_part2().then(result => console.log("Part 2 solution:", result));
