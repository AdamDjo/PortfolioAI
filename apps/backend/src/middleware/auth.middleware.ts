import type { NextFunction, Request, Response } from 'express'

export interface AuthenticatedUser {
  id: string
  email: string
}

// Augment Express Request to carry the authenticated user
declare module 'express' {
  interface Request {
    user?: AuthenticatedUser
  }
}

export const requireAuth = (_req: Request, res: Response, next: NextFunction): void => {
  // TODO: validate JWT / Supabase session here
  // Example with Supabase:
  //
  // const token = req.headers.authorization?.replace('Bearer ', '')
  // if (!token) { res.status(401).json({ success: false, error: 'Unauthorized' }); return }
  //
  // const { data: { user }, error } = await supabase.auth.getUser(token)
  // if (error || !user) { res.status(401).json({ success: false, error: 'Unauthorized' }); return }
  //
  // req.user = { id: user.id, email: user.email! }
  // next()

  next() // remove this line once auth is implemented
}
