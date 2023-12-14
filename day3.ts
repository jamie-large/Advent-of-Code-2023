import Utils from "./utils";
import path from "path";

const debug = false;
const fname = debug ? "inputs/test.txt" : "inputs/" + path.basename(__filename).slice(0, -2) + "txt";
const u = new Utils(debug, fname);

function isSymbol(s: string) {
    return s && s !== "." && isNaN(Number(s));
}

async function solution_part1() {
    const lr = u.getLineReader();
    const lines: string[] = [];
    lr.on('line', line => {
        lines.push(line);
    });
    await u.closeLineReader();

    let result = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let current_number = 0;
        let should_be_added = false;
        for (let j = 0; j < line.length; j++) {
            const num = Number(line.at(j));
            if (!isNaN(num)) {
                current_number = current_number * 10 + num;
                if (!should_be_added) {
                    const neighbors = [[i-1, j-1], [i-1, j], [i-1, j+1], [i, j-1], [i, j+1], [i+1, j-1], [i+1, j], [i+1, j+1]].filter(value => value[0] >= 0 && value[0] <= lines.length - 1 && value[1] >= 0 && value[1] <= line.length - 1);
                    for (const n of neighbors) {
                        if (isSymbol(lines[n[0]].at(n[1]))) {
                            should_be_added = true;
                            break;
                        }
                    }
                }
            }
            else {
                if (should_be_added) {
                    result += current_number;
                }
                current_number = 0;
                should_be_added = false;
            }
        }
        if (should_be_added) {
            result += current_number;
        }
    }
    return result;
}

async function solution_part2() {
    const lr = u.getLineReader();
    const lines: string[] = [];
    lr.on('line', line => {
        lines.push(line);
    });
    await u.closeLineReader();

    const gear_locations = new Map<string, number[]>();

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let current_number = 0;
        const gear_targets = new Set<string>();
        for (let j = 0; j < line.length; j++) {
            const num = Number(line.at(j));
            if (!isNaN(num)) {
                current_number = current_number * 10 + num;

                const neighbors = [[i-1, j-1], [i-1, j], [i-1, j+1], [i, j-1], [i, j+1], [i+1, j-1], [i+1, j], [i+1, j+1]].filter(value => value[0] >= 0 && value[0] <= lines.length - 1 && value[1] >= 0 && value[1] <= line.length - 1);
                for (const n of neighbors) {
                    if (lines[n[0]].at(n[1]) === "*") {
                        gear_targets.add(n.toString());
                    }
                }
            }
            else {
                for (const g of gear_targets) {
                    if (!gear_locations.has(g)) {
                        gear_locations.set(g, []);
                    }
                    gear_locations.get(g).push(current_number);
                }
                current_number = 0;
                gear_targets.clear();
            }
        }

        for (const g of gear_targets) {
            if (!gear_locations.has(g)) {
                gear_locations.set(g, []);
            }
            gear_locations.get(g).push(current_number);
        }
    }

    let result = 0;
    for (const nums of gear_locations.values()) {
        if (nums.length == 2) {
            result += nums[0] * nums[1];
        }
    }
    return result;
}

solution_part1().then(result => console.log("Part 1 solution:", result));
solution_part2().then(result => console.log("Part 2 solution:", result));
