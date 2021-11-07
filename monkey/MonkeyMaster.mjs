// Task manager for Monkeydo dedicated workers (monkeys)

import * as Comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";

export default class MonkeyMaster {
	constructor() {
		this.comlink = null;

		this.ready = false;
		this.flagQueue = [];
		this.init();
	}

	// Import worker relative to this module
	getWorkerPath() {
		const name = "Monkey.js";
		const url = new URL(import.meta.url);

		const path = url.pathname.split("/");
		path[path.length - 1] = name;

		url.pathname = path.join("/");
		return url.toString();
	}

	async init() {
		// Spawn and wrap dedicated worker with Comlink
		const worker = new Worker(this.getWorkerPath());
		const Monkey = Comlink.wrap(worker);

		this.comlink = await new Monkey();
	}

	// Return a flag array index by name
	flagStringToIndex(flag) {
		const flags = [
			"MANIFEST_LOADED",
			"PLAYING",
			"LOOP"
		];
		// Translate string to index
		if(typeof flag === "string" || flag < 0) {
			const key = flags.indexOf(flag.toUpperCase());
			if(key < 0) {
				return false;
			}
		}
		// Check key is in bounds
		if(flag < 0 || flags > flags.length - 1) {
			throw new Error(`Array key '${flag}' out of range`);
		}
		return flag;
	}

	async getFlag(flag) {
		const key = this.flagStringToIndex(flag);
		return await this.comlink.flag(key);
	}

	async setFlag(flag,value) {
		const key = this.flagStringToIndex(flag);
		const update = await this.comlink.flag(0,12);
		if(!update) {
			this.flagQueue.push([key,value]);
		}
		return true;
	}
}