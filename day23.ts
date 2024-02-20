import Utils from "./utils";
import path from "path";

const debug = false;
const fname = debug ? "inputs/test.txt" : "inputs/" + path.basename(__filename).slice(0, -2) + "txt";
const u = new Utils(debug, fname);

type Point = [number, number];

async function solution_part1() {
    const lr = u.getLineReader();
    const grid: string[] = [];
    lr.on('line', line => {
        grid.push(line);
    });
    await u.closeLineReader();

    const end: Point = [grid.length - 1, grid[grid.length - 1].indexOf(".")];

    const cache: Map<string, number> = new Map();
    function find_max_distance_to_end(start: Point) {
        if (cache.has(start.toString())) {
            return cache.get(start.toString())!;
        }

        const queue: [number, number, number][] = [[...start, 0]];
        const visited: Set<string> = new Set([start.toString()]);
        const possible_values: number[] = [];
        while (queue.length > 0) {
            const [r, c, steps] = queue.pop()!;
            const symbol = grid[r][c];

            if (r === end[0] && c === end[1]) {
                cache.set(start.toString(), steps);
                return steps;
            }

            const neighbors: Point[] =
                symbol === ">" ? [[r, c+1]] :
                symbol === "<" ? [[r, c-1]] :
                symbol === "^" ? [[r-1, c]] :
                symbol === "v" ? [[r+1, c]] :
                [[r, c+1], [r, c-1], [r-1, c], [r+1, c]];
            
            for (const n of neighbors) {
                if (n[0] >= 0 && n[0] < grid.length && n[1] >=0 && n[1] < grid[n[0]].length && grid[n[0]][n[1]] != "#") {
                    const n_symbol = grid[n[0]][n[1]];
                    if (
                        (n_symbol === ">" && n[1] === c + 1) ||
                        (n_symbol === "<" && n[1] === c - 1) ||
                        (n_symbol === "^" && n[0] === r - 1) ||
                        (n_symbol === "v" && n[0] === r + 1)) {
                        visited.add(n.toString());
                        possible_values.push(steps + 1 + find_max_distance_to_end(n));
                    }
                    else if (!visited.has(n.toString())) {
                        visited.add(n.toString());
                        queue.push([...n, steps+1]);
                    }
                }
            }
        }

        const result: number = Math.max(...possible_values);
        cache.set(start.toString(), result);
        return result;
    }

    return find_max_distance_to_end([0, grid[0].indexOf(".")]);
}

async function solution_part2() {
    const lr = u.getLineReader();
    const grid: string[] = [];
    lr.on('line', line => {
        grid.push(line);
    });
    await u.closeLineReader();

    const start: Point = [0, grid[0].indexOf(".")]
    const end: Point = [grid.length - 1, grid[grid.length - 1].indexOf(".")];

    // current point, previous intersection 
    const stack: [Point, number, Point][] = [[start, 0, start]];
    const visited: Set<string> = new Set([start.toString()]);

    // point -> [point, dist][]
    const points_map: Map<string, [Point, number][]> = new Map();
    points_map.set(start.toString(), []);

    while (stack.length > 0) {
        const [curr, steps, origin] = stack.pop()!;
        const [r, c] = curr;
        const curr_string = curr.toString();
        const origin_string = origin.toString();

        if (r === end[0] && c === end[1]) {
            if (!points_map.has(origin_string)) {
                points_map.set(origin_string, []);
            }
            points_map.get(origin_string)!.push([end, steps]);
            points_map.set(end.toString(), [[origin, steps]]);
            continue;
        }
        
        const neighbors: Point[] = [[r, c+1], [r, c-1], [r-1, c], [r+1, c]].filter(n => n[0] >= 0 && n[0] < grid.length && n[1] >=0 && n[1] < grid[n[0]].length && grid[n[0]][n[1]] != "#") as Point[];
        if (neighbors.length > 2) {
            if (!points_map.has(curr_string)) {
                points_map.set(curr_string, []);
            }
            if (!points_map.has(origin_string)) {
                points_map.set(origin_string, []);
            }
            points_map.get(curr_string)!.push([origin, steps]);
            points_map.get(origin_string)!.push([curr, steps]);
        }

        for (const n of neighbors) {
            const n_string = n.toString();
            if (visited.has(n_string)) {
                if (points_map.has(n_string) && (n[0] !== origin[0] || n[1] !== origin[1])) {
                    stack.push([n, steps + 1, origin]);
                }
            }
            else {
                stack.push([n, neighbors.length > 2 ? 1 : steps + 1, neighbors.length > 2 ? curr : origin]);
                if (neighbors.length <= 2) {
                    visited.add(n_string);
                }
            }
        }
    }



    let result = 0;
    // current, total steps, visited points
    const queue: [Point, number, Set<string>][] = [[start, 0, new Set()]];
    while (queue.length > 0) {
        const [curr, steps, curr_visited] = queue.pop()!;
        const curr_string = curr.toString();
        curr_visited.add(curr_string);

        const neighbors = points_map.get(curr_string)!.filter(n => !curr_visited.has(n[0].toString()));
        if (neighbors.length === 0) {
            continue;
        }

        const end_neighbors = neighbors.filter(n => n[0][0] === end[0] && n[0][1] === end[1]);
        if (end_neighbors.length > 0) {
            result = Math.max(result, steps + end_neighbors[0][1]);
            continue;
        }
        
        queue.push([neighbors[0][0], steps + neighbors[0][1], curr_visited]);
        for (let i = 1; i < neighbors.length; i++) {
            queue.push([neighbors[i][0], steps + neighbors[i][1], new Set(curr_visited)]);
        }
    }

    return result;
}

let start_time = new Date().getTime();
solution_part1().then(result => console.log(`Part 1 solution: ${result} in ${new Date().getTime() - start_time} ms`));
solution_part2().then(result => console.log(`Part 2 solution: ${result} in ${new Date().getTime() - start_time} ms`));
