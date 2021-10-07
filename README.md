<p align="center">
  <img width="400" src="https://storage.googleapis.com/public.victorwesterlund.com/github/VictorWesterlund/monkeydo/monkeydo.svg"/>
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
  <li>Import <code>Monkeydo</code> from your repo clone or download
<pre lang="js">
import { default } from "./modules/Monkeydo/Monkeydo.mjs";
</pre>
  </li>
    <li>Define your JS methods
<pre lang="js">
const methods = {
  myJavaScriptMethod: (foo,bar) => {
    console.log(foo,bar);
  }
}
</pre>
  </li>
  <li>Define your tasks in a JSON file (or directly in JavaScript)
<pre lang="json">
{
  "tasks": [
    [0,"myJavaSriptMethod","I see skies of","blue"],
    [300,"myJavaSriptMethod","red","roses too"],
    [160,"myJavaSriptMethod","I see them","bloom"],
    [1200,"myJavaSriptMethod","for","me and you"]
  ]
}
</pre>
  </li>
  <li>Initialize and run <code>Monkeydo</code> with your methods and manifest
<pre lang="js">
const monkey = new Monkeydo(methods,manifest);
monkey.do();
</pre>
  </li>
</ol>
<p>The example above would be the same as running:</p>
<pre lang="js">
console.log("I see skies","of blue"); // Right away
console.log("red","roses too"); // 300 milliseconds after the first
console.log("I see them","bloom"); // 160 milliseconds after that one
console.log("for","me and you"); // and lastly, 1200 after that
</pre>
