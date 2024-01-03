import Utils from "./utils";
import path from "path";

const debug = false;
const fname = debug ? "inputs/test.txt" : "inputs/" + path.basename(__filename).slice(0, -2) + "txt";
const u = new Utils(debug, fname);

async function solution_part1() {
    const lr = u.getLineReader();

    let result = 0;
    let current = 0;
    lr.on('line', line => {
        for (const ch of line) {
            if (ch === ",") {
                result += current;
                current = 0;
                continue;
            }
            current = ((current + ch.charCodeAt(0)) * 17) % 256;
        }
    });

    await u.closeLineReader();
    return result + current;
}


class Node {
    public prev: Node | null;
    public next: Node | null;
    public label: string;
    public value: number;

    public constructor(label: string, value: number) {
        this.prev = null;
        this.next = null;
        this.label = label;
        this.value = value;
    }
}

async function solution_part2() {
    const lr = u.getLineReader();

    const boxes: (Node | null)[] = [];
    for (let i = 0; i < 256; i++) {
        boxes.push(null);
    }

    let hash_value = 0;
    let label = "";
    lr.on('line', line => {
        for (const ch of line) {
            const code = ch.charCodeAt(0);
            if (ch === "-") {
                let current = boxes[hash_value];
                if (current && current.label === label) {
                    if (current.next) {
                        current.next.prev = null;
                    }
                    boxes[hash_value] = current.next;
                }
                while (current) {
                    if (current.label === label) {
                        if (current.prev) {
                            current.prev.next = current.next;
                        }
                        if (current.next) {
                            current.next.prev = current.prev;
                        }
                        break;
                    }
                    current = current.next;
                }
            }
            else if (ch === "=") {
                continue;
            }
            else if (code >= 97 && code <= 122) {
                label += ch;
                hash_value = ((hash_value + code) * 17) % 256;
            }
            else if (code >= 48 && code <= 57) {
                let current = boxes[hash_value];
                const value = code - 48;
                if (!current) {
                    boxes[hash_value] = new Node(label, value);
                    continue;
                }
                let broken = false;
                while (current && current.next) {
                    if (current.label === label) {
                        current.value = value;
                        broken = true;
                        break;
                    }
                    current = current.next;
                }
                if (!broken) {
                    if (current.label === label) {
                        current.value = value;
                    }
                    else {
                        current.next = new Node(label, value);
                        current.next.prev = current;
                    }
                }
            }
            else if (ch === ",") {
                u.log(`Finished ${label}`);
                hash_value = 0;
                label = "";

                for (let i = 0; i < boxes.length; i++) {
                    let current = boxes[i];
                    while (current) {
                        u.log(`Box ${i}: [${current.label} ${current.value}]`);
                        current = current.next;
                    }
                }
            }

        }
    });

    await u.closeLineReader();
    let result = 0;
    for (let i = 0; i < boxes.length; i++) {
        let current = boxes[i];
        let j = 1;
        while (current) {
            result += (i + 1) * j * (current.value);
            j += 1;
            current = current.next;
        }
    }
    return result;

}

solution_part1().then(result => console.log("Part 1 solution:", result));
solution_part2().then(result => console.log("Part 2 solution:", result));
