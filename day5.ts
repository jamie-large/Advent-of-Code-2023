import Utils from "./utils";
import path from "path";

const debug = false;
const fname = debug ? "inputs/test.txt" : "inputs/" + path.basename(__filename).slice(0, -2) + "txt";
const u = new Utils(debug, fname);

async function solution_part1() {
    const lr = u.getLineReader();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let STATE = 0;
    let seeds: number[] = [];
    const all_maps: [number, number, number][][] = [[], [], [], [], [], [], []];
    lr.on('line', line => {
        if (!line) {
            STATE++;
        }
        if (!line.match(/\d/)) {
            return;
        }
        switch (STATE) {
            case 0: {
                seeds = line.split(/\s+/).slice(1).map(x => parseInt(x));
                break;
            }
            case all_maps.length + 1: {
                return;
            }
            default: {
                const matches = line.match(/(\d+) (\d+) (\d+)/)!.slice(1);
                all_maps[STATE - 1].push([parseInt(matches[1]), parseInt(matches[0]), parseInt(matches[2])]);
                break;
            }
        }
    });

    await u.closeLineReader();

    all_maps.forEach(arr => {
        arr.sort((a, b) => {
            return a[0] - b[0];
        });
    });

    let min_val = Infinity;
    seeds.forEach(seed => {
        let current_num = seed;
        for (const current_map of all_maps) {
            for (const mapping of current_map) {
                if (current_num >= mapping[0] && current_num < mapping[0] + mapping[2]) {
                    u.log(`Current num from ${current_num} to ${mapping[1] + current_num - mapping[0]}`);
                    current_num = mapping[1] + current_num - mapping[0];
                    break;
                }
                else if (current_num < mapping[0]) {
                    u.log(`Current num from ${current_num} to ${current_num}`);
                    break;
                }
            }
        }
        if (current_num < min_val) {
            min_val = current_num;
        }
    });
    return min_val;
}

async function solution_part2() {
    const lr = u.getLineReader();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let STATE = 0;
    const seeds: [number, number][] = [];
    const all_maps: [number, number, number][][] = [[], [], [], [], [], [], []];
    lr.on('line', line => {
        if (!line) {
            STATE++;
        }
        if (!line.match(/\d/)) {
            return;
        }
        switch (STATE) {
            case 0: {
                const spl = line.split(/\s+/).slice(1).map(x => parseInt(x));
                for (let i = 0; i < spl.length; i+=2) {
                    seeds.push([spl[i], spl[i] + spl[i+1]]);
                }
                break;
            }
            case all_maps.length + 1: {
                return;
            }
            default: {
                const matches = line.match(/(\d+) (\d+) (\d+)/)!.slice(1);
                all_maps[STATE - 1].push([parseInt(matches[1]), parseInt(matches[0]), parseInt(matches[2])]);
                break;
            }
        }
    });

    await u.closeLineReader();

    all_maps.forEach(arr => {
        arr.sort((a, b) => a[0] - b[0]);
    });

    let main_map: [number, number, number][] = [];
    for (const m of all_maps[0]) {
        main_map.push([...m]);
    }

    // Calculate the true main map
    for (const m of all_maps.slice(1)) {
        let next_main_map: [number, number, number][] = [];
        // get all intersections, previous maps
        for (const current_map of main_map) {
            for (let j = 0; j < m.length; j++) {
                const next_level_map = m[j];
                // if it's too early, just continue
                if (current_map[1] >= next_level_map[0] + next_level_map[2]) {
                    continue;
                }
                // if the map doesn't intersect with any next level maps, add it to the next level as is
                else if (current_map[2] <= 0 || current_map[1] + current_map[2] < next_level_map[0]) {
                    break;
                }
                // AT THIS POINT WE KNOW THEY INTERSECT
                // if the map starts below the next level's range, add part before, continue to process intersection
                else if (current_map[1] < next_level_map[0]) {
                    const offset = next_level_map[0] - current_map[1];
                    next_main_map.push([current_map[0], current_map[1], offset]);
                    current_map[0] += offset;
                    current_map[1] += offset;
                    current_map[2] -= offset;
                    j--;
                }
                // if the map ends after the next level's range, add (updated) intersection, continue to process after intersection
                else if (current_map[1] + current_map[2] > next_level_map[0] + next_level_map[2]) {
                    const offset = next_level_map[0] + next_level_map[2] - current_map[1];
                    next_main_map.push([current_map[0], next_level_map[1] + current_map[1] - next_level_map[0], offset]);
                    current_map[0] += offset;
                    current_map[1] += offset;
                    current_map[2] -= offset;
                }
                // if the map is entirely contained, add intersection
                else {
                    next_main_map.push([current_map[0], next_level_map[1] + current_map[1] - next_level_map[0], current_map[2]]);
                    current_map[2] = 0;
                    break;
                }
            }
            if (current_map[2] > 0) {
                next_main_map.push(current_map);
            }
        }
        main_map = next_main_map;
        main_map.sort((a, b) => a[0] - b[0]);
        next_main_map = [];
        // get all the new maps
        for (const current_map of m) {
            for (let j = 0; j < main_map.length; j++) {
                const next_level_map = main_map[j];
                // if it's too early, just continue
                if (current_map[0] >= next_level_map[0] + next_level_map[2]) {
                    continue;
                }
                // if the map doesn't intersect with any next level maps, add it to the next level as is
                else if (current_map[2] <= 0 || current_map[0] + current_map[2] < next_level_map[0]) {
                    break;
                }
                // AT THIS POINT WE KNOW THEY INTERSECT
                // if the map starts below the next level's range, add part before, continue to process intersection
                else if (current_map[0] < next_level_map[0]) {
                    const offset = next_level_map[0] - current_map[0];
                    next_main_map.push([current_map[0], current_map[1], offset]);
                    current_map[0] += offset;
                    current_map[1] += offset;
                    current_map[2] -= offset;
                    j--;
                }
                // if the map ends after the next level's range, skip intersection, continue to process after intersection
                else if (current_map[0] + current_map[2] > next_level_map[0] + next_level_map[2]) {
                    const offset = next_level_map[0] + next_level_map[2] - current_map[0];
                    current_map[0] += offset;
                    current_map[1] += offset;
                    current_map[2] -= offset;
                }
                // if the map is entirely contained, skip
                else {
                    current_map[2] = 0;
                    break;
                }
            }
            if (current_map[2] > 0) {
                next_main_map.push(current_map);
            }
        }

        for (const nmm of next_main_map) {
            main_map.push(nmm);
        }
        main_map.sort((a, b) => a[0] - b[0]);
    }


    main_map.sort((a, b) => a[1] - b[1]);
    seeds.sort((a, b) => a[0] - b[0]);

    for (const m of main_map) {
        for (const s of seeds) {
            if (s[0] < m[0] && s[1] > m[0] + m[2]) {
                return m[1];
            }
            if (s[1] >= m[0] && s[1] < m[0] + m[2]) {
                return m[1];
            }
            if (s[0] >= m[0] && s[0] < m[0] + m[2]) {
                return m[1] + (s[0] - m[0]);
            }
        }
    }

}

solution_part1().then(result => console.log("Part 1 solution:", result));
solution_part2().then(result => console.log("Part 2 solution:", result));
