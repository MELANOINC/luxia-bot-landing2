import os
from typing import List
from openai import OpenAI
from supabase import create_client
from ..config import settings


def build_client():
  return create_client(settings.supabase_url, settings.supabase_service_role or settings.supabase_anon_key)


def embed_texts(texts: List[str]) -> List[List[float]]:
  if not settings.openai_api_key:
    return [[0.0]*1536 for _ in texts]
  client = OpenAI(api_key=settings.openai_api_key)
  resp = client.embeddings.create(model=settings.openai_embedding_model, input=texts)
  return [d.embedding for d in resp.data]


def upsert_embeddings(rows: List[dict]):
  supa = build_client()
  supa.table(settings.supabase_embeddings_table).upsert(rows).execute()