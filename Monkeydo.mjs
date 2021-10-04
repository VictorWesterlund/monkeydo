import { default as MonkeyWorker } from "./classes/Worker.mjs";

export default class Monekydo {
	constructor(manifest = false) {
		this.monkeydo = {
			version: "0.1",
			debugLevel: 0,
			get debug() { 
				return this.debugLevel > 0 ? true : false;
			},
			set debug(flag = 1) { 
				this.debugLevel = flag;
			}
		};
		Object.seal(this.monkeydo);

		this.header = null;
		this.body = null;

		if(!window.Worker) {
			this.except("JavaScript Workers aren't supported by your browser");
		}
	}

	debug(attachment = "ATTACHMENT_EMPTY") {
		if(this.monkeydo.debug) {
			console.warn("-- Monkeydo debug -->",attachment);
			return;
		}
	}

	async load(manifest) {
		const errorPrefix = "MANIFEST_IMPORT_FAILED: ";
		let data;
		// Monkeydo can only load a JSON string or URL to a JSON file
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
		
		if(!data.hasOwnProperty("header") || !data.hasOwnProperty("body")) {
			this.debug(data);
			throw new Error(errorPrefix + "Object is not a Monkeydo manifest");
		}

		this.header = data.header;
		this.body = data.body;
		return true;
	}

	do() {
		const errorPrefix = "DO_FAILED: ";
		if(!this.header) {
			this.debug(this.header);
			throw new Error(errorPrefix + `Expected Monkeydo manifest, got '${this.header}' instead`);
		}
		const monkey = new MonkeyWorker();
	}
}