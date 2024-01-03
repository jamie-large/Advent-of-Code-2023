import Utils from "./utils";
import path from "path";

const debug = false;
const fname = debug ? "inputs/test.txt" : "inputs/" + path.basename(__filename).slice(0, -2) + "txt";
const u = new Utils(debug, fname);

type DIR = "U" | "R" | "L" | "D";

const TRANSITION_MAP = new Map<string, Map<DIR, DIR>>([
    ["|", new Map([["U", "U"], ["D", "D"]])],
    ["-", new Map([["L", "L"], ["R", "R"]])],
    ["L", new Map([["D", "R"], ["L", "U"]])],
    ["J", new Map([["D", "L"], ["R", "U"]])],
    ["7", new Map([["U", "L"], ["R", "D"]])],
    ["F", new Map([["U", "R"], ["L", "D"]])],
    [".", new Map()]
]);

async function solution_part1() {
    const lr = u.getLineReader();
    const grid: string[] = [];
    let start: [number, number] = [0, 0];
    lr.on('line', line => {
        const s = line.search("S");
        if (s >= 0) {
            start = [grid.length, s];
        }
        grid.push(line);
    });
    await u.closeLineReader();

    // [r, c], dir, start_dir
    const possible_starts: [[number, number], DIR][] = [];
    // figure out starting locations
    if (start[0] > 0 && ["|", "F", "7"].includes(grid[start[0] - 1][start[1]])) {
        possible_starts.push([[start[0] - 1, start[1]], "U"]);
    }
    if (start[0] < grid.length - 1 && ["|", "L", "J"].includes(grid[start[0] + 1][start[1]])) {
        possible_starts.push([[start[0] + 1, start[1]], "D"]);
    }
    if (start[1] > 0 && ["-", "F", "L"].includes(grid[start[0]][start[1] - 1])) {
        possible_starts.push([[start[0], start[1] - 1], "L"]);
    }
    if (start[1] < grid[start[0]].length - 1 && ["-", "7", "J"].includes(grid[start[0]][start[1] + 1])) {
        possible_starts.push([[start[0], start[1] + 1], "R"]);
    }

    let [[r, c], dir] = possible_starts.pop()!;
    let distance = 0;
    while (r === -2 || grid[r][c] !== "S") {
        if (r === -2 || r < 0 || r >= grid.length || c < 0 || c >= grid[r].length) {
            r = -2;
        }
        if (r === -2) {
            distance = 0;
            [[r, c], dir] = possible_starts.pop()!;
        }
        const transition = TRANSITION_MAP.get(grid[r][c])!;
        if (!transition.has(dir)) {
            r = -2;
            continue;
        }
        dir = transition.get(dir)!;
        switch (dir) {
            case "U":
                r--;
                break;
            case "D":
                r++;
                break;
            case "L":
                c--;
                break;
            case "R":
                c++;
                break;
        }
        distance++;
    }

    return (distance + 1) / 2;
}

async function solution_part2() {
    const lr = u.getLineReader();
    const grid: string[] = [];
    let start: [number, number] = [0, 0];
    lr.on('line', line => {
        const s = line.search("S");
        if (s >= 0) {
            start = [grid.length, s];
        }
        grid.push(line);
    });
    await u.closeLineReader();

    // [r, c], dir, start_dir
    const possible_starts: [[number, number], DIR, DIR][] = [];
    // figure out starting locations
    if (start[0] > 0 && ["|", "F", "7"].includes(grid[start[0] - 1][start[1]])) {
        possible_starts.push([[start[0] - 1, start[1]], "U", "U"]);
    }
    if (start[0] < grid.length - 1 && ["|", "L", "J"].includes(grid[start[0] + 1][start[1]])) {
        possible_starts.push([[start[0] + 1, start[1]], "D", "D"]);
    }
    if (start[1] > 0 && ["-", "F", "L"].includes(grid[start[0]][start[1] - 1])) {
        possible_starts.push([[start[0], start[1] - 1], "L", "L"]);
    }
    if (start[1] < grid[start[0]].length - 1 && ["-", "7", "J"].includes(grid[start[0]][start[1] + 1])) {
        possible_starts.push([[start[0], start[1] + 1], "R", "R"]);
    }

    let [[r, c], dir, start_dir] = possible_starts.pop()!;
    const loop_tiles: Set<string> = new Set([start.toString()]);
    while (r === -2 || grid[r][c] !== "S") {
        if (r === -2 || r < 0 || r >= grid.length || c < 0 || c >= grid[r].length) {
            r = -2;
        }
        if (r === -2) {
            loop_tiles.clear();
            loop_tiles.add(start.toString());
            [[r, c], dir, start_dir] = possible_starts.pop()!;
        }
        loop_tiles.add([r, c].toString());
        const transition = TRANSITION_MAP.get(grid[r][c])!;
        if (!transition.has(dir)) {
            r = -2;
            continue;
        }
        dir = transition.get(dir)!;
        switch (dir) {
            case "U":
                r--;
                break;
            case "D":
                r++;
                break;
            case "L":
                c--;
                break;
            case "R":
                c++;
                break;
        }
    }
    const new_char = ((dir === "U" && start_dir === "U") || (dir === "D" && start_dir === "D")) ? "|" :
                     ((dir === "L" && start_dir === "L") || (dir === "R" && start_dir === "R")) ? "-" :
                     ((dir === "L" && start_dir === "U") || (dir === "D" && start_dir === "R")) ? "L" :
                     ((dir === "R" && start_dir === "U") || (dir === "D" && start_dir === "L")) ? "J" :
                     ((dir === "R" && start_dir === "D") || (dir === "U" && start_dir === "L")) ? "7" : "F";
    grid[start[0]] = grid[start[0]].replace("S", new_char);

    const outside_tiles: Set<string> = new Set();

    const queue: [number, number][] = [];
    const seen: Set<string> = new Set();
    for (let i = 0; i <= grid.length - 1; i += 0.5) {
        queue.push([i, 0]);
        seen.add([i, 0].toString());
        queue.push([i, grid[0].length - 1]);
        seen.add([i, grid[0].length - 1].toString());
    }
    for (let j = 0.5; j < grid[0].length - 1; j += 0.5) {
        queue.push([0, j]);
        seen.add([0, j].toString());
        queue.push([grid.length - 1, j]);
        seen.add([grid.length - 1, j].toString());
    }

    while (queue.length > 0) {
        const [r, c] = queue.pop()!;
        const rcstring = [r, c].toString();

        if (loop_tiles.has(rcstring)) {
            continue;
        }

        const on_horizontal = (r * 2) % 2 === 0;
        const on_vertical = (c * 2) % 2 === 0;
        if (on_horizontal && on_vertical) {
            outside_tiles.add(rcstring);
        }
        else if (on_horizontal && is_horizontal_line(grid[r][c - 0.5], grid[r][c + 0.5])) {
            continue;
        }
        else if (on_vertical && is_vertical_line(grid[r - 0.5][c], grid[r + 0.5][c])) {
            continue;
        }

        const neighbors: [number, number][] = [[r + 0.5, c], [r - 0.5, c], [r, c + 0.5], [r, c - 0.5]];
        for (const n of neighbors) {
            if (n[0] < 0 || n[0] > grid.length - 1 || n[1] < 0 || n[1] > grid[0].length - 1) {
                continue;
            }
            const nstr = n.toString();
            if (seen.has(nstr) || loop_tiles.has(nstr)) {
                continue;
            }
            seen.add(nstr);
            queue.push(n);
        }

    }

    for (let i = 0; i < grid.length; i++) {
        let buf = "";
        for (let j = 0; j < grid[i].length; j++) {
            const ijstr = [i, j].toString();
            buf += outside_tiles.has(ijstr) ? "O" : loop_tiles.has(ijstr) ? grid[i][j] : "I";
        }
        u.log(buf);
    }

    return (grid.length * grid[0].length) - loop_tiles.size - outside_tiles.size;
}

function is_horizontal_line(left: string, right: string) {
    return ["-", "L", "F"].includes(left) && ["-", "J", "7"].includes(right);
}

function is_vertical_line(top: string, bottom: string) {
    return ["|", "F", "7"].includes(top) && ["|", "L", "J"].includes(bottom);
}

solution_part1().then(result => console.log("Part 1 solution:", result));
solution_part2().then(result => console.log("Part 2 solution:", result));
