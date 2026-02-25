import { Memo } from "@/types/memo";

// Memo data will be populated from the backend.
// This module provides helper functions for accessing memos by ticker.
const sampleMemos: Memo[] = [];

export function getMemoById(id: string): Memo | undefined {
  return sampleMemos.find(memo => memo.id === id);
}

export function getMemosByTicker(ticker: string): Memo[] {
  return sampleMemos.filter(memo => memo.ticker?.toUpperCase() === ticker.toUpperCase());
}

export function getAllMemos(): Memo[] {
  return sampleMemos;
}
