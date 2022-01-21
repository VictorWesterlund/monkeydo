// Dedicated worker (monkey) that executes tasks from a Monkeydo manifest

importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");

class Monkey {
	constructor() {
		this.flags = new Uint8ClampedArray(3);

		this.tasks = {
			tasks: [],
			length: 0,
			_target: 0,
			_i: 0,
			set manifest(manifest) {
				this.tasks = manifest;
				this.length = this.tasks.length - 1;
			},
			get task() {
				return this.tasks[this._i];
			},
			get target() {
				return this._target;
			}
		}
	}

	// Advance to the next task or loop
	next() {
		// Reset index and loop if out of tasks
		if(this.tasks._i >= this.tasks.length) {
			this.tasks._i = -1;
			if(this.flags[1] === 255) return; // Loop forever
			this.flags[2] -= 1;
		}
		
		this.tasks._i++;
		const nextTask = this.tasks.task;
		this.tasks._target = performance.now() + nextTask[0];
	}

	// Main event loop, runs on every frame
	tick() {
		if(this === undefined) return;
		if(this.flags[0] === 0 || this.flags[2] === 0) return this.abort();
		
		const frame = Math.min(performance.now(),this.tasks.target);
		if(frame == this.tasks.target) {
			postMessage(["TASK",this.tasks.task]);
			this.next();
		}
		
		requestAnimationFrame(this.tick.bind(this));
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
		if(typeof manifest !== "object") {
			try {
				manifest = JSON.parse(manifest);
			}
			catch {
				Promise.reject("Failed to load manifest");
			}
		}
		this.tasks.manifest = manifest.tasks;
		this.flags[0] = 1; // Manifest loaded: true
		return true;
	}
}

Comlink.expose(Monkey);