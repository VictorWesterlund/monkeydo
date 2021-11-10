// Dedicated worker (monkey) that executes tasks from a Monkeydo manifest

importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");

class Monkey {
	constructor() {
		this.flags = new Uint8ClampedArray(3);
		this.tasks = [];
		this.tasksLength = 0;
		this.i = 0;
		// Runtime task queue
		this.queue = {
			thisTask: null,
			nextTask: null
		}
	}

	// Task scheduler
	next() {
		if(this.flags[0] === 0 || this.flags[2] === 0) return this.abort();
		const task = this.tasks[this.i];

		// Run task after delay
		this.queue.thisTask = setTimeout(() => {
			// Dispatch task to main thread
			postMessage(["TASK",task]);
			this.i++;
		},task[0]);

		// Loop until flag is 0 or infinite if 255
		if(this.i === this.tasksLength) {
			this.i = -1;
			if(this.flags[1] < 255) this.flags[2]--;
		}

		// Queue the next task
		this.queue.nextTask = setTimeout(() => this.next(),task[0]);
	}

	abort() {
		this.flags[2] = 0; // Playing: false
		clearTimeout(this.queue.thisTask);
		clearTimeout(this.queue.nextTask);
		this.queue.thisTask = null;
		this.queue.nextTask = null;
	}

	// Set or get a runtime flag
	flag(index,value = null) {
		return value ? this.flags[index] = value : this.flags[index];
	}

	// Fetch and install manifest from URL
	async fetchManifest(url) {
		const manifest = await fetch(url);
		if(!manifest.ok) {
			console.error("Monkeydo fetch error:",manifest);
			throw new Error("Server responded with an error");
		};
		
		const json = await manifest.json();
		return await this.loadManifest(json);
	}

	// Install a Monkeydo manifest
	async loadManifest(manifest) {
		return await new Promise((resolve,reject) => {
			if(typeof manifest !== "object") {
				try {
					manifest = JSON.parse(manifest);
				}
				catch {
					reject("Failed to load manifest");
				}
			}
			this.tasks = manifest.tasks;
			// Store length as property so we don't have to calculate the offset each iteration of next()
			this.tasksLength = manifest.tasks.length - 1;
			this.flags[0] = 1; // Manifest loaded: true
			resolve();
		});
	}
}

Comlink.expose(Monkey);