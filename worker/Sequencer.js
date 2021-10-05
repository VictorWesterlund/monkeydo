postMessage("MONKEDO_THREAD_SPAWNED");

onmessage = (message) => {
	console.log("Message received",message);
}