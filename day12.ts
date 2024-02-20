import Utils from "./utils";
import path from "path";

const debug = false;
const fname = debug ? "inputs/test.txt" : "inputs/" + path.basename(__filename).slice(0, -2) + "txt";
const u = new Utils(debug, fname);

const cache: Map<string, number> = new Map();

function recursive_solver(prev_count: number, str: string, nums: number[]): number {
    const cachestr = prev_count.toString() + str + nums.toString();
    let res = 0;
    if (cache.has(cachestr)) {
        return cache.get(cachestr)!;
    }
    else if (nums.length === 1 && prev_count === nums[0] && !str.includes("#")) {
        res = 1;
    }
    else if (prev_count > nums[0]) {
        res = 0;
    }
    else if (str.at(0) === ".") {
        if (prev_count > 0 && prev_count !== nums[0]) {
            res = 0;
        }
        else {
            let i = 1;
            while (i < str.length) {
                if (str.at(i) !== ".") {
                    break;
                }
                i++;
            }
            res = recursive_solver(0, str.slice(i), prev_count > 0 ? nums.slice(1) : nums);
        }
    }
    else if (str.at(0) === "#") {
        let i = 1;
        while (i < str.length) {
            if (str.at(i) !== "#") {
                break;
            }
            i++;
        }
        res = recursive_solver(prev_count + i, str.slice(i), nums);
    }
    else if (str.at(0) === "?") {
        // try front being "#"
        if (prev_count < nums[0]) {
            let i = 1;
            while (i < str.length) {
                if (str.at(i) !== "#") {
                    break;
                }
                i++;
            }
            res += recursive_solver(prev_count + i, str.slice(i), nums);
        }

        // try front being "."
        if (prev_count == 0 || prev_count === nums[0]) {
            let i = 1;
            while (i < str.length) {
                if (str.at(i) !== ".") {
                    break;
                }
                i++;
            }
            res += recursive_solver(0, str.slice(i), prev_count > 0 ? nums.slice(1) : nums);
        }
    }
    cache.set(cachestr, res);
    return res;
}


async function solution_part1() {
    const lr = u.getLineReader();

    let result = 0;
    lr.on('line', line => {
        const [line_str, nums_str] = line.split(/\s+/);
        const line_nums = nums_str.split(",").map(x => parseInt(x));

        result += recursive_solver(0, line_str, line_nums);
    });

    await u.closeLineReader();
    return result;
}

async function solution_part2() {
    const lr = u.getLineReader();

    let result = 0;


    lr.on('line', line => {
        const [line_str, nums_str] = line.split(/\s+/);
        let full_line_str = line_str;
        let full_nums_str = nums_str;
        for (let i = 0; i < 4; i++) {
            full_line_str += "?" + line_str;
            full_nums_str += "," + nums_str;
        }
        const line_nums = full_nums_str.split(",").map(x => parseInt(x));

        result += recursive_solver(0, full_line_str, line_nums);
    });

    await u.closeLineReader();
    return result;
}

let start_time = new Date().getTime();
solution_part1().then(result => console.log(`Part 1 solution: ${result} in ${new Date().getTime() - start_time} ms`));
solution_part2().then(result => console.log(`Part 2 solution: ${result} in ${new Date().getTime() - start_time} ms`));
