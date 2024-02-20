import Utils from "./utils";
import path from "path";

const debug = false;
const fname = debug ? "inputs/test.txt" : "inputs/" + path.basename(__filename).slice(0, -2) + "txt";
const u = new Utils(debug, fname);

async function solution_part1() {
    const lr = u.getLineReader();
    let line_number = 0;
    let instructions = "";
    const network: Map<string, [string, string]> = new Map();
    lr.on('line', line => {
        if (line_number === 0) {
            instructions = line;
        }
        else if (line_number > 1) {
            network.set(line.slice(0, 3), [line.slice(7, 10), line.slice(12, 15)]);
        }
        line_number++;
    });
    await u.closeLineReader();

    let location = "AAA";
    let num_steps = 0;
    while (location !== "ZZZ") {
        location = network.get(location)![instructions[num_steps % instructions.length] === "L" ? 0 : 1];
        num_steps++;
    }
    return num_steps;
}

async function solution_part2() {
    const lr = u.getLineReader();
    let line_number = 0;
    let instructions = "";
    const network: Map<string, [string, string]> = new Map();
    const starts: string[] = [];
    lr.on('line', line => {
        if (line_number === 0) {
            instructions = line;
        }
        else if (line_number > 1) {
            if (line.at(2) === "A") {
                starts.push(line.slice(0, 3));
            }
            network.set(line.slice(0, 3), [line.slice(7, 10), line.slice(12, 15)]);
        }
        line_number++;
    });
    await u.closeLineReader();

    // figure out how long each cycle takes
    const offsets: number[] = [];
    const cycle_lengths: number[] = [];
    for (const s of starts) {
        const seen: Map<string, number> = new Map();
        let location = s;
        let num_steps = 0;
        let offset: number = 0;
        let hash_tuple = [location, num_steps % instructions.length].toString();
        while (seen.get(hash_tuple) === undefined) {
            if (location.at(2) === "Z") {
                offset = num_steps;
            }
            seen.set(hash_tuple, num_steps);
            location = network.get(location)![instructions[num_steps % instructions.length] === "L" ? 0 : 1];
            num_steps++;
            hash_tuple = [location, num_steps % instructions.length].toString();
        }
        offsets.push(offset);
        cycle_lengths.push(num_steps - seen.get(hash_tuple.toString())!);
    }
    let result = offsets[0];
    let mod = offsets[0];
    for (let i = 1; i < offsets.length; i++) {
        result = lcm(result, offsets[i]);
        mod = lcm(mod, cycle_lengths[i]);
        result = result > mod ? result % mod : result;
    }
    return result;
}


function gcd(a: number, b: number) {
    return !b ? a : gcd(b, a % b);
}

function lcm(a: number, b: number) {
    return (a * b) / gcd(a, b);
}


let start_time = new Date().getTime();
solution_part1().then(result => console.log(`Part 1 solution: ${result} in ${new Date().getTime() - start_time} ms`));
solution_part2().then(result => console.log(`Part 2 solution: ${result} in ${new Date().getTime() - start_time} ms`));
