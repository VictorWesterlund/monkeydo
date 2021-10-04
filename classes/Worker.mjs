export default class MonkeyWorker extends Worker {
	constructor() {
		super();
		onmessage = (message) => this.instruction(message);
	}

	instruction(message) {
		console.log(message);
	}
}