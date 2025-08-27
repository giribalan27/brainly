import { Router } from "express";
import client from "./chroma"; 
import { pipeline } from "@xenova/transformers";
import {v4 as uuidv4} from "uuid"

export const searchRouter = Router()
const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2") 

async function createEmbedding(text : string) {
    const ouput = await embedder(text, {pooling: "mean", normalize: true})
    return Array.from(ouput.data)
}

async function getCollection(name = "brainly") {
  return await client.getOrCreateCollection({ name });
}

export async function createDocument(data : string) {
    try {
        const collection = await getCollection();

        await collection.add({
            ids: [uuidv4()],
            documents: [data],

        })
        console.log("inserted successfully");
    }
    catch (e) {
        console.log(e);
    }
}

searchRouter.get("/api/v1/search/:query", async (req, res) => {
    const data = req.params.query;
    console.log(data);
    try {
        const collection = await getCollection() 
        const response = await collection.query({
            queryTexts: [data],
            nResults: 4
        })
        res.status(200).json({
            success: true,
            documents: response.documents[0]
        })
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            msg: "server error",
        });
    }
})
