"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user, loading, refreshUser } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Don't render login form if already authenticated (while redirecting)
  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }



const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // REQUIRED
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Invalid credentials");
      return;
    }

    await refreshUser(); // fetches /api/auth/me
    router.push("/");
  } catch {
    setError("Server error. Try again.");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold tracking-tight lg:text-3xl">MedixPro</h2>
          <p className="mt-2 text-gray-400">Healthcare administration simplified</p>
        </div>

        <Card className="border-gray-800 bg-gray-900">
          <CardHeader>
            <CardTitle className="text-xl text-white">Sign in to your account</CardTitle>
            <CardDescription className="text-gray-400">Enter your credentials to access the dashboard</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && <div className="rounded-md bg-red-900/20 p-3 text-sm text-red-400">{error}</div>}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300">
                  Username
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="name@clinic.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border-gray-800 bg-gray-800 pl-10 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-300">
                    Password
                  </Label>
                  <Link href="/auth/forgot-password" className="text-xs text-blue-400 hover:text-blue-300">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="border-gray-800 bg-gray-800 pl-10 text-white placeholder:text-gray-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-400"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  className="border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label htmlFor="remember" className="text-sm text-gray-300">
                  Remember me for 30 days
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
              {/*<p className="text-center text-sm text-gray-400">*/}
              {/*  Don't have an account?{" "}*/}
              {/*  <Link href="/auth/register" className="text-blue-400 hover:text-blue-300">*/}
              {/*    Create an account*/}
              {/*  </Link>*/}
              {/*</p>*/}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
