import Utils from "./utils";
import path from "path";

const debug = false;
const fname = debug ? "inputs/test.txt" : "inputs/" + path.basename(__filename).slice(0, -2) + "txt";
const u = new Utils(debug, fname);

type DIR = "U" | "D" | "L" | "R";

function get_next(r: number, c: number, dir: DIR, ch: string) {
    const next: [number, number, DIR][] = [];
        switch (ch) {
            case ".": {
                switch (dir) {
                    case "U":
                        next.push([r - 1, c, "U"]);
                        break;
                    case "D":
                        next.push([r + 1, c, "D"]);
                        break;
                    case "L":
                        next.push([r, c - 1, "L"]);
                        break;
                    case "R":
                        next.push([r, c + 1, "R"]);
                }
                break;
            }
            case "|" : {
                switch (dir) {
                    case "U":
                        next.push([r - 1, c, "U"]);
                        break;
                    case "D":
                        next.push([r + 1, c, "D"]);
                        break;
                    case "L":
                    case "R":
                        next.push([r - 1, c, "U"]);
                        next.push([r + 1, c, "D"]);
                }
                break;
            }
            case "-": {
                switch (dir) {
                    case "U":
                    case "D":
                        next.push([r, c - 1, "L"]);
                        next.push([r, c + 1, "R"]);
                        break;
                    case "L":
                        next.push([r, c - 1, "L"]);
                        break;
                    case "R":
                        next.push([r, c + 1, "R"]);
                        break;
                }
                break;
            }
            case "/": {
                switch (dir) {
                    case "U":
                        next.push([r, c + 1, "R"]);
                        break;
                    case "D":
                        next.push([r, c - 1, "L"]);
                        break;
                    case "L":
                        next.push([r + 1, c, "D"]);
                        break;
                    case "R":
                        next.push([r - 1, c, "U"]);

                }
                break;
            }
            case "\\": {
                switch (dir) {
                    case "U":
                        next.push([r, c - 1, "L"]);
                        break;
                    case "D":
                        next.push([r, c + 1, "R"]);
                        break;
                    case "L":
                        next.push([r - 1, c, "U"]);
                        break;
                    case "R":
                        next.push([r + 1, c, "D"]);

                }
                break;
            }
        }
        return next;
}

async function solution_part1() {
    const lr = u.getLineReader();
    const grid: string[] = [];
    lr.on('line', line => {
        grid.push(line);
    });

    await u.closeLineReader();

    calculate_tiles_seen(0, 0, "R", grid);
    const undirected_tiles: Set<string> = new Set();
    for (const s of cache.get([0, 0, "R"].toString())!) {
        undirected_tiles.add(s.split(",").slice(0, 2).join(","));
    }
    return undirected_tiles.size;
}

const cache: Map<string, Set<string>> = new Map();

function calculate_tiles_seen(r: number, c: number, dir: DIR, grid: string[]) {
    const hash = [r, c, dir].toString();
    if (cache.has(hash)) {
        return;
    }
    const stack: [number, number, DIR][] = [[r, c, dir]];
    const visited_dir: Set<string> = new Set();
    visited_dir.add(stack[0].toString());

    while (stack.length > 0) {
        const [r, c, dir] = stack.pop()!;
        const next = get_next(r, c, dir, grid[r][c]);
        for (const n of next) {
            if (n[0] < 0 || n[0] >= grid.length || n[1] < 0 || n[1] >= grid[r].length) {
                continue;
            }
            const hash = n.toString();
            if (!visited_dir.has(hash)) {
                if (cache.has(hash)) {
                    const n_visited = cache.get(hash)!;
                    for (const nvd of n_visited) {
                        visited_dir.add(nvd);
                    }
                }
                else {
                    visited_dir.add(hash);
                    stack.push(n);
                }
            }
        }
    }

    cache.set(hash, visited_dir);
}

async function solution_part2() {
    const lr = u.getLineReader();
    const grid: string[] = [];
    lr.on('line', line => {
        grid.push(line);
    });

    await u.closeLineReader();

    const starting_points: [number, number, DIR][] = [];

    for (let i = 0; i < grid.length; i++) {
        starting_points.push([i, 0, "R"]);
        starting_points.push([i, grid[i].length - 1, "L"]);
    }
    for (let j = 0; j < grid[0].length; j++) {
        starting_points.push([0, j, "D"]);
        starting_points.push([grid.length - 1, j, "U"]);
    }

    for (const sp of starting_points) {
        const stack: [number, number, DIR][] = [sp];
        const visited_dir: Set<string> = new Set();
        visited_dir.add(stack[0].toString());

        while (stack.length > 0) {
            const [r, c, dir] = stack.pop()!;
            const next = get_next(r, c, dir, grid[r][c]);
            const to_push: [number, number, DIR][] = [];
            for (const n of next) {
                if (n[0] < 0 || n[0] >= grid.length || n[1] < 0 || n[1] >= grid[r].length) {
                    continue;
                }
                const hash = n.toString();
                if (!visited_dir.has(hash)) {
                    if (cache.has(hash)) {
                        const n_visited = cache.get(hash)!;
                        for (const nvd of n_visited) {
                            visited_dir.add(nvd);
                        }
                    }
                    else {
                        visited_dir.add(hash);
                        to_push.push(n);
                    }
                }
            }
            if (to_push.length > 0) {
                stack.push([r, c, dir]);
                for (const x of to_push) {
                    stack.push(x);
                }
            }
            else {
                calculate_tiles_seen(r, c, dir, grid);
            }
        }
    }

    let max_seen = 0;
    for (const sp of starting_points) {
        const undirected_tiles: Set<string> = new Set();
        for (const s of cache.get([sp[0], sp[1], sp[2]].toString())!) {
            undirected_tiles.add(s.split(",").slice(0, 2).join(","));
        }
        if (undirected_tiles.size > max_seen) {
            max_seen = undirected_tiles.size;
        }
    }

    return max_seen;
}

solution_part1().then(result => console.log("Part 1 solution:", result));
solution_part2().then(result => console.log("Part 2 solution:", result));
