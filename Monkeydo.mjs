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

	do(task) {
		console.log("TASK",task);
	}

	async loop(times = null) {
		times = times < 0 ? null : times;
		return await this.setFlag("loop",times);
	}

	async load(manifest) {
		let data = "";
		if(typeof manifest === "object") {
			data = JSON.stringify(manifest);
		}
		const load = await this.transaction("LOAD_MANIFEST",manifest);
		if(!load) {
			throw new Error("Failed to load manifest");
		}
		return true;
	}
}