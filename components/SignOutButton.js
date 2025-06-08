'use client';
import { auth } from "../lib/firebase"; 
import { signOut } from "firebase/auth";
import { useRouter } from 'next/navigation'; 

export default function SignOutButton() {
  const router = useRouter(); 

  const handleSignOut = async () => { 
    try {
      await signOut(auth); 
      console.log("Signed out successfully.");
      router.push("/"); 
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
    >
      Sign Out
    </button>
  );
}
