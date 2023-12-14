import Utils from "./utils";
import path from "path";

const debug = true;
const fname = debug ? "inputs/test.txt" : "inputs/" + path.basename(__filename).slice(0, -2) + "txt";
const u = new Utils(debug, fname);

async function solution_part1() {
    const lr = u.getLineReader();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    lr.on('line', line => {
        // u.log(line);
    });

    await u.closeLineReader();
}

async function solution_part2() {
    const lr = u.getLineReader();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    lr.on('line', line => {
        // u.log(line);
    });

    await u.closeLineReader();
}

solution_part1().then(result => console.log("Part 1 solution:", result));
solution_part2().then(result => console.log("Part 2 solution:", result));
