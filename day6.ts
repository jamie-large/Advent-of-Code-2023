import Utils from "./utils";
import path from "path";

const debug = false;
const fname = debug ? "inputs/test.txt" : "inputs/" + path.basename(__filename).slice(0, -2) + "txt";
const u = new Utils(debug, fname);

async function solution_part1() {
    const lr = u.getLineReader();
    let times: number[] = [];
    let distances: number[] = [];
    let linenum = 0;
    lr.on('line', line => {
        if (linenum == 0) {
            times = line.split(/\s+/).slice(1).map(x => parseInt(x));
        }
        else if (linenum == 1) {
            distances = line.split(/\s+/).slice(1).map(x => parseInt(x));
        }
        linenum++;
    });
    await u.closeLineReader();

    let result = 1;
    for (let i = 0; i < times.length; i++) {
        const race_time = times[i];
        const race_record = distances[i];
        for (let j = 1; j < race_time; j++) {
            const dist_traveled = j * (race_time - j);
            if (dist_traveled > race_record) {
                u.log(`Beat at ${j}, stop at ${race_time - j}`);
                result *= race_time - 2 * j + 1;
                break;
            }
        }
    }

    return result;
}

async function solution_part2() {
    const lr = u.getLineReader();
    let race_time = 0;
    let race_record = 0;
    let linenum = 0;
    lr.on('line', line => {
        if (linenum == 0) {
            race_time = parseInt(line.split(/\s+/).slice(1).join(""));
        }
        else if (linenum == 1) {
            race_record = parseInt(line.split(/\s+/).slice(1).join(""));
        }
        linenum++;
    });
    await u.closeLineReader();

    u.log(race_time);
    u.log(race_record);

    for (let j = 1; j < race_time; j++) {
        const dist_traveled = j * (race_time - j);
        if (dist_traveled > race_record) {
            u.log(`Beat at ${j}, stop at ${race_time - j}`);
            return race_time - 2 * j + 1;
        }
    }
}

let start_time = new Date().getTime();
solution_part1().then(result => console.log(`Part 1 solution: ${result} in ${new Date().getTime() - start_time} ms`));
solution_part2().then(result => console.log(`Part 2 solution: ${result} in ${new Date().getTime() - start_time} ms`));
