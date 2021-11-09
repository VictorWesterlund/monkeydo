// Task manager for Monkeydo dedicated workers (monkeys)

import * as Comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";

export default class MonkeyMaster {
	constructor() {
		this.comlink = null;

		this.ready = false;
		// Tasks will be queued here on runtime if the worker isn't ready
		this.queue = {
			_flags: [],
			set flag(flag) {
				this._flags.push(flag);
			},
			// Attempt to send all queued flags
			sendAllFlags: () => {
				// Copy flags and clear queue
				const flags = [...this.queue._flags];
				this.queue._flags = [];
				flags.forEach(flag => this.setFlag(...flag));
			}
		};
	}

	// Import worker relative to this module
	getWorkerPath() {
		const name = "Monkey.js";
		const url = new URL(import.meta.url);

		// Replace pathname of this file with worker
		const path = url.pathname.split("/");
		path[path.length - 1] = name;

		url.pathname = path.join("/");
		return url.toString();
	}

	async init() {
		// Spawn and wrap dedicated worker with Comlink
		const worker = new Worker(this.getWorkerPath());
		worker.addEventListener("message",event => {
			if(event.data[0] !== "TASK") return;
			this.do(event.data);
		});

		const Monkey = Comlink.wrap(worker);
		this.comlink = await new Monkey();

		// Wait for comlink to initialize proxy and send queued flags
		return await new Promise((resolve,reject) => {
			if(!this.comlink) reject("Failed to open proxy to worker");

			this.ready = true;
			this.queue.sendAllFlags();
			resolve();
		});
	}

	// Return a flag array index by name
	flagStringToIndex(flag) {
		const flags = [
			"MANIFEST_LOADED",
			"PLAYING"
		];

		
		// Translate string to index
		if(typeof flag === "string" || flag < 0) {
			flag = flags.indexOf(flag.toUpperCase());
			if(flag < 0) return;
		}

		// Check that key is in bounds
		if(flag < 0 || flags > flags.length - 1) {
			throw new Error(`Array key '${flag}' out of range`);
		}
		return flag;
	}

	async getFlag(flag) {
		const key = this.flagStringToIndex(flag);
		return await this.comlink.flag(key);
	}

	// Set or queue worker runtime flag
	async setFlag(flag,value) {
		const key = this.flagStringToIndex(flag);
		if(!this.ready) {
			this.queue.flag = [key,value];
			return;
		}

		// Tell worker to update flag by key
		const update = await this.comlink.flag(key,value);
		if(!update) {
			this.queue.flag = [key,value];
		}
		return update;
	}

	// Load a Monkeydo manifest by URL or JSON string
	async loadManifest(manifest) {
		if(!this.ready) await this.init();
		return await new Promise((resolve,reject) => {
			let load = null;
			try {
				const url = new URL(manifest);
				load = this.comlink.fetchManifest(url.toString());
			}
			catch {
				load = this.comlink.loadManifest(manifest);
			}
			load.then(() => resolve())
			.catch(() => reject("Failed to load manifest"));
		});
	}

	// Start playback of a loaded manifest
	async start() {
		// Set playstate if no value is present already
		const loop = await this.getFlag("playing");
		if(loop < 1) await this.setFlag("playing",1);
		return await this.comlink.next();
	}
}