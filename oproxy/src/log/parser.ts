import * as fs from 'node:fs';
import * as readline from 'node:readline';

// Constructor Call {"objName":"createCipheriv","target":"crypto","prop":"createCipheriv","args":["aes-256-gcm","potatopotatopotatopotatopotatopo","beetroot"]}
export interface ConstructorCall {
  type: 'constructor';
  objName: string;
  id: number;
  target: string;
  fn: string;
  args: any[];
}

// Function Call {"id":0,"target":{"_decoder":null},"prop":"final","args":[]}
export interface FunctionCall {
  type: 'function';
  id: number | null;
  target: any;
  fn: string;
  args: any[];
}

export interface StaticCall extends FunctionCall {
  id: null;
}

export interface ConstructedObject {
  id: number;
  objName: string; // name of the object / (which constructor it was created with)
  functionCalls: FunctionCall[]; // list of function calls made on this object
  args: any[]; // arguments it was constructed with
}

export type LogEntry = ConstructorCall | FunctionCall | StaticCall;

async function processLineByLine(filePath: string, verbose = false) {
  const fileStream = fs.createReadStream(filePath);

  // list of LogEntrys
  const logEntries: LogEntry[] = [];

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const call = JSON.parse(line) as ConstructorCall | FunctionCall;
    logEntries.push(call);
  }

  if (verbose) {
    console.log('Finished reading log entries.');
  }

  return logEntries;
}

function processLogEntries(logEntries: LogEntry[]) {
  // Process log entries to extract the objects

  // list of objects
  const objects: ConstructedObject[] = [];

  // map of object types to list of objects ids
  const objectTypes: Record<string, number[]> = {};

  // store static function calls in list
  const staticFunctionCalls: StaticCall[] = [];

  // map of static function calls by which module they are called from
  const staticFunctionCallsByModule: Record<string, StaticCall[]> = {};

  logEntries.forEach((entry) => {
    // if entry is a constructor
    if (entry.type === 'constructor') {
      // create a new object
      const obj: ConstructedObject = {
        id: entry.id,
        objName: entry.objName,
        functionCalls: [],
        args: entry.args,
      };

      // add to list of objects
      objects.push(obj);

      // construct a map entry if it doesn't exist
      if (!objectTypes[entry.objName]) {
        objectTypes[entry.objName] = [];
      }

      // add this object to the list of objects of this type
      objectTypes[entry.objName].push(entry.id);
    }
    // if entry is a function, add it to list of function calls for corresponding object
    else if (entry.type === 'function' && entry.id !== null) {
      entry = entry as FunctionCall;
      const obj = objects[entry.id!];
      obj.functionCalls.push(entry);
    } else {
      // static function call
      staticFunctionCalls.push(entry as StaticCall);

      // construct a map entry if it doesn't exist
      if (!staticFunctionCallsByModule[entry.target]) {
        staticFunctionCallsByModule[entry.target] = [];
      }
    }
  });

  return { objects, objectTypes, staticFunctionCalls, staticFunctionCallsByModule };
}

export async function processLog(filePath: string) {
  const logEntries: LogEntry[] = await processLineByLine(filePath);
  return { logEntries: logEntries, results: processLogEntries(logEntries) };
}

export default { processLog };
