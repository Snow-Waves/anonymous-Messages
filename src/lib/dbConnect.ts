import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number;
}

// This is to prevent multiple connections to the database
// can keep it empty because isConnected will be undefined if there is no connection  
const connection: ConnectionObject = {};

// Promise<void> - the fuction returns a promise, and void means we don't care about the return value of the promise.
async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log("Already connected to the database");
        return;
    } 
    try {
        // chech how we were working with env in react. In next env variables are available in process.env. We can access them using process.env.VARIABLE_NAME
        const db = await mongoose.connect(process.env.MONGODB_URI as string);
        // console.log("Database connection successful\n", db );
        connection.isConnected = db.connections[0].readyState; 
        // console.log("Connections:", db.connection);       
        console.log("\nSuccessfully connected to the database\n");

    } catch (error) {
        console.error("Error connecting to the database", error);  
        process.exit(1); // Exit the process with an error code
    }
}

export default dbConnect;