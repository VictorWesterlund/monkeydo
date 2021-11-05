// Dedicated worker (monkey) which executes tasks from a Monkeydo manifest

class Monkey {
	constructor() {
		this.manifest = {};
	}

	async loadManifest(manifest) {
		try {
			const data = JSON.parse(manifest);
			this.manifest = data;
		}
		catch {
			const url = new URL(manifest);
		}
	}
}

const monkey = new Monkey();

// Event handler for messages received from initiator
onmessage = (message) => {
	console.log(message);
}