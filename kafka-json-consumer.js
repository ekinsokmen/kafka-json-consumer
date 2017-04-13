#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "$0" "$@"
// shebang credit to http://unix.stackexchange.com/a/65295

const vm = require('vm');
const util = require('util');
const kafka = require('kafka-node');
const cmd = require('commander');

cmd
  .version('1.0.0')
  .option('-h, --host <host>', 'Kafka host to connect e.g. localhost:2181')
  .option('-t, --topic <topic>', 'Topic to consume')
  .option('-p, --paths <paths>', 'Comma separated selectors of "msg" object (object paths) e.g. "msg.data, msg.name"')
  .option('-f, --format [format]', 'Optional output format as defined in util package e.g. "%s|%s"')
  .option('-g, --groupId [groupId]', 'Optional group id')
  .option('-n, --convertNumbers', 'Convert integer numbers to string. This is a workaround to support 64-bit numbers (long, big-integers). If this flag is not used Javascript will round them while converting json to object.')
  .action(cmd.action)
  .parse(process.argv);

const host = cmd.host || cmdHelp("host argument is required.");
const topic = cmd.topic || cmdHelp("topic argument is required.")
const groupId = cmd.groupId || 'kafka-json-consumer-' + Math.random() * 1000000;
const jsonPathNames = cmd.paths || cmdHelp("Javascript object selectors are required.");
const outputFormat = cmd.format;
const formatWrapper = outputFormat ? util.format('util.format("%s", %s)', outputFormat, jsonPathNames) : util.format('util.format(%s)', jsonPathNames);
const outputWrapper = util.format('out=%s', formatWrapper);
const outputScript = new vm.Script(outputWrapper);
const convertNumbersToString = cmd.convertNumbers;

const consumer = new kafka.ConsumerGroup(
  {
    host: host,
    groupId: groupId,
    fromOffset: 'latest',
  },
  topic
);

consumer.on('message', function (message) {
  var jsonStr = message.value;
  if (convertNumbersToString) {
  	jsonStr = jsonStr.replace(/(:)([\d]+)([,\}])/g, "$1\"$2\"$3");
  }
  var msg = JSON.parse(jsonStr) || {};
  var sandbox = {
    'out' : '',
    'msg' : msg,
    'kafkaMsg' : message,
    'util' : util
  }
  const context = new vm.createContext(sandbox);
  outputScript.runInContext(context);
  console.log(sandbox.out);
});

consumer.on('error', function (err){
  console.log(err);
});

function cmdHelp(msg) {
  console.log(msg);
  cmd.help();
}
