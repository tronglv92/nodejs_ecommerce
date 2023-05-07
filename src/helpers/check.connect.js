'use strict'

const mongoose=require('mongoose')
const os=require('os')
const _SECONDS=5000
// count Connect
const countConnect=()=>{
    const numConnection=mongoose.connections.length;
    console.log(`Number of connections::${numConnection}`)
}

// check over load
const checkOverload=()=>{
    setInterval(() => {
        const numConnection=mongoose.connections.length
        const numCores=os.cpus().length;
        const memoryUsage=process.memoryUsage().rss;
        // Examples maximum number of connections based on number of cores
        const maxConnections=numCores*5;

        console.log(`Active connections:${numConnection}`)
        console.log(`Memory usage:: ${memoryUsage/1024/1024} MB`)

        if(numConnection > maxConnections){
            console.log(`Connection overload detected!`)
        }
    }, _SECONDS);
}

module.exports = {
  countConnect,
  checkOverload,
};