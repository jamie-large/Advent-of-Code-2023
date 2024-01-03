import Utils from "./utils";
import path from "path";

const debug = false;
const fname = debug ? "inputs/test.txt" : "inputs/" + path.basename(__filename).slice(0, -2) + "txt";
const u = new Utils(debug, fname);

async function solution_part1() {
    const lr = u.getLineReader();
    let result = 0;
    lr.on('line', line => {
        const nums: number[] = line.split(/\s+/).map(x => parseInt(x));
        const difference_arrays: number[][] = [nums];
        let stop = false;
        while (!stop) {
            stop = true;
            const new_array: number[] = [];
            for (let i = 1; i < difference_arrays.at(-1)!.length; i++) {
                new_array.push(difference_arrays.at(-1)![i] - difference_arrays.at(-1)![i-1]);
                if (new_array.at(-1) !== 0) {
                    stop = false;
                }
            }
            difference_arrays.push(new_array);
        }
        difference_arrays.at(-1)!.push(0);
        for (let i = difference_arrays.length - 2; i >= 0; i--) {
            difference_arrays[i].push(difference_arrays[i].at(-1)! + difference_arrays[i+1].at(-1)!);
        }
        result += difference_arrays[0].at(-1)!;
    });

    await u.closeLineReader();
    return result;
}


async function solution_part2() {
    const lr = u.getLineReader();
    let result = 0;
    lr.on('line', line => {
        const nums: number[] = line.split(/\s+/).map(x => parseInt(x));
        const difference_arrays: number[][] = [nums];
        let stop = false;
        while (!stop) {
            stop = true;
            const new_array: number[] = [];
            for (let i = 1; i < difference_arrays.at(-1)!.length; i++) {
                new_array.push(difference_arrays.at(-1)![i] - difference_arrays.at(-1)![i-1]);
                if (new_array.at(-1) !== 0) {
                    stop = false;
                }
            }
            difference_arrays.push(new_array);
        }
        difference_arrays.at(-1)!.push(0);
        for (let i = difference_arrays.length - 2; i >= 0; i--) {
            difference_arrays[i].unshift(difference_arrays[i][0] - difference_arrays[i+1][0]);
        }
        result += difference_arrays[0][0];
    });

    await u.closeLineReader();
    return result;
}

solution_part1().then(result => console.log("Part 1 solution:", result));
solution_part2().then(result => console.log("Part 2 solution:", result));
