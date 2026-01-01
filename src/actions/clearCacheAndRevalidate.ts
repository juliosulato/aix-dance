"use server";

import { revalidatePath } from 'next/cache';

export async function clearCacheAndRevalidate(path: string) {
  revalidatePath(path);
}