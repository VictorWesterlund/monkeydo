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
			this.do(event.data[1]); // Send inner array (task)
		});

		const Monkey = Comlink.wrap(worker);
		this.comlink = await new Monkey();

		// Wait for comlink to spin up
		if(!this.comlink) Promise.reject("Failed to establish Comlink with worker");

		this.ready = true;
		// Send queued flags when worker is ready
		this.queue.sendAllFlags();
		return true;
	}

	// Return a flag array index by name
	flagStringToIndex(flag) {
		const flags = [
			"MANIFEST_LOADED",
			"LOOP",
			"PLAYING"
		];
		
		// Translate string to index
		if(typeof flag === "string" || flag < 0) {
			flag = flags.indexOf(flag.toUpperCase());
		}

		// Check that key is in bounds
		if(flag < 0 || flags > flags.length - 1) return false;
		return flag;
	}

	async getFlag(flag) {
		const key = this.flagStringToIndex(flag);
		if(!key) Promise.reject("Invalid flag");
		return await this.comlink.flag(key);
	}

	// Set or queue worker runtime flag
	async setFlag(flag,value) {
		const key = this.flagStringToIndex(flag);
		if(!key) Promise.reject("Invalid flag");

		// Set the flag when the worker is ready
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
		let load = null;
		// Attempt load string as URL and fetch manifest
		try {
			const url = new URL(manifest);
			// If the URL parsed but fetch failed, this promise will reject
			load = this.comlink.fetchManifest(url.toString());
		}
		// Or attempt to load string as JSON if it's not a URL
		catch {
			load = this.comlink.loadManifest(manifest);
		}

		load.then(() => Promise.resolve())
		.catch(() => Promise.reject("Failed to load manifest"));
	}

	async stop() {
		return await this.comlink.abort();
	}

	// Start playback of a loaded manifest
	async start() {
		const playing = await this.getFlag("playing");
		let loop = await this.getFlag("loop");
		loop = loop > 0 ? loop : 1; // Play once if loop has no value

		if(playing > 0) return;
		await this.setFlag("playing",loop);
		return await this.comlink.tick();
	}
}