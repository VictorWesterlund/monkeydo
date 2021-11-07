// Dedicated worker (monkey) that executes tasks from a Monkeydo manifest

importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");

class Monkey {
	constructor() {
		this.manifest = {};

		// Runtime flags
		this.flags = new Uint8ClampedArray(2);
	}

	// Set or get a runtime flag
	flag(index,value = null) {
		return value ? this.flags[index] = value : this.flags[index];
	}

	async loadManifest(manifest) {
		try {
			const data = JSON.parse(manifest);
			this.manifest = data;
			this.flags[0] = 1;
		}
		catch {
			const url = new URL(manifest);
		}
	}
}

Comlink.expose(Monkey);