import Utils from "./utils";
import path from "path";

const debug = false;
const verbose = false;
const fname = debug ? "inputs/test.txt" : "inputs/" + path.basename(__filename).slice(0, -2) + "txt";
const u = new Utils(debug, fname);

type Signal = "low" | "high";
type Pulse = {
    origin: string;
    signal: Signal;
    destination: string;
};

class Controller {
    protected queue: Pulse[] = [];
    private low_pulses: number = 0;
    private high_pulses: number = 0;
    protected done_executing: boolean = true;
    protected module_map: Map<string, Module> = new Map();
    
    public initialize(modules: Module[]) {
        for (const m of modules) {
            this.module_map.set(m.name, m);
        }
        for (const m of this.module_map.values()) {
            for (const d of m.destinations) {
                const destination_module = this.module_map.get(d);
                if (destination_module instanceof Conjunction) {
                    destination_module.inputs.set(m.name, "low");
                }
            }
        }
    }
    public solution() {
        u.log(`${this.low_pulses} low, ${this.high_pulses} high`);
        return this.low_pulses * this.high_pulses;
    }

    public push_button() {
        this.add_pulse({
            origin: "button",
            signal: "low",
            destination: "broadcaster"
        });

        while (!this.done_executing) {
            this.execute_next_pulse();
        }
    }

    public add_pulse(p: Pulse) {
        this.queue.push(p);
        this.done_executing = false;
    }
    protected execute_next_pulse() {
        const p = this.queue.shift()!;
        if (verbose) {
            u.log(`${p.origin} -${p.signal}-> ${p.destination}`);
        }
        this.module_map.get(p.destination)?.receive_pulse(p);
        if (p.signal === "low") {
            this.low_pulses++;
        }
        else {
            this.high_pulses++;
        }
        if (this.queue.length === 0) {
            this.done_executing = true;
        }
    }
}

abstract class Module {
    public controller: Controller;
    public name: string;
    public destinations: string[];
    constructor(controller: Controller, name: string, destinations: string[]) {
        this.controller = controller;
        this.name = name;
        this.destinations = destinations;
    }
    public abstract receive_pulse(p: Pulse): void;
}

class Broadcaster extends Module {
    public receive_pulse(p: Pulse): void {
        for (const d of this.destinations) {
            this.controller.add_pulse({
                origin: this.name,
                signal: p.signal,
                destination: d
            });
        }
    }
}

class FlipFlop extends Module {
    private is_on: boolean = false;
    public receive_pulse(p: Pulse): void {
        if (p.signal === "high") {
            return;
        }
        for (const d of this.destinations) {
            this.controller.add_pulse({
                origin: this.name,
                signal: this.is_on ? "low" : "high",
                destination: d
            })
        }
        this.is_on = !this.is_on;
    }
}

class Conjunction extends Module {
    public inputs: Map<string, Signal> = new Map();
    public receive_pulse(p: Pulse): void {
        if (!this.inputs.has(p.origin)) {
            throw new Error(`Invalid origin: ${p.origin}`);
        }
        this.inputs.set(p.origin, p.signal);
        for (const s of this.inputs.values()) {
            if (s === "low") {
                for (const d of this.destinations) {
                    this.controller.add_pulse({
                        origin: this.name,
                        signal: "high",
                        destination: d
                    });
                }
                return;
            }
        }
        for (const d of this.destinations) {
            this.controller.add_pulse({
                origin: this.name,
                signal: "low",
                destination: d
            });
        }
    }
}

async function solution_part1() {
    const lr = u.getLineReader();
    const controller = new Controller();
    const modules: Module[] = [];

    lr.on('line', line => {
        const spl = line.split(/\s+/);
        const destinations = spl.slice(2, -1).map(s => s.slice(0, -1));
        destinations.push(spl.at(-1)!);
        if (spl[0] === "broadcaster") {
            modules.push(new Broadcaster(controller, spl[0], destinations));
        }
        else if (spl[0][0] === "%") {
            modules.push(new FlipFlop(controller, spl[0].slice(1), destinations));
        }
        else if (spl[0][0] === "&") {
            modules.push(new Conjunction(controller, spl[0].slice(1), destinations));
        }        
    });

    await u.closeLineReader();

    controller.initialize(modules);
    for (let i = 0; i < 1000; i++) {
        controller.push_button();
    }
    return controller.solution();
}

class Controller2 extends Controller {
    private found_solution: boolean = false;
    private main_inputs_cycles: Map<string, number> = new Map();
    private button_pushes: number = 0;

    public initialize(modules: Module[]) {
        super.initialize(modules);
        let ultimate_input = "";
        for (const m of modules) {
            if (m.destinations.includes("rx")) {
                ultimate_input = m.name;
                break;
            }
        }
        for (const m of modules) {
            if (m.destinations.includes(ultimate_input)) {
                this.main_inputs_cycles.set(m.name, -1);
            }
        }
    }

    public solution() {
        return this.found_solution ? lcm([...this.main_inputs_cycles.values()]) : -1;
    }

    protected execute_next_pulse() {
        const p = this.queue.shift()!;
        if (verbose) {
            u.log(`${p.origin} -${p.signal}-> ${p.destination}`);
        }
        this.module_map.get(p.destination)?.receive_pulse(p);
        if (p.signal === "high" && this.main_inputs_cycles.has(p.origin) && this.main_inputs_cycles.get(p.origin) === -1) {
            this.main_inputs_cycles.set(p.origin, this.button_pushes + 1);
        }
        if (this.queue.length === 0) {
            this.done_executing = true;
            this.button_pushes++;
            for (const s of this.main_inputs_cycles.keys()) {
                if (this.main_inputs_cycles.get(s) === -1) {
                    return;
                }
            }
            this.found_solution = true;
        }
    }
}

function gcd(a: number, b: number) {
    return !b ? a : gcd(b, a % b);
}

function lcm(arr: number[]) {
    return arr.reduce((a, b) => (a * b) / gcd(a, b));
}

async function solution_part2() {
    const lr = u.getLineReader();
    const controller = new Controller2();
    const modules: Module[] = [];

    lr.on('line', line => {
        const spl = line.split(/\s+/);
        const destinations = spl.slice(2, -1).map(s => s.slice(0, -1));
        destinations.push(spl.at(-1)!);
        if (spl[0] === "broadcaster") {
            modules.push(new Broadcaster(controller, spl[0], destinations));
        }
        else if (spl[0][0] === "%") {
            modules.push(new FlipFlop(controller, spl[0].slice(1), destinations));
        }
        else if (spl[0][0] === "&") {
            modules.push(new Conjunction(controller, spl[0].slice(1), destinations));
        }        
    });

    await u.closeLineReader();

    controller.initialize(modules);
    while (controller.solution() === -1) {
        controller.push_button();
    }
    return controller.solution();
}

let start_time = new Date().getTime();
solution_part1().then(result => console.log(`Part 1 solution: ${result} in ${new Date().getTime() - start_time} ms`));
solution_part2().then(result => console.log(`Part 2 solution: ${result} in ${new Date().getTime() - start_time} ms`));
