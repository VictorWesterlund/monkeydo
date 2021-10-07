// Task manager for Monkeydo dedicated workers

export default class MonkeyManager {
	constructor(methods) {
		// Object of scoped methods for this manifest
		this.methods = {};
		Object.assign(this.methods,methods);
		
		// Get path of this file
		let location = new URL(import.meta.url);
		location = location.pathname.replace("MonkeyManager.mjs",""); // Get parent directory

		// Spawn a dedicated worker for scheduling events from manifest
		this.worker = new Worker(location + "Monkey.js");
		this.worker.addEventListener("message",message => this.message(message));
	}

	// Get a status flag from the worker
	async getFlag(flag) {
		this.worker.postMessage(["GET_FLAG",flag]);
		const response = await new Promise((resolve) => {
			this.worker.addEventListener("message",message => resolve(message.data));
		});
		this.debug("GET_FLAG",flag,response);
		return response;
	}

	// Set a status flag for the worker
	async setFlag(flag,value = 0) {
		const flagExists = await this.getFlag(flag);
		if(flagExists === null) {
			this.debug(flagExists);
			throw new Error("Flag does not not exist");
		}
		this.worker.postMessage(["SET_FLAG",[flag,value]]);
	}

	// Call method from object and pass arguments
	runTask(task) {
		this.methods[task.func](...task.args);
	}

	play() {
		this.worker.postMessage(["SET_PLAYING",true]);
	}

	pause() {
		this.worker.postMessage(["SET_PLAYING",false]);
	}

	// Pass manifest to worker and await response
	async giveManifest() {
		this.worker.postMessage(["GIVE_MANIFEST",this.manifest]);

		const status = await new Promise((resolve,reject) => {
			const ack = this.worker.addEventListener("message",message => {
				if(message.data[0] !== "RECEIVED_MANIFEST") {
					return false;
				}

				if(message.data[1] !== "OK") {
					reject(message.data);
				}
				resolve();
			});
			this.worker.removeEventListener("message",ack);
		});
		return status;
	}

	message(message) {
		const type = message.data[0] ? message.data[0] : message.data;
		const data = message.data[1];
		if(type !== "TASK") {
			return false;
		}
		this.runTask(data);
	}
}