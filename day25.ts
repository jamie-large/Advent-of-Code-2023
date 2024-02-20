import Utils from "./utils";
import path from "path";

const debug = false;
const fname = debug ? "inputs/test.txt" : "inputs/" + path.basename(__filename).slice(0, -2) + "txt";
const u = new Utils(debug, fname);

async function solution_part1() {
    const lr = u.getLineReader();

    const groups: Map<string, Set<string>> = new Map();
    lr.on('line', line => {
        const spl = line.split(/\s+/);
        const name = spl[0].slice(0, spl[0].length - 1);
        if (!groups.has(name)) {
            groups.set(name, new Set());
        }
        for (let i = 1; i < spl.length; i++) {
            if (!groups.has(spl[i])) {
                groups.set(spl[i], new Set());
            }
            groups.get(name)!.add(spl[i]);
            groups.get(spl[i])!.add(name);
        }
    });

    await u.closeLineReader();

    const all_names = [...groups.keys()];

    // Randomized algorithm is 90.89% effective based on 10000 simulations
    while (true) {
        const random_name = all_names[Math.floor(Math.random() * all_names.length)];
        const current_group: Set<string> = new Set([random_name]);
        const rn_neighbors = groups.get(random_name)!
        current_group.add([...rn_neighbors][Math.floor(Math.random() * rn_neighbors.size)]);
        const current_edge_group = new Set([...current_group]);
        while (current_group.size < groups.size) {
            const possibilities: Map<string, number> = new Map();
            for (const node of [...current_edge_group]) {
                const neighbors = groups.get(node)!;
                let added = false;
                for (const n of neighbors) {
                    if (!current_group.has(n)) {
                        possibilities.set(n, (possibilities.get(n) ?? 0) + 1);
                        added = true;
                    }
                }
                if (!added) {
                    current_edge_group.delete(node);
                }
            }
    
            if (possibilities.size === 3 && [...possibilities.values()].every(val => val === 1)) {
                return current_group.size * (groups.size - current_group.size);
            }
            let added = false;
            for (const pair of possibilities.entries()) {
                if (pair[1] > 1) {
                    current_group.add(pair[0]);
                    current_edge_group.add(pair[0]);
                    added = true;
                }
            }
            if (!added) {
                const random_choice = [...possibilities.keys()][Math.floor(Math.random() * possibilities.size)];
                current_group.add(random_choice);
                current_edge_group.add(random_choice);
            }
        }
    }
}

let start_time = new Date().getTime();
solution_part1().then(result => console.log(`Part 1 solution: ${result} in ${new Date().getTime() - start_time} ms`));
