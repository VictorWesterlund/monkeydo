<p align="center">
  <img width="400" src="https://storage.googleapis.com/public.victorwesterlund.com/github/VictorWesterlund/monkeydo/monkeydo_.svg"/>
</p>
<h3 align="center">Multithreaded web animations and task chaining</h3>
<hr>
<p align="center">Execute general purpose JavaScript on cue with greater performance. Monkeydo is great, and designed for, complex DOM animations.</p>
<p align="center"><img src="https://storage.googleapis.com/public.victorwesterlund.com/github/VictorWesterlund/monkeydo/simple_demo.gif"/></a>
<table>
<td>
  <p align="center">Monkeydo JSON manifest<br><a href="#manifest-semantics">View semantics</a></p>
<pre lang="json">
{
    "tasks": [
        [2000,"moveTo",100,0],
        [1500,"setColor","red"],
        [2650,"setColor","blue"],
        [550,"moveTo",350,0]
    ]
}
</pre>
</td>
<td>
  <p align="center">Normal JavaScript</p>
<pre lang="js">
const methods = {
    element: document.getElementById("element"),
    moveTo: (x,y) => {
        methods.element.style.setProperty("transform",`translate(${x}%,${y}%)`);
    },
    setColor: (color) => {
        methods.element.style.setProperty("background-color",color);
    }
};
</pre>
</td>
</table>
<a href="https://victorwesterlund.github.io/monkeydo-demo/demo/simple_shapes">Open live demo</a>
<h1 align="center">Use Monkeydo</h1>
<p>Monkeydo comes as an ES6 module. In this guide we'll import this directly from a <i>./modules/</i> folder, but any location accessible by the importing script will work.</p>
<ol>
  <li><strong>Import <code>Monkeydo</code> as an ESM</strong>
<pre lang="js">
import { default as Monkeydo } from "./modules/Monkeydo/Monkeydo.mjs";
</pre>
  </li>
  <li><strong>Define your JS methods in an object</strong>
<pre lang="js">
const methods = {
  singForMe: (foo,bar) => {
    console.log(foo,bar);
  }
}
</pre>
  </li>
  <li><strong>Define your tasks in a JSON manifest (file or JSON-compatible JavaScript)</strong>
<pre lang="json">
{
  "tasks": [
    [0,"singForMe","Just like a","monkey"],
    [1200,"singForMe","I've been","dancing"],
    [160,"singForMe","my whole","life"]
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
<h1>Manifest Semantics</h1>
<p>The JS passed to the Monkeydo constructor is executed by the initiator thread (ususally the main thread) when time is up. Which method and when is defined in a JSON file or string with the following semantics:</p>
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
    <td><strong>Delay</strong><br>Wait this many milliseconds before running this method</td>
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
