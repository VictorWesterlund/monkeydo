// Dedicated worker which executes tasks from a Monkeydo manifest

class Monkey {
	constructor(manifest) {
		const self = this;

		this.tasks = manifest.tasks;
		this.tasksLength = this.tasks.length - 1;

		this.flags = {
			playing: 0,
			stacking: 0, // Subsequent calls to play() will build a queue (jQuery-style)
			loop: 0, // Loop n times; <0 = infinite
			_forwards: 1, // Playback direction
			set forwards(forwards = true) {
				if(forwards == this._forwards) {
					return false;
				}
				// Toggle playback direction
				self.tasks = self.tasks.reverse();
				this._forwards = 1 - this._forwards;
			},
			get forwards() {
				return this._forwards;
			}
		}

		this.i = 0; // Manifest iterator index
		this.queue = {
			task: null,
			next: null
		}
		Object.seal(this.queue);
	}

	// Pass task to main thread for execution
	run(task) {
		postMessage(["TASK",task]);
		this.i++;
	}

	// Interrupt timeout and put monkey to sleep
	interrupt() {
		clearTimeout(this.queue.task);
		clearTimeout(this.queue.next);
		this.queue.task = null;
		this.queue.next = null;
		this.flags.playing = 0;
	}

	play() {
		// Stack playback as loops if flag is set
		if(this.flags.playing) {
			if(this.flags.stacking && this.flags.loop >= 0) {
				this.flags.loop++;
			}
			return;
		}
		this.queueNext();
	}

	// Schedule task for execution by index
	queueNext() {
		this.flags.playing = 1;
		const data = this.tasks[this.i];
		const task = {
			wait: data[0],
			func: data[1],
			args: data.slice(2)
		};

		// Schedule the current task to run after the specified wait time
		this.queue.task = setTimeout(() => this.run(task),task.wait);

		// We're out of tasks to schedule..
		if(this.i >= this.tasksLength) {
			this.i = -1;
			// Exit if we're out of loops
			if(this.flags.loop === 0) {
				this.flags.playing = 0;
				return false;
			}
			
			// Decrement loop iterations if not infinite (negative int)
			if(this.flags.loop > 0) {
				this.flags.loop--;
			}
		}

		// Run this function again when the scheduled task will fire
		this.queue.next = setTimeout(() => this.queueNext(),task.wait);
	}
}

// Event handler for messages received from initiator
onmessage = (message) => {
	const type = message.data[0] ? message.data[0] : message.data;
	const data = message.data[1];

	switch(type) {
		// Attempt to load manfiest provided by initiator thread
		case "GIVE_MANIFEST":
			try {
				this.monkey = new Monkey(data);
				postMessage(["RECEIVED_MANIFEST","OK"]);
			}
			catch(error) {
				postMessage(["RECEIVED_MANIFEST",error]);
			}
			break;

		case "SET_PLAYING":
			if(data === true) {
				this.monkey.play();
				return;
			}
			this.monkey.interrupt();
			break;

		case "GET_FLAG":
			const flag = this.monkey.flags[data];
			postMessage(parseInt(flag));
			break;

		case "SET_FLAG":
			this.monkey.flags[data[0]] = data[1];
			break;

		default: return; // No op
	}
}