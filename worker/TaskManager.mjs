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

	play() {
		this.worker.postMessage(["PLAYING",true]);
		this.worker.addEventListener("message",message => eval(message.data));
	}

	pause() {
		this.worker.postMessage(["PLAYING",false]);
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