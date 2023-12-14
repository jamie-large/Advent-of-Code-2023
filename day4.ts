import Utils from "./utils";
import path from "path";

const debug = false;
const fname = debug ? "inputs/test.txt" : "inputs/" + path.basename(__filename).slice(0, -2) + "txt";
const u = new Utils(debug, fname);

async function solution_part1() {
    const lr = u.getLineReader();
    let result = 0;
    lr.on('line', line => {
        const spl = line.split("|");
        const winning_nums = new Set(spl[0].split(/\s+/).slice(2, -1).map(x => parseInt(x)));
        const your_nums = spl[1].split(/\s+/).slice(1).map(x => parseInt(x));
        u.log(winning_nums);
        u.log(your_nums);
        let count = 0;
        for (const n of your_nums) {
            if (winning_nums.has(n)) {
                count++;
            }
        }
        if (count > 0) {
            result += Math.pow(2, count - 1);
        }
    });

    await u.closeLineReader();
    return result;
}

async function solution_part2() {
    const lr = u.getLineReader();
    const cards: [Set<number>, number[]][] = [];
    lr.on('line', line => {
        const spl = line.split("|");
        const winning_nums = new Set(spl[0].split(/\s+/).slice(2, -1).map(x => parseInt(x)));
        const your_nums = spl[1].split(/\s+/).slice(1).map(x => parseInt(x));
        cards.push([winning_nums, your_nums])
    });

    await u.closeLineReader();

    const copies: number[] = Array(cards.length).fill(1);
    for (let i = 0; i < cards.length; i++) {
        const [winning_nums, your_nums] = cards[i];
        let count = 0;
        for (const n of your_nums) {
            if (winning_nums.has(n)) {
                count++;
            }
        }
        for (let j = i+1; j <= i+count; j++) {
            copies[j] += copies[i];
        }
    }
    return copies.reduce((prev, current) => prev + current, 0);
}

solution_part1().then(result => console.log("Part 1 solution:", result));
solution_part2().then(result => console.log("Part 2 solution:", result));
