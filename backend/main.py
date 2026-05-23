import os

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
import openai

# Load environment variables
load_dotenv()

# FastAPI app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI/Nexus client
client = openai.OpenAI(
    api_key=os.getenv("NEXUS_API_KEY"),
    base_url="https://apidev.navigatelabsai.com"
)

# Request model
class PromptRequest(BaseModel):
    user_prompt: str

# Health endpoint
@app.get("/")
def home():
    return {"message": "Backend running successfully"}

# AI endpoint
@app.post("/run_task/")
async def run_task(req: PromptRequest):

    try:
        response = client.chat.completions.create(
            model="gemini-2.5-flash",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a personal AI tutor. "
                        "Explain concepts simply in short, "
                        "clear layman terms."
                    )
                },
                {
                    "role": "user",
                    "content": req.user_prompt
                }
            ]
        )

        return {
            "response": response.choices[0].message.content
        }

    except Exception as e:
        return {
            "error": str(e)
        }