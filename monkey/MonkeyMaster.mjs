// Task manager for Monkeydo dedicated workers (monkeys)

class WorkerTransactions {
	constructor() {
		this.txn = {
			_open: [], // Open transations
			prefix: "TXN",
			timeout: 2000,
			// Close a transaction
			set close(name) {
				this._open[name].resolve();
			},
			// Open a new transaction
			set open(name) {
				name = [this.prefix,name];
				name = name.join("_").toUpperCase();
				this._open[name] = new Promise();
			},
			get status(name) {
				return this._open[name];
			}
		}
	}
}

export default class MonkeyMaster extends WorkerTransactions {
	constructor() {
		super();
		// Spawn dedicated worker
		this.monkey = new Worker("Monkey.js");
		this.monkey.addEventListener("message",message => this.receive(message.data));

		if(this?.crossOriginIsolateds === true) {
			// TODO; SharedArrayBuffer goes here
		}
	}

	send(data) {
		this.monkey.postMessage(data);
		return true;
	}

	async receive(data) {
		if(data[0] === "TASK") {
			this.do(data[1]);
			return;
		}
		this.txn.close = data[1];
	}

	async transaction(name,data) {
		this.txn.open = name;
		const send = this.send([this.txn.prefix,name,data]);
	}
}