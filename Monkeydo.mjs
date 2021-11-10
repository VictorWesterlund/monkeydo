import { default as MonkeyMaster } from "./monkey/MonkeyMaster.mjs";

export default class Monkeydo extends MonkeyMaster {
	constructor(methods) {
		if(typeof methods !== "object") {
			throw new TypeError(`Expected type 'object' but got '${typeof methods}' when initializing Monkeydo`);
		}
		super();
		this.methods = {};
		Object.assign(this.methods,methods);
	}

	// Execute a task
	do(task) {
		if(!task[1] in this.methods) return;
		const args = task.splice(2);
		this.methods[task[1]]?.(...args);
	}

	// Loop playback X times or negative number for infinite
	async loop(times = 255) {
		if(typeof times !== "number") {
			times = parseInt(times);
		}
		times = Math.floor(times);
		times = Math.min(Math.max(times,0),255); // Clamp number to 8 bits
		return await this.setFlag("loop",times);
	}

	// Load Monkeydo manifest
	async load(manifest) {
		if(typeof manifest === "object") {
			manifest = JSON.stringify(manifest);
		}
		return await this.loadManifest(manifest);
	}

	async play(manifest = null) {
		if(!this.ready && !manifest) throw new Error("Can not start playback without a manifest");
		if(manifest) {
			const load = this.load(manifest)
			load.then(() => this.start());
			return;
		}
		return await this.start();
	}
}