import Utils from "./utils";
import path from "path";

const debug = false;
const fname = debug ? "inputs/test.txt" : "inputs/" + path.basename(__filename).slice(0, -2) + "txt";
const u = new Utils(debug, fname);

async function solution_part1() {
    const lr = u.getLineReader();
    const max_map = new Map([
        ["red", 12],
        ["green", 13],
        ["blue", 14]
    ]);
    let result = 0;
    let i = 1;
    lr.on('line', line => {
        const sets = line.split(";");
        let success = true;
        loop1:
        for (const s of sets) {
            const colors = s.split(",");
            for (const c of colors) {
                const words = c.split(" ");
                const val = parseInt(words.at(-2)!);
                if (val > max_map.get(words.at(-1)!)!) {
                    success = false;
                    break loop1;
                }
            }
        }
        if (success) {
            result += i;
        }
        i += 1;
    });

    await u.closeLineReader();
    return result;
}

async function solution_part2() {
    const lr = u.getLineReader();
    let result = 0;
    lr.on('line', line => {
        const max_map = new Map([
            ["red", 0],
            ["green", 0],
            ["blue", 0]
        ]);
        const sets = line.split(";");
        for (const s of sets) {
            const colors = s.split(",");
            for (const c of colors) {
                const words = c.split(" ");
                const val = parseInt(words.at(-2)!);
                if (val > max_map.get(words.at(-1)!)!) {
                    max_map.set(words.at(-1)!, val);
                }
            }
        }
        let power = 1;
        for (const val of max_map.values()) {
            power *= val;
        }
        result += power;
    });

    await u.closeLineReader();
    return result;
}

solution_part1().then(result => console.log("Part 1 solution:", result));
solution_part2().then(result => console.log("Part 2 solution:", result));
