# kafka-json-consumer
This is a node.js based command line Apache Kafka consumer. After connecting to the kafka server, it consumes messages from given topic and converts the JSON payload to Javascript object. The payload (value) of the consumed message is provided as a variable named `msg`. The Kafka message itself is provided as a variable named `kafkaMsg`. These variables are use to prepare the output for the consumed message given with `--path or -p` argument. 

## Installation
```
npm install
```
or
```
npm install -g
```

## Usage
Sample commands are listed below:
* Basic usage:
```
> kafka-json-consumer -h localhost:2181 -t test_topic -p "msg.title,msg.total"
```
Sample output:
```
title1 15
title2 25
title3 35
```

* Usage with formatter:
```
> kafka-json-consumer -h localhost:2181 -t test_topic -p "msg.title,msg.total" -f "%s|%s"
```

Sample output:
```
title1|15
title2|25
title3|35
```

