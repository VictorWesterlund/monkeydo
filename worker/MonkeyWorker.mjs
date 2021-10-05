// Spawn a dedicated worker for scheduling events from manifest

export default class MonkeyWorker {
	constructor() {
		// Get location of this file
		this.ready = false;
		let location = new URL(import.meta.url);
		location = location.pathname.replace("MonkeyWorker.mjs","");

		// Spawn worker from file relative to this file
		this.worker = new Worker(location + "Sequencer.js");
		this.worker.addEventListener("message",message => this.message(message));
	}

	play() {
		this.worker.postMessage(["PLAYSTATE",true]);
	}

	pause() {
		this.worker.postMessage(["PLAYSTATE",false]);
	}

	giveManifest() {
		this.worker.postMessage(["GIVE_MANIFEST",this.manifest]);
	}

	message(message) {
		console.log(message);
	}
}