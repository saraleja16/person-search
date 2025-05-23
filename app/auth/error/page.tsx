'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link';

function ErrorCard() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Authentication Error</CardTitle>
        <CardDescription>
          {error === 'Configuration' 
            ? 'There is a problem with the server configuration.'
            : 'An error occurred while trying to authenticate.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href="/auth/signin">
            Try Again
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default function ErrorPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Suspense fallback={
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      }>
        <ErrorCard />
      </Suspense>
    </div>
  )
}