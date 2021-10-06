import { default as MonkeyWorker } from "./worker/TaskManager.mjs";

export default class Monkeydo extends MonkeyWorker {
	constructor(manifest = false) {
		super();
		this.monkeydo = {
			version: "0.2.0",
			debugLevel: 0,
			// Flag if debugging is enabled, regardless of level
			get debug() { 
				return this.debugLevel > 0 ? true : false;
			},
			// Set debug level. Non-verbose debugging if called without an argument
			set debug(level = 1) { 
				this.debugLevel = level;
			}
		};
		Object.seal(this.monkeydo);

		// Monkeydo manifest parsed with load()
		this.manifest = {
			header: null,
			body: null
		};

		if(!window.Worker) {
			throw new Error("JavaScript Workers aren't supported by your browser");
		}

		if(manifest) {
			this.load(manifest);
		}
	}

	debug(...attachment) {
		if(this.monkeydo.debug) {
			console.warn("-- Monkeydo debug -->",attachment);
			return;
		}
	}

	play() {
		this.worker.postMessage(["SET_PLAYING",true]);
		this.worker.addEventListener("message",message => eval(message.data));
	}

	pause() {
		this.worker.postMessage(["SET_PLAYING",false]);
	}

	loop(times) {
		if(!times || times === "infinite") {
			times = -1;
		}
		this.setFlag("loop",times);
	}

	// Load a Monkeydo manifest from JSON via string or URL
	async load(manifest) {
		const errorPrefix = "MANIFEST_IMPORT_FAILED: ";
		let data;
		if(typeof manifest !== "string") {
			this.debug(manifest);
			throw new TypeError(errorPrefix + "Expected JSON or URL");
		}

		// Attempt to parse the argument as JSON
		try {
			data = JSON.parse(manifest);
		}
		catch {
			// If that fails, attempt to parse it as a URL
			try {
				manifest = new URL(manifest);
				const fetchManifest = await fetch(manifest);
				
				// If the URL parsed but the fetch response is invalid, give up and throw an error
				if(!fetchManifest.ok || fetchManifest.headers.get("Content-Type") !== "application/json") {
					throw new TypeError(errorPrefix + "Invalid response Content-Type or HTTP status");
				}
				data = await fetchManifest.json();
			}
			catch(error) {
				this.debug(manifest);
				if(!error instanceof TypeError) {
					throw new TypeError(errorPrefix + "Invalid JSON or URL");
				}
				throw error;
			}
		}
		
		// Make sure the parsed JSON is a valid Monkeydo manifest
		if(!data.hasOwnProperty("header") || !data.hasOwnProperty("body")) {
			this.debug(data);
			throw new Error(errorPrefix + "Expected 'header' and 'body' properties in object");
		}

		this.manifest.header = data.header;
		this.manifest.body = data.body;
		return true;
	}

	// Execute tasks from Monkeydo manifest
	async do() {
		const errorPrefix = "DO_FAILED: ";
		// Abort if the manifest object doesn't contain any header data
		if(!this.manifest.header) {
			this.debug(this.manifest.header);
			throw new Error(errorPrefix + `Expected header object from contructed property`);
		}

		// Hand over the loaded manifest to the MonkeyWorker task manager
		const monkey = this.giveManifest();
		monkey.then(() => this.play())
		.catch(error => {
			this.debug(error);
			throw new Error(errorPrefix + "Failed to post manifest to worker thread");
		});
	}
}