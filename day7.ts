import Utils from "./utils";
import path from "path";

const debug = false;
const fname = debug ? "inputs/test.txt" : "inputs/" + path.basename(__filename).slice(0, -2) + "txt";
const u = new Utils(debug, fname);

const CARD_STRENGTH = new Map([
    ["A", 13],
    ["K", 12],
    ["Q", 11],
    ["J", 10],
    ["T", 9],
    ["9", 8],
    ["8", 7],
    ["7", 6],
    ["6", 5],
    ["5", 4],
    ["4", 3],
    ["3", 2],
    ["2", 1]
]);

const HAND_STRENGTH = new Map([
   ["5", 7],
   ["4", 6],
   ["F", 5],
   ["3", 4],
   ["2p", 3],
   ["1p", 2],
   ["H", 1]
]);

// hand, bet, type, map of chars
type Hand = [string, number, string];

function compare_hands(a: Hand, b: Hand) {
    if (a[2] !== b[2]) {
        return HAND_STRENGTH.get(a[2])! - HAND_STRENGTH.get(b[2])!;
    }
    for (let i = 0; i < a[0].length; i++) {
        if (a[0][i] !== b[0][i]) {
            return CARD_STRENGTH.get(a[0][i])! - CARD_STRENGTH.get(b[0][i])!;
        }
    }
    return 0;
}

async function solution_part1() {
    const lr = u.getLineReader();
    const hands: Hand[] = [];
    lr.on('line', line => {
        const spl = line.split(/\s+/);
        const hand = spl[0];
        const bet = parseInt(spl[1]);
        const hand_map = new Map<string, number>();
        for (const char of hand) {
            hand_map.set(char, (hand_map.get(char) ?? 0) + 1);
        }
        const sorted_values = [...hand_map.values()].sort();
        const type = hand_map.size === 1 ? "5" :
                     hand_map.size === 2 ? (sorted_values.at(-1) === 4 ? "4" : "F") :
                     hand_map.size === 3 ? (sorted_values.at(-1) === 3 ? "3" : "2p") :
                     hand_map.size === 4 ? "1p" : "H";
        hands.push([hand, bet, type]);
    });
    await u.closeLineReader();

    hands.sort(compare_hands);

    let result = 0;
    for (let i = 0; i < hands.length; i++) {
        result += (i + 1) * hands[i][1];
    }
    return result;
}

async function solution_part2() {
    const lr = u.getLineReader();
    const hands: Hand[] = [];

    CARD_STRENGTH.set("J", 0);
    lr.on('line', line => {
        const spl = line.split(/\s+/);
        const hand = spl[0];
        const bet = parseInt(spl[1]);
        const hand_map = new Map<string, number>();
        for (const char of hand) {
            hand_map.set(char, (hand_map.get(char) ?? 0) + 1);
        }
        const num_jokers = hand_map.get("J") ?? 0;
        hand_map.delete("J");

        let max_val = 0;
        let max_card = "2";

        for (const k of hand_map.keys()) {
            if (hand_map.get(k)! > max_val) {
                max_val = hand_map.get(k)!;
                max_card = k;
            }
        }
        hand_map.set(max_card, hand_map.get(max_card)! + num_jokers);

        const sorted_values = [...hand_map.values()].sort();
        const type = hand_map.size === 1 ? "5" :
                     hand_map.size === 2 ? (sorted_values.at(-1) === 4 ? "4" : "F") :
                     hand_map.size === 3 ? (sorted_values.at(-1) === 3 ? "3" : "2p") :
                     hand_map.size === 4 ? "1p" : "H";
        hands.push([hand, bet, type]);
    });
    await u.closeLineReader();

    hands.sort(compare_hands);

    let result = 0;
    for (let i = 0; i < hands.length; i++) {
        result += (i + 1) * hands[i][1];
    }
    return result;
}
let start_time = new Date().getTime();
solution_part1().then(result => console.log(`Part 1 solution: ${result} in ${new Date().getTime() - start_time} ms`))
    .then(() => solution_part2().then(result => console.log(`Part 2 solution: ${result} in ${new Date().getTime() - start_time} ms`)));

