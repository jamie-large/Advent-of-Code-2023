import Utils from "./utils";
import path from "path";

const debug = true;
const fname = debug ? "inputs/test.txt" : "inputs/" + path.basename(__filename).slice(0, -2) + "txt";
const u = new Utils(debug, fname);

type Point = [number, number];

async function solution_part1() {
    const lr = u.getLineReader();
    let [min_x, min_y, max_x, max_y] = [0, 0, 0, 0];
    // x, y
    const location: Point = [0, 0];
    const grid: Map<string, string> = new Map();
    lr.on('line', line => {
        const [dir, s, color] = line.split(/\s+/);
        const steps = parseInt(s);
        switch (dir) {
            case "R": {
                for (let i = 1; i <= steps; i++) {
                    grid.set([location[0] + i, location[1]].toString(), color);
                }
                location[0] += steps;
                max_x = Math.max(location[0], max_x);
                break;
            }
            case "L": {
                for (let i = 1; i <= steps; i++) {
                    grid.set([location[0] - i, location[1]].toString(), color);
                }
                location[0] -= steps;
                min_x = Math.min(location[0], min_x);
                break;
            }
            case "U": {
                for (let i = 1; i <= steps; i++) {
                    grid.set([location[0], location[1] + i].toString(), color);
                }
                location[1] += steps;
                max_y = Math.max(location[1], max_y);
                break;
            }
            case "D": {
                for (let i = 1; i <= steps; i++) {
                    grid.set([location[0], location[1] - i].toString(), color);
                }
                location[1] -= steps;
                min_y = Math.min(location[1], min_y);
                break;
            }
        }
    });

    await u.closeLineReader();

    const inside_tiles: Set<string> = new Set();
    const outside_tiles: Set<string> = new Set();

    for (let i = min_x; i <= max_x; i++) {
        for (let j = min_y; j <= max_y; j++) {
            const hash = [i, j].toString();
            if (grid.has(hash) || outside_tiles.has(hash) || inside_tiles.has(hash)) {
                continue;
            }
            const stack: Point[] = [[i, j]];
            const visited: Set<string> = new Set([hash]);
            let outside = false;
            while (stack.length > 0) {
                const [x, y] = stack.pop()!;
                for (const n of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]] as Point[]) {
                    const n_hash = n.toString();
                    if (grid.has(n_hash) || visited.has(n_hash)) {
                        continue;
                    }
                    if (n[0] < min_x || n[0] > max_x || n[1] < min_y || n[1] > max_y) {
                        outside = true;
                        continue;
                    }
                    visited.add(n_hash);
                    stack.push(n);
                }
            }
            const add_to = outside ? outside_tiles : inside_tiles;
            for (const t of visited) {
                add_to.add(t);
            }
        }
    }

    for (let i = max_y; i >= min_y; i--) {
        const row: string[] = [];
        for (let j = min_x; j <= max_x; j++) {
            const hash = [j, i].toString();
            row.push(grid.has(hash) ? "#" : inside_tiles.has(hash) ? "O" : ".");
        }
        u.log(row.join(""));
    }

    return inside_tiles.size + grid.size;
}

async function solution_part2() {
    const lr = u.getLineReader();
    let [min_x, min_y, max_x, max_y] = [0, 0, 0, 0];
    // x, y
    type Line = [Point, Point];
    const DIRECTIONS = ["R", "D", "L", "U"];
    let location: Point = [0, 0];
    const horizontal_lines: Map<number, Line[]> = new Map();
    const vertical_lines: Map<number, Line[]> = new Map();

    lr.on('line', line => {
        const spl = line.split(/\s+/);
        const color = spl[2];
        const steps = parseInt(color.slice(2, 7), 16);
        const dir = DIRECTIONS[parseInt(color.at(7)!)];
        switch (dir) {
            case "R": {
                if (!horizontal_lines.has(location[1])) {
                    horizontal_lines.set(location[1], []);
                }
                horizontal_lines.get(location[1])?.push([[...location], [location[0] + steps, location[1]]]);
                location[0] += steps;
                max_x = Math.max(location[0], max_x);
                break;
            }
            case "L": {
                if (!horizontal_lines.has(location[1])) {
                    horizontal_lines.set(location[1], []);
                }
                horizontal_lines.get(location[1])?.push([[location[0] - steps, location[1]], [...location]]);
                location[0] -= steps;
                min_x = Math.min(location[0], min_x);
                break;
            }
            case "U": {
                if (!vertical_lines.has(location[0])) {
                    vertical_lines.set(location[0], []);
                }
                vertical_lines.get(location[0])?.push([[...location], [location[0], location[1] + steps]]);
                location[1] += steps;
                max_y = Math.max(location[1], max_y);
                break;
            }
            case "D": {
                if (!vertical_lines.has(location[0])) {
                    vertical_lines.set(location[0], []);
                }
                vertical_lines.get(location[0])?.push([[location[0], location[1] - steps], [...location]]);
                location[1] -= steps;
                min_y = Math.min(location[1], min_y);
                break;
            }
        }
    });

    await u.closeLineReader();

    for (const k of vertical_lines.keys()) {
        vertical_lines.get(k)?.sort((a, b) => a[0][1] - b[0][1]);
    }

    for (const k of horizontal_lines.keys()) {
        horizontal_lines.get(k)?.sort((a, b) => a[0][0] - b[0][0]);
    }

    const outside_area = 0;

    location = [min_x, min_y];
    while (location[0] < max_x) {
        continue;
    }

    return (max_x - min_x) * (max_y - min_y) - outside_area;
}

solution_part1().then(result => console.log("Part 1 solution:", result));
solution_part2().then(result => console.log("Part 2 solution:", result));
