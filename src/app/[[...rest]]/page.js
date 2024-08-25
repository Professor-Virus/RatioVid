"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import LoginForm from "../components/LoginForm";
import Home from "../components/Home";
import { useRouter } from "next/navigation";

export default function Page() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      setIsLoading(false);
    }
  }, [isLoaded]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <LoginForm />;
  }

  return <Home />;
}