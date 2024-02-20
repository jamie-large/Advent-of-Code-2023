import Utils from "./utils";
import path, { parse } from "path";

const debug = false;
const fname = debug ? "inputs/test.txt" : "inputs/" + path.basename(__filename).slice(0, -2) + "txt";
const u = new Utils(debug, fname);

type Point = [number, number];
type Line = [Point, Point];

const DIRECTIONS = ["R", "D", "L", "U"];

function area_under_line(line: Line, horizontal_lines: Map<number, Line[]>, horizontal_lines_starts: number[]) {
    if (line[0][0] > line[1][0]) {
        return 0;
    }
    let result = 0;
    for (let i = 0; i < horizontal_lines_starts.length; i++) {
        const y = horizontal_lines_starts[i];
        if (line[0][1] <= y) {
            continue;
        }
        for (const l of horizontal_lines.get(y)!) {
            if (l[0][0] <= line[0][0] && l[1][0] >= line[1][0]) {
                return (line[1][0] - line[0][0] + 1) * (line[0][1] - l[0][1] - 1);
            }
            else if (l[0][0] >= line[0][0]) {
                if (l[0][0] > line[1][0]) {
                    break;
                }
                result += area_under_line([line[0], [l[0][0] - 1, line[1][1]]], horizontal_lines, horizontal_lines_starts.slice(i));
                if (l[1][0] < line[1][0]) {
                    result += area_under_line([[l[1][0] + 1, line[1][1]], line[1]], horizontal_lines, horizontal_lines_starts.slice(i));
                }
                result += (line[0][1] - l[0][1] - 1) * (Math.min(line[1][0], l[1][0]) - l[0][0] + 1)
                return result;
            }
            else if (l[1][0] >= line[0][0] && l[1][0] <= line[1][0]) {
                if (l[1][0] < line[1][0]) {
                    result += area_under_line([[l[1][0] + 1, line[0][1]], line[1]], horizontal_lines, horizontal_lines_starts.slice(i));
                }
                result += (line[0][1] - l[0][1] - 1) * (l[1][0] - line[0][0] + 1);
                return result;
            }
        }
    }
    return result;
}

function generic_solution(parsefunc: (line: string) => [string, number]) {
    return async () => {
        const lr = u.getLineReader();
        // x, y
        let location: Point = [0, 0];
        const horizontal_lines: Map<number, Line[]> = new Map();
        const instructions: [string, number][] = [];

        lr.on('line', line => {
            const [dir, steps] = parsefunc(line);
            instructions.push([dir, steps]);
            switch (dir) {
                case "R": {
                    if (!horizontal_lines.has(location[1])) {
                        horizontal_lines.set(location[1], []);
                    }
                    horizontal_lines.get(location[1])?.push([[...location], [location[0] + steps, location[1]]]);
                    location[0] += steps;
                    break;
                }
                case "L": {
                    if (!horizontal_lines.has(location[1])) {
                        horizontal_lines.set(location[1], []);
                    }
                    horizontal_lines.get(location[1])?.push([[location[0] - steps, location[1]], [...location]]);
                    location[0] -= steps;
                    break;
                }
                case "U": {
                    location[1] += steps;
                    break;
                }
                case "D": {
                    location[1] -= steps;
                    break;
                }
            }
        });

        await u.closeLineReader();

        for (const k of horizontal_lines.keys()) {
            horizontal_lines.get(k)?.sort((a, b) => a[0][0] - b[0][0]);
        }

        const horizontal_lines_starts = [...horizontal_lines.keys()];
        horizontal_lines_starts.sort((a, b) => b - a);

        location = [0, 0]
        let result = 0;
        for (let i = 0; i < instructions.length; i++) {
            const [dir, steps] = instructions[i];
            switch (dir) {
                case "R": {
                    const l: Line = [[...location], [location[0] + steps, location[1]]];
                    if (instructions.at(i - 1)![0] === "U") {
                        l[0][0] += 1;
                    }
                    if (instructions[(i + 1) % instructions.length][0] === "D") {
                        l[1][0] -= 1;
                    }
                    result += area_under_line(l, horizontal_lines, horizontal_lines_starts);
                    location[0] += steps;
                    break;
                }
                case "L": {
                    location[0] -= steps;
                    break;
                }
                case "U": {
                    location[1] += steps;
                    break;
                }
                case "D": {
                    location[1] -= steps;
                    break;
                }
            }
            result += steps;
        }
        
        return result;
    }
}

const solution_part1 = generic_solution(line => {
    const [dir, s, color] = line.split(/\s+/);
    return [dir, parseInt(s)];
});
const solution_part2 = generic_solution(line => {
    const color = line.split(/\s+/)[2];
    const steps = parseInt(color.slice(2, 7), 16);
    const dir = DIRECTIONS[parseInt(color.at(7)!)];
    return [dir, steps];
});

let start_time = new Date().getTime();
solution_part1().then(result => console.log(`Part 1 solution: ${result} in ${new Date().getTime() - start_time} ms`));
solution_part2().then(result => console.log(`Part 2 solution: ${result} in ${new Date().getTime() - start_time} ms`));
