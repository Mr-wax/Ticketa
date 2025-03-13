import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import connectDB from "./SRC/Database/Db.js"
import router from "./SRC/Routes/IndexRoutes.js"




const app = express()

app.use(cors({origin:"*"}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use('/api', router)

const startServer = async () => {
    const PORT = process.env.PORT;
    // console.log(PORT)
     connectDB();
    try {  
    app.listen(PORT, () => {console.log (`TICKETA APP IS RUNNING ON PORT ${PORT}`);})
    } catch (error) {
        console.log(error);
    }
};

startServer();
app.get("/", (req, res) => {
    res.send('API IS RUNNING')
})