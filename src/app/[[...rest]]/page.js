"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import LoginForm from "../components/LoginForm";
import Home from "../components/Home";
import { useRouter } from "next/navigation";

export default function Page() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [paidRoute, setPaidRoute] = useState(null);
  const router = useRouter();

  if (!isLoaded || !isSignedIn) {
    return <LoginForm />;
  }

  return (
    <Home/>
  );
}
