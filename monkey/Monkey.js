// Dedicated worker (monkey) that executes tasks from a Monkeydo manifest

importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");

class Monkey {
	constructor() {
		this.flags = new Uint8ClampedArray(2);
		this.tasks = [];
		// Runtime task queue
		this.queue = {
			thisTask: null,
			nextTask: null
		}
	}

	// Task scheduler
	next() {
		if(this.flags[0] === 0) return;
		const task = this.tasks[this.i];

		// Run task after delay
		this.queue.thisTask = setTimeout(() => {
			// Dispatch task to main thread
			this.postMessage(["TASK",task]);
			this.i++;
		},task[0]);

		// Loop until flag is 0 or infinite if 255
		if(this.i === this.tasks.length) {
			this.i = 0;
			if(flags[1] === 255) return;
			flags[1]--;
		}

		// Queue the next task
		this.queue.nextTask = setTimeout(() => this.next(),task[0]);
	}

	abort() {
		clearTimeout(this.queue.thisTask);
		clearTimeout(this.queue.nextTask);
		this.queue.thisTask = null;
		this.queue.nextTask = null;
		this.flags[1] = 0; // Playing: false
	}

	// Set or get a runtime flag
	flag(index,value = null) {
		return value ? this.flags[index] = value : this.flags[index];
	}

	// Fetch and install manifest from URL
	async fetchManifest(url) {
		const manifest = await fetch(url);
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
			this.flags[0] = 1; // Manifest loaded: true
			resolve();
		});
	}
}

Comlink.expose(Monkey);