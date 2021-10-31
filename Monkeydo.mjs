import { default as MonkeyWorker } from "./do/MonkeyManager.mjs";

export default class Monkeydo extends MonkeyWorker {
	constructor(methods = {}) {
		super(methods);
		this.monkeydo = {
			version: "0.2.1",
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
			tasks: null
		};

		if(!window.Worker) {
			throw new Error("JavaScript Workers aren't supported by your browser");
		}
	}

	debug(...attachments) {
		if(this.monkeydo.debug) {
			console.warn("-- Monkeydo debug -->",attachments);
			return;
		}
	}

	// Loop playback; -1 or false = infinite
	loop(times = -1) {
		// Typecast boolean to left shifted integer;
		if(typeof times === "boolean") {
			times = times ? -1 : 0;
		}
		times = times < 0 ? -1 : times;
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
				if(!fetchManifest.ok || !fetchManifest.headers.get("Content-Type")?.includes("application/json")) {
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
		if(!data.hasOwnProperty("tasks")) {
			this.debug(data);
			throw new Error(errorPrefix + "Expected 'header' and 'body' properties in object");
		}

		this.manifest.tasks = data.tasks;
		return true;
	}

	// Execute tasks from Monkeydo manifest
	do() {
		// Hand over the loaded manifest to the MonkeyWorker task manager
		this.giveManifest().then(() => this.play());
	}
}