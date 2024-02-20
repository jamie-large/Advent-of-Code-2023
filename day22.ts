import Utils from "./utils";
import path from "path";

const debug = false;
const fname = debug ? "inputs/test.txt" : "inputs/" + path.basename(__filename).slice(0, -2) + "txt";
const u = new Utils(debug, fname);

let ID_GENERATOR = 0;

class Brick {
    public id = ID_GENERATOR++;
    public x_range: [number, number];
    public y_range: [number, number];
    public z_range: [number, number];
    public supported_by: number[] = [];

    constructor(x_range: [number, number], y_range: [number, number], z_range: [number, number]) {
        this.x_range = x_range;
        this.y_range = y_range;
        this.z_range = z_range;
    }

    public drop_to(z: number) {
        const size = this.z_range[1] - this.z_range[0]
        this.z_range[0] = z;
        this.z_range[1] = z + size;
    }

    public intersects(b: Brick) {
        return ((b.x_range[0] >= this.x_range[0] && b.x_range[0] <= this.x_range[1]) || (this.x_range[0] >= b.x_range[0] && this.x_range[0] <= b.x_range[1])) &&
               ((b.y_range[0] >= this.y_range[0] && b.y_range[0] <= this.y_range[1]) || (this.y_range[0] >= b.y_range[0] && this.y_range[0] <= b.y_range[1]))
    }
}

class Node {
    public prev?: Node;
    public next?: Node;
    public val: number;
    public bricks: Brick[];

    constructor(b: Brick) {
        this.val = b.z_range[1];
        this.bricks = [b];
    }
}

async function solution_part1() {
    const lr = u.getLineReader();
    const bricks: Brick[] = [];

    lr.on('line', line => {
        const [start, end] = line.split("~").map(value => value.split(",").map(x => parseInt(x)));
        bricks.push(new Brick([Math.min(start[0], end[0]), Math.max(start[0], end[0])], 
                              [Math.min(start[1], end[1]), Math.max(start[1], end[1])],
                              [Math.min(start[2], end[2]), Math.max(start[2], end[2])]));
    });

    await u.closeLineReader();

    bricks.sort((a, b) => a.z_range[0] - b.z_range[0]);

    bricks[0].drop_to(1);

    const cannot_disintegrate: Set<number> = new Set();

    // sorted linked list (by z_range[1])
    let ll: Node = new Node(bricks[0]);

    for (let i = 1; i < bricks.length; i++) {
        const brick = bricks[i]
        
        // find how many bricks support this one
        let curr: Node | undefined = ll;
        const bricks_supporting: number[] = [];
        while (curr) {
            for (const b of curr.bricks) {
                if (brick.intersects(b)) {
                    bricks_supporting.push(b.id);
                    brick.drop_to(b.z_range[1] + 1);
                }
                if (bricks_supporting.length > 1) {
                    break;
                }
            }
            if (bricks_supporting.length > 0) {
                if (bricks_supporting.length === 1) {
                    cannot_disintegrate.add(bricks_supporting[0])
                }
                break;
            }
            curr = curr.next;
        }
        if (bricks_supporting.length === 0) {
            brick.drop_to(1);
        }

        // add this to sorted linked list
        curr = ll;
        while (curr) {
            if (brick.z_range[1] === curr.val) {
                curr.bricks.push(brick);
                break;
            }
            else if (brick.z_range[1] > curr.val) {
                const new_node = new Node(brick);
                new_node.next = curr;
                new_node.prev = curr.prev;
                curr.prev = new_node;
                if (new_node.prev) {
                    new_node.prev.next = new_node;
                }
                if (curr === ll) {
                    ll = new_node;
                }
                break;
            }
            else if (!curr.next) {
                const new_node = new Node(brick);
                new_node.prev = curr;
                curr.next = new_node;
            }
            curr = curr.next;
        }
    }

    return bricks.length - cannot_disintegrate.size;
}

async function solution_part2() {
    const lr = u.getLineReader();
    const bricks: Brick[] = [];
    const bricks_map: Map<number, Brick> = new Map();

    lr.on('line', line => {
        const [start, end] = line.split("~").map(value => value.split(",").map(x => parseInt(x)));
        bricks.push(new Brick([Math.min(start[0], end[0]), Math.max(start[0], end[0])], 
                              [Math.min(start[1], end[1]), Math.max(start[1], end[1])],
                              [Math.min(start[2], end[2]), Math.max(start[2], end[2])]));
        bricks_map.set(bricks[bricks.length - 1].id, bricks[bricks.length - 1]);
    });

    await u.closeLineReader();

    bricks.sort((a, b) => a.z_range[0] - b.z_range[0]);

    bricks[0].drop_to(1);

    // sorted linked list (by z_range[1])
    let ll: Node = new Node(bricks[0]);

    for (let i = 1; i < bricks.length; i++) {
        const brick = bricks[i]
        
        // find supporting structure
        let curr: Node | undefined = ll;
        while (curr) {
            for (const b of curr.bricks) {
                if (brick.intersects(b)) {
                    brick.supported_by.push(b.id);
                    brick.drop_to(b.z_range[1] + 1);
                }
            }
            if (brick.supported_by.length > 0) {
                break;
            }
            curr = curr.next;
        }

        if (brick.supported_by.length === 0) {
            brick.drop_to(1);
        }

        // add this to sorted linked list
        curr = ll;
        while (curr) {
            if (brick.z_range[1] === curr.val) {
                curr.bricks.push(brick);
                break;
            }
            else if (brick.z_range[1] > curr.val) {
                const new_node = new Node(brick);
                new_node.next = curr;
                new_node.prev = curr.prev;
                curr.prev = new_node;
                if (new_node.prev) {
                    new_node.prev.next = new_node;
                }
                if (curr === ll) {
                    ll = new_node;
                }
                break;
            }
            else if (!curr.next) {
                const new_node = new Node(brick);
                new_node.prev = curr;
                curr.next = new_node;
            }
            curr = curr.next;
        }
    }
    
    bricks.sort((a, b) => b.z_range[0] - a.z_range[0]);

    let result = 0;

    for (let i = 0; i < bricks.length; i++) {
        const brick = bricks[i];
        const dropped_bricks: Set<number> = new Set([brick.id]);

        for (let j = i - 1; j >= 0; j--) {
            const b = bricks[j];
            if (b.supported_by.length > 0 && b.supported_by.every(val => dropped_bricks.has(val))) {
                dropped_bricks.add(b.id);
            }
        }
        u.log(`Droppping ${brick.id} causes ${dropped_bricks.size - 1} to fall`);
        result += dropped_bricks.size - 1;
    }

    return result;
}

let start_time = new Date().getTime();
solution_part1().then(result => console.log(`Part 1 solution: ${result} in ${new Date().getTime() - start_time} ms`));
solution_part2().then(result => console.log(`Part 2 solution: ${result} in ${new Date().getTime() - start_time} ms`));
