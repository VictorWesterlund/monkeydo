import { default as MonkeyMaster } from "./monkey/MonkeyMaster.mjs";

export default class Monkeydo extends MonkeyMaster {
	constructor(methods) {
		if(typeof methods !== "object") {
			throw new TypeError(`Expected type 'object' but got '${typeof methods}' when initializing Monkeydo`);
		}
		super();
		this.methods = {};
		Object.assign(this.methods,methods);

		this.media = {
			_element: null,
			get exists() {
				return this._element instanceof HTMLMediaElement;
			},
			bind: (element) => {
				if(element instanceof HTMLMediaElement !== true) throw new TypeError("Not a media element");
				this.media.unbind();

				this.media._element = element;
				// Send timestamps to worker
				this.media._element.addEventListener("timeupdate",event => this.mediaTimeUpdate(event.timeStamp));
			},
			unbind: () => {
				this.stop();
				this.media._element = null;
			}
		}
	}

	// Execute a task
	do(task) {
		if(!task[1] in this.methods) return;
		const args = task.splice(2);
		this.methods[task[1]]?.(...args);
	}

	// Loop playback X times or negative number for infinite
	async loop(times = 255) {
		if(typeof times !== "number") {
			times = parseInt(times);
		}
		times = Math.floor(times);
		times = Math.min(Math.max(times,0),255); // Clamp number to 8 bits
		return await this.setFlag("loop",times);
	}

	// Load Monkeydo manifest
	async load(manifest) {
		if(typeof manifest === "object") {
			manifest = JSON.stringify(manifest);
		}
		return await this.loadManifest(manifest);
	}

	async play(manifest = null) {
		if(!this.ready && !manifest) throw new Error("Can not start playback without a manifest");
		if(manifest) await this.load(manifest);

		if(!this.media.exists) return await this.start();

		// Start Monkeydo playback after media is playing
		this.media._element.play()
		.then(() => this.start())
		// Poll the play function until the user interacts with the page
		.catch(error => {
			if(error instanceof DOMException && error.name === "NotAllowedError") this.play(manifest);
		});
	}
}