import Utils from "./utils";
import path from "path";
import { Heap } from "heap-js";

const debug = false;
const fname = debug ? "inputs/test.txt" : "inputs/" + path.basename(__filename).slice(0, -2) + "txt";
const u = new Utils(debug, fname);

type DIR = "U" | "D" | "L" | "R";

async function solution_part1() {
    const lr = u.getLineReader();

    const grid: number[][] = [];
    lr.on('line', line => {
        grid.push(line.split("").map(x => parseInt(x)));
    });
    await u.closeLineReader();

    // r, c, direction, steps in a line, total
    type Node = [number, number, DIR, number, number];
    const heap: Heap<Node> = new Heap((a, b) => a[4] - b[4]);
    heap.add([1, 0, "D", 1, 0]);
    heap.add([0, 1, "R", 1, 0]);

    const visited: Map<string, number> = new Map();
    visited.set([1, 0, "D", 1, 0].toString(), 0);
    visited.set([0, 1, "R", 1, 0].toString(), 0);

    while (heap.size() > 0) {
        const [r, c, dir, line_steps, total_loss] = heap.pop()!;
        if (r === grid.length - 1 && c === grid.at(-1)!.length - 1) {
            return total_loss + grid[r][c];
        }

        const new_total_loss = total_loss + grid[r][c];

        // add right
        let hash = [r, c + 1, "R", dir === "R" ? line_steps + 1 : 1].toString();
        if (c < grid[r].length - 1 && dir !== "L" && (dir !== "R" || (dir === "R" && line_steps <= 2)) && (visited.get(hash) ?? Infinity) > new_total_loss) {
            heap.add([r, c + 1, "R", dir === "R" ? line_steps + 1 : 1, new_total_loss]);
            visited.set(hash.toString(), new_total_loss);
        }
        // add left
        hash = [r, c - 1, "L", dir === "L" ? line_steps + 1 : 1].toString();
        if (c > 0 && dir !== "R" && (dir !== "L" || (dir === "L" && line_steps <= 2)) && (visited.get(hash) ?? Infinity) > new_total_loss) {
            heap.add([r, c - 1, "L", dir === "L" ? line_steps + 1 : 1, new_total_loss]);
            visited.set(hash, new_total_loss);
        }
        // add down
        hash = [r + 1, c, "D", dir === "D" ? line_steps + 1 : 1].toString();
        if (r < grid.length - 1 && dir !== "U" && (dir !== "D" || (dir === "D" && line_steps <= 2)) && (visited.get(hash) ?? Infinity) > new_total_loss) {
            heap.add([r + 1, c, "D", dir === "D" ? line_steps + 1 : 1, new_total_loss]);
            visited.set(hash, new_total_loss);
        }
        // add up
        hash = [r - 1, c, "U", dir === "U" ? line_steps + 1 : 1].toString();
        if (r > 0 && dir !== "D" && (dir !== "U" || (dir === "U" && line_steps <= 2)) && (visited.get(hash) ?? Infinity) > new_total_loss) {
            heap.add([r - 1, c, "U", dir === "U" ? line_steps + 1 : 1, new_total_loss]);
            visited.set(hash, new_total_loss);
        }
    }
}

async function solution_part2() {
    const lr = u.getLineReader();

    const grid: number[][] = [];
    lr.on('line', line => {
        grid.push(line.split("").map(x => parseInt(x)));
    });
    await u.closeLineReader();

    // r, c, direction, steps in a line, total
    type Node = [number, number, DIR, number, number];
    const heap: Heap<Node> = new Heap((a, b) => a[4] - b[4]);
    heap.add([1, 0, "D", 1, 0]);
    heap.add([0, 1, "R", 1, 0]);

    const visited: Map<string, number> = new Map();
    visited.set([1, 0, "D", 1, 0].toString(), 0);
    visited.set([0, 1, "R", 1, 0].toString(), 0);

    while (heap.size() > 0) {
        const [r, c, dir, line_steps, total_loss] = heap.pop()!;
        if (r === grid.length - 1 && c === grid.at(-1)!.length - 1 && line_steps >= 4) {
            return total_loss + grid[r][c];
        }
        const new_total_loss = total_loss + grid[r][c];
        let hash = "";

        // if next step is determined already
        if (line_steps < 4) {
            switch (dir) {
                case "U": {
                    hash = [r - 1, c, "U", dir === "U" ? line_steps + 1 : 1].toString();
                    if (r > 0 && (visited.get(hash) ?? Infinity) > new_total_loss) {
                        heap.add([r - 1, c, "U", dir === "U" ? line_steps + 1 : 1, new_total_loss]);
                        visited.set(hash, new_total_loss);
                    }
                    break;
                }
                case "D": {
                    hash = [r + 1, c, "D", dir === "D" ? line_steps + 1 : 1].toString();
                    if (r < grid.length - 1 && (visited.get(hash) ?? Infinity) > new_total_loss) {
                        heap.add([r + 1, c, "D", dir === "D" ? line_steps + 1 : 1, new_total_loss]);
                        visited.set(hash, new_total_loss);
                    }
                    break;
                }
                case "L": {
                    hash = [r, c - 1, "L", dir === "L" ? line_steps + 1 : 1].toString();
                    if (c > 0 && (visited.get(hash) ?? Infinity) > new_total_loss) {
                        heap.add([r, c - 1, "L", dir === "L" ? line_steps + 1 : 1, new_total_loss]);
                        visited.set(hash, new_total_loss);
                    }
                    break;
                }
                case "R": {
                    hash = [r, c + 1, "R", dir === "R" ? line_steps + 1 : 1].toString();
                    if (c < grid[r].length - 1 && (visited.get(hash) ?? Infinity) > new_total_loss) {
                        heap.add([r, c + 1, "R", dir === "R" ? line_steps + 1 : 1, new_total_loss]);
                        visited.set(hash.toString(), new_total_loss);
                    }
                    break;
                }
            }
            continue;
        }

        // add right
        hash = [r, c + 1, "R", dir === "R" ? line_steps + 1 : 1].toString();
        if (c < grid[r].length - 1 && dir !== "L" && (dir !== "R" || (dir === "R" && line_steps <= 9)) && (visited.get(hash) ?? Infinity) > new_total_loss) {
            heap.add([r, c + 1, "R", dir === "R" ? line_steps + 1 : 1, new_total_loss]);
            visited.set(hash.toString(), new_total_loss);
        }
        // add left
        hash = [r, c - 1, "L", dir === "L" ? line_steps + 1 : 1].toString();
        if (c > 0 && dir !== "R" && (dir !== "L" || (dir === "L" && line_steps <= 9)) && (visited.get(hash) ?? Infinity) > new_total_loss) {
            heap.add([r, c - 1, "L", dir === "L" ? line_steps + 1 : 1, new_total_loss]);
            visited.set(hash, new_total_loss);
        }
        // add down
        hash = [r + 1, c, "D", dir === "D" ? line_steps + 1 : 1].toString();
        if (r < grid.length - 1 && dir !== "U" && (dir !== "D" || (dir === "D" && line_steps <= 9)) && (visited.get(hash) ?? Infinity) > new_total_loss) {
            heap.add([r + 1, c, "D", dir === "D" ? line_steps + 1 : 1, new_total_loss]);
            visited.set(hash, new_total_loss);
        }
        // add up
        hash = [r - 1, c, "U", dir === "U" ? line_steps + 1 : 1].toString();
        if (r > 0 && dir !== "D" && (dir !== "U" || (dir === "U" && line_steps <= 9)) && (visited.get(hash) ?? Infinity) > new_total_loss) {
            heap.add([r - 1, c, "U", dir === "U" ? line_steps + 1 : 1, new_total_loss]);
            visited.set(hash, new_total_loss);
        }
    }
}

let start_time = new Date().getTime();
solution_part1().then(result => console.log(`Part 1 solution: ${result} in ${new Date().getTime() - start_time} ms`));
solution_part2().then(result => console.log(`Part 2 solution: ${result} in ${new Date().getTime() - start_time} ms`));
