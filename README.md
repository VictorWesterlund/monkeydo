<p align="center">
  <img width="400" src="https://storage.googleapis.com/public.victorwesterlund.com/github/VictorWesterlund/monkeydo/monkeydo_.svg"/>
</p>
<h3 align="center">Threaded task chaining for JavaScript</h3>
<hr>
<p align="center">Monkeydo uses the portable data format JSON to read tasks, making it easy to read by primates and machines alike.</p>
<table>
<td>
<pre lang="json">
{
  "tasks": [
    [0,"myJavaSriptMethod","someArgument","anotherArgument"]
  ]
}
</pre>
</td>
<td>
<table align="center">
  <tr>
    <th>Array key</th>
    <th>Description</th>
  </tr>
  <tr>
    <td align="center">0</td>
    <td><strong>Delay</strong><br>Wait this many milliseconds before running this task</td>
  </tr>
  <tr>
    <td align="center">1</td>
    <td><strong>Method</strong><br>Name of the JavaScript method to call</td>
  </tr>
  <tr>
    <td align="center">2+n</td>
    <td><strong>Arguments</strong><br>Some amount of arguments to pass to the method</td>
  </tr>
</table>
</td>
</table>
<h1 align="center">Use Monkeydo</h1>
<p>Monkeydo comes as an importable ECMAScript 6 module. In this guide we'll import this directly from a <i>./modules/</i> folder, but any web-accesible location will work.</p>
<ol>
  <li><strong>Import <code>Monkeydo</code> as an ES6 module</strong>
<pre lang="js">
import { default as Monkeydo } from "./modules/Monkeydo/Monkeydo.mjs";
</pre>
  </li>
  <li><strong>Define your JS methods in an object</strong>
<pre lang="js">
const methods = {
  myJavaScriptMethod: (foo,bar) => {
    console.log(foo,bar);
  }
}
</pre>
  </li>
  <li><strong>Define your tasks in a JSON manifest (file or JSON-compatible JavaScript)</strong>
<pre lang="json">
{
  "tasks": [
    [0,"myJavaSriptMethod","Just like a","monkey"],
    [1200,"myJavaSriptMethod","I've been","dancing"],
    [160,"myJavaSriptMethod","my whole","life"]
  ]
}
</pre>
  </li>
  <li><strong>Initialize and run <code>Monkeydo</code> with your methods and manifest</strong>
<pre lang="js">
const monkey = new Monkeydo(methods);
monkey.play(manifest);
</pre>
  </li>
</ol>
<p>The example above would be the same as running:</p>
<pre lang="js">
console.log("Just like a","monkey"); // Right away
console.log("I've been","dancing"); // 1.2 seconds after the first
console.log("my whole","life"); // and then 160 milliseconds after the second
</pre>
