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
		const args = task.splice(0,2);
		this.methods[task[1]](...args);
	}

	async debug(state = true) {
		return await this.setFlag("debug",state);
	}

	// Loop playback X times or negative number for infinite
	async loop(times = 255) {
		if(typeof times !== "number") {
			times = parseInt(times);
		}
		// Clamp number to 8 bit max
		times = Math.min(Math.max(times,0),255);
		return await this.setFlag("playing",times);
	}

	// Load Monkeydo manifest
	async load(manifest) {
		if(typeof manifest === "object") {
			manifest = JSON.stringify(manifest);
		}
		return await this.loadManifest(manifest);
	}
}