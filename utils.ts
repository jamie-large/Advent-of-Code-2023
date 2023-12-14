import readline from "readline";
import fs from "fs";
import events from "events";

export default class Utils {
    constructor(debug: boolean, fname: string) {
        this.debug = debug;
        this.fname = fname;
    }

    public getLineReader() {
        const rl = readline.createInterface({
            input: fs.createReadStream(this.fname),
            crlfDelay: Infinity
        });

        this.rl = rl;

        return this.rl;
    }

    public async closeLineReader() {
        await events.once(this.rl, 'close');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public log(s: any) {
        if (this.debug) { console.log(s); }
    }

    private debug: boolean;
    private fname: string;
    private rl: readline.Interface;
}
