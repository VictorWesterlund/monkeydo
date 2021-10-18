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

		this.reversed = false;

		this.init = {
			ready: false,
			flags: []
		}
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
		// Player is not initialized, add flag to queue
		if(!this.init.ready) {
			this.init.flags.push([flag,value]);
			return false;
		}

		const flagExists = await this.getFlag(flag);
		if(flagExists === null) {
			this.debug(flagExists);
			throw new Error("Flag does not not exist");
		}
		this.worker.postMessage(["SET_FLAG",[flag,value]]);
	}

	// Get acknowledgement from worker for a transactional operation
	async ack(name) {
		const status = await new Promise((resolve,reject) => {
			const ack = this.worker.addEventListener("message",message => {
				if(message.data[0] !== name) {
					return false;
				}

				if(message.data[1] !== "OK") {
					reject(message.data);
				}
				this.init.ready = true;
				resolve();
			});
			this.worker.removeEventListener("message",ack);
		});
		return status;
	}

	// Pass manifest to worker and await response from worker
	async giveManifest() {
		this.worker.postMessage(["GIVE_MANIFEST",this.manifest]);
		const status = await this.ack("RECEIVED_MANIFEST");
		return status;
	}

	initFlags() {
		if(this.init.flags.length > 0) {
			this.init.flags.forEach(flag => this.setFlag(...flag));
		}
		this.init.flags = [];
	}

	// Call method from object and pass arguments
	run(task) {
		this.methods[task.func](...task.args);
	}

	play() {
		this.worker.postMessage(["SET_PLAYING",true]);
	}

	pause() {
		this.worker.postMessage(["SET_PLAYING",false]);
	}

	// Event handler for messages received from worker
	message(message) {
		const type = message.data[0] ? message.data[0] : message.data;
		const data = message.data[1];

		switch(type) {
			case "TASK":
				this.run(data);
				break;

			case "DEBUG":
			default:
				this.debug("MESSAGE_FROM_WORKER",message.data);
				break;
		}
	}
}