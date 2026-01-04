"use client";

import { Loader } from "@mantine/core";

export default function LoadingSystem() {
  return (
    <div className="text-center flex flex-col items-center justify-center min-h-lvh w-full bg-softWhite! fixed top-0 left-0 z-999999 backdrop-blur-sm">
      <Loader type="dots" color="#7439FA" size="xl"/>;
    </div>
  )
}
