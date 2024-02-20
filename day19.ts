import Utils from "./utils";
import path from "path";

const debug = false;
const fname = debug ? "inputs/test.txt" : "inputs/" + path.basename(__filename).slice(0, -2) + "txt";
const u = new Utils(debug, fname);

const workflow_regex = /([a-z]+){(.+)}/
const part_regex = /{x=(\d+),m=(\d+),a=(\d+),s=(\d+)}/

interface Part {
    x: number;
    m: number;
    a: number;
    s: number;
}
type Rule = (p: Part) => string | false;
type Workflow = Rule[];

function make_workflow(s: string): Workflow {
    const result: Workflow = [];
    const spl = s.split(",");
    
    for (let i = 0; i < spl.length; i++) {
        const r = spl[i];
        if (i === spl.length - 1) {
            result.push(part => r);
            break;
        }
        const attribute = r[0];
        const comparator = r[1] === ">" ? (a: number, b: number) => a > b : (a: number, b: number) => a < b;
        const r_spl = r.split(":");
        const value = parseInt(r_spl[0].slice(2));
        const destination = r_spl[1];

        result.push(part => {
            return comparator(part[attribute], value) ? destination : false;
        });
    }
    
    return result;
}

async function solution_part1() {
    const lr = u.getLineReader();
    const workflows: Map<string, Workflow> = new Map();
    let reading_workflows = true;

    let result = 0;
    lr.on('line', line => {
        if (line.length === 0) {
            reading_workflows = false;
            return;
        }

        if (reading_workflows) {
            const matches = line.match(workflow_regex);
            if (!matches) {
                throw Error("Workflow regex didn't match!");
            }
            workflows.set(matches[1], make_workflow(matches[2]));
        }
        else {
            const matches = line.match(part_regex);
            if (!matches) {
                throw Error("Line regex didn't match");
            }
            const part: Part = {
                x: parseInt(matches[1]),
                m: parseInt(matches[2]),
                a: parseInt(matches[3]),
                s: parseInt(matches[4])
            };
            let current_workflow_symbol = "in";
            while (true) {
                if (current_workflow_symbol === "R") {
                    break;
                }
                else if (current_workflow_symbol === "A") {
                    result += part.x + part.m + part.a + part.s;
                    break;
                }
                const current_workflow = workflows.get(current_workflow_symbol)!;
                for (const r of current_workflow) {
                    const res = r(part);
                    if (res) {
                        current_workflow_symbol = res;
                        break;
                    }
                }
            }
        }
    });

    await u.closeLineReader();
    return result;
}

type Rule2 = {
    attribute: keyof Part;
    comparator: ">" | "<";
    value: number;
    destination: string;
} | string;
type Workflow2 = Rule2[];

function make_workflow2(s: string): Workflow2 {
    const result: Workflow2 = [];
    const spl = s.split(",");
    
    for (let i = 0; i < spl.length; i++) {
        const r = spl[i];
        if (i === spl.length - 1) {
            result.push(r);
            break;
        }
        
        const r_spl = r.split(":");
        result.push({
            attribute: r[0] as keyof Part,
            comparator: r[1] as ">" | "<",
            value: parseInt(r_spl[0].slice(2)),
            destination: r_spl[1]
        });
    }
    
    return result;
}
type Range = [number, number];
type part_ranges = {
    x: Range;
    m: Range;
    a: Range;
    s: Range;
}

async function solution_part2() {
    const lr = u.getLineReader();

    const workflows: Map<string, Workflow2> = new Map();

    lr.on('line', line => {
        const matches = line.match(workflow_regex);
        if (!matches) {
            return;
        }
        workflows.set(matches[1], make_workflow2(matches[2]));
    });

    await u.closeLineReader();

    function find_acceptances(ranges: part_ranges, workflow_symbol: string): part_ranges[] {
        if (workflow_symbol === "A") {
            return [ranges];
        }
        if (workflow_symbol === "R") {
            return [];
        }
        
        const workflow = workflows.get(workflow_symbol)!;
        for (const r of workflow) {
            if (typeof r === "string") {
                return find_acceptances(ranges, r);
            }
            const relevant_range = ranges[r.attribute];
            if (r.comparator === ">") {
                if (relevant_range[0] > r.value) {
                    return find_acceptances(ranges, r.destination);
                }
                else if (relevant_range[1] <= r.value) {
                    continue;
                }
                else {
                    const new_range_1: part_ranges = JSON.parse(JSON.stringify(ranges));
                    const new_range_2: part_ranges = JSON.parse(JSON.stringify(ranges));
                    new_range_1[r.attribute] = [relevant_range[0], r.value];
                    new_range_2[r.attribute] = [r.value + 1, relevant_range[1]];
                    return find_acceptances(new_range_1, workflow_symbol).concat(find_acceptances(new_range_2, workflow_symbol));
                }
            }
            else {
                if (relevant_range[1] < r.value) {
                    return find_acceptances(ranges, r.destination);
                }
                else if (relevant_range[0] >= r.value) {
                    continue;
                }
                else {
                    const new_range_1: part_ranges = JSON.parse(JSON.stringify(ranges));
                    const new_range_2: part_ranges = JSON.parse(JSON.stringify(ranges));
                    new_range_1[r.attribute] = [relevant_range[0], r.value - 1];
                    new_range_2[r.attribute] = [r.value, relevant_range[1]];
                    return find_acceptances(new_range_1, workflow_symbol).concat(find_acceptances(new_range_2, workflow_symbol));
                }
            }
        }
        return [];
    }

    const initial_ranges: part_ranges = {
        x: [1, 4000],
        m: [1, 4000],
        a: [1, 4000],
        s: [1, 4000]
    }
    const acceptances = find_acceptances(initial_ranges, "in");

    let result = 0;
    for (const r of acceptances) {
        result += (r.x[1] - r.x[0] + 1) * (r.m[1] - r.m[0] + 1) * (r.a[1] - r.a[0] + 1) * (r.s[1] - r.s[0] + 1);
    }
    return result;
}

let start_time = new Date().getTime();
solution_part1().then(result => console.log(`Part 1 solution: ${result} in ${new Date().getTime() - start_time} ms`));
solution_part2().then(result => console.log(`Part 2 solution: ${result} in ${new Date().getTime() - start_time} ms`));
