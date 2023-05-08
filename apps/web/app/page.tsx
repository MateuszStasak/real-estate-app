'use client';

import { Button } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import tw from "twin.macro";

const Container = tw.div`
flex flex-col items-center justify-center h-full 
text-white font-bold p-6
`;

export default async function Page() {
  const router = useRouter();

  return (
    <Container>
      <h1 className="text-5xl">Welcome to the Outer Space 🛰</h1>
      <Button
        data-testid="signup-link"
        variant="outline"
        className="mt-10 text-2xl"
        color="blue.300"
        onClick={() => router.push("/signup")}
      >
        Signup Now!
      </Button>
    </Container>
  );
}
