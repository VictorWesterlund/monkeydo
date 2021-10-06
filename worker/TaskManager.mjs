// Task manager for Monkeydo dedicated workers

export default class TaskManager {
	constructor() {
		// Get path of this file
		this.ready = false;
		let location = new URL(import.meta.url);
		location = location.pathname.replace("TaskManager.mjs",""); // Get parent directory

		// Spawn a dedicated worker for scheduling events from manifest
		this.worker = new Worker(location + "Monkey.js");
	}

	// Get a status flag from the worker
	async getFlag(flag) {
		this.worker.postMessage(["GET_FLAG",flag]);
		const response = await new Promise((resolve) => {
			this.worker.addEventListener("message",message => resolve(message.data));
		});
		return response;
	}

	// Set a status flag for the worker
	async setFlag(flag,value = 0) {
		const flagExists = await this.getFlag(flag);
		if(!flagExists) {
			this.debug(flagExists);
			throw new Error("Flag does not not exist");
		}
		this.worker.postMessage(["SET_FLAG",[flag,value]]);
	}

	// Pass manifest to worker and await response
	async giveManifest() {
		this.worker.postMessage(["GIVE_MANIFEST",this.manifest]);

		// Wait for the worker to install the manifest
		const ack = await new Promise((resolve,reject) => {
			this.worker.addEventListener("message",message => {
				if(message.data !== "OK") {
					reject(message.data);
				}
				resolve();
			});
		});
		return ack;
	}
}