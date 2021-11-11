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
		const start = performance.now();
		const self = this;
		let task = null;

		// Run task after delay
		function frame() {
			if(self.flags[0] === 0 || self.flags[2] === 0) return self.abort();
			postMessage(["TASK",task]);
			self.i++;
			scheduleFrame();
		}

		// Queue the next task
		function scheduleFrame() {
			task = self.tasks[self.i];
			//const elapsed = Math.round(performance.now() - start);
			const wait = task[0] + start;
			console.log(wait);
			setTimeout(() => requestAnimationFrame(frame),wait);
		}
		
		scheduleFrame(start);
	}

	abort() {
		this.flags[2] = 0; // Playing: false
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