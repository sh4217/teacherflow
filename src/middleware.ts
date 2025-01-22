import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware({
    authorizedParties: [
        "https://teacherflow.ai",
        "https://www.teacherflow.ai",
        "http://localhost:3000"
    ]
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|api/webhook/clerk|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Only run on specific API routes (excluding webhooks)
    '/api/((?!webhook/clerk).*)',
  ],
}
