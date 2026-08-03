import type { ErrorRequestHandler } from 'express'

interface HttpError {
  status?: number
  statusCode?: number
  message?: string
}

export const errorMiddleware: ErrorRequestHandler = (err: HttpError, _req, res, _next) => {
  const status = err.status ?? err.statusCode ?? 500
  const message = err.message ?? 'Internal server error'

  if (status >= 500) {
    console.error(err)
  }

  res.status(status).json({ success: false, error: message })
}
