// Task scheduler and iterator of Monkeydo manifests

class Monkey {
	constructor(manifest) {
		this.data = manifest.body;
		this.dataLength = this.data.length - 1;

		this.i = 0;
		this.queue = {
			task: null,
			next: null
		}
		Object.seal(this.queue);
	}

	run(data) {
		this.i++;
		postMessage(data);
	}

	queueNext() {
		const data = this.data[this.i];
		this.queue.task = setTimeout(() => this.run(data.do),data.wait);

		// Schedule next task if it's not the last
		if(this.i >= this.dataLength) {
			this.i = 0;
			return false;
		}
		
		this.queue.next = setTimeout(() => this.queueNext(),data.wait);
	}

	interrupt() {
		clearTimeout(this.queue.task);
		clearTimeout(this.queue.next);
		this.queue.task = null;
		this.queue.next = null;
	}
}

// Global event handler for this worker
onmessage = (message) => {
	const type = message.data[0] ? message.data[0] : null;
	const data = message.data[1];

	switch(type) {
		case "GIVE_MANIFEST":
			try {
				this.monkey = new Monkey(data);
				postMessage("OK");
			}
			catch(error) {
				postMessage(["MANIFEST_ERROR",error]);
			}
			break;

		case "PLAYING":
			this.monkey.queueNext();
			break;

		default: return; // No op
	}
}