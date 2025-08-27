import { CloudClient } from "chromadb";
import 'dotenv/config'

const client = new CloudClient({
  apiKey: process.env.CHROMA_DB!,
  tenant: '49bc4c92-73e9-4862-a55f-3af066593019',
  database: 'brainly'
});
export default client

