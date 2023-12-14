import Utils from "./utils";
import path from "path";

const debug = false;
const fname = debug ? "inputs/test.txt" : "inputs/" + path.basename(__filename).slice(0, -2) + "txt";
const u = new Utils(debug, fname);

async function solution_part1() {
    const lr = u.getLineReader();
    let result = 0;
    lr.on('line', line => {
        let i = 0;
        let j = line.length - 1;
        let first_num = "";
        let second_num = "";
        while (i < line.length) {
            if (!isNaN(Number(line.charAt(i)))) {
                first_num = line.charAt(i);
                i = line.length;
            }
            i++;
        }
        while (j >= 0) {
            if (!isNaN(Number(line.charAt(j)))) {
                second_num = line.charAt(j);
                j = -1;
            }
            j--;
        }
        u.log(`adding to result: ${Number(first_num + second_num)}`);
        result += Number(first_num + second_num);
    });

    await u.closeLineReader();
    return result;
}

const NUMBER_MAP = new Map<string, number>([
    ["zero", 0],
    ["one", 1],
    ["two", 2],
    ["three", 3],
    ["four", 4],
    ["five", 5],
    ["six", 6],
    ["seven", 7],
    ["eight", 8],
    ["nine", 9 ]
]);

async function solution_part2() {
    const lr = u.getLineReader();
    let result = 0;
    lr.on('line', line => {
        let i = 0;
        let j = line.length - 1;
        let first_num = -1;
        let second_num = -1;
        while (i < line.length) {
            if (!isNaN(Number(line.charAt(i)))) {
                first_num = Number(line.charAt(i));
                i = line.length;
            }
            for (const num of NUMBER_MAP.keys()) {
                if (line.substring(i, i+num.length) === num) {
                    first_num = NUMBER_MAP.get(num);
                    i = line.length;
                }
            }
            i++;
        }
        while (j >= 0) {
            if (!isNaN(Number(line.charAt(j)))) {
                second_num = Number(line.charAt(j));
                j = -1;
            }
            for (const num of NUMBER_MAP.keys()) {
                if (j + num.length <= line.length && line.substring(j, j+num.length) === num) {
                    second_num = NUMBER_MAP.get(num);
                    j = -1;
                }
            }
            j--;
        }
        u.log(`adding to result: ${10 * first_num + second_num}`);
        result += 10 * first_num + second_num;
    });

    await u.closeLineReader();
    return result;
}

solution_part1().then(result => console.log("Part 1 solution:", result));
solution_part2().then(result => console.log("Part 2 solution:", result));
