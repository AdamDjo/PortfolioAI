import { create } from 'zustand'

interface ChatRequest {
  /** Text to place in the input; empty when the visitor only asked to start. */
  question: string
  /** Bumped on every request, so asking the same question twice still fires. */
  id: number
}

interface ChatBridgeState {
  request: ChatRequest | null
  ask: (question?: string) => void
}

/**
 * Lets the home page's shortcuts drive the hero chat.
 *
 * The suggested prompts and the rail's assistant entry sit in other sections
 * than the chat input. A store lets each of them stay a small client island
 * instead of wrapping the whole page in one client component to share a ref.
 *
 * Module-level on purpose: it is only ever written by a click, so no server
 * render reads it and no request can leak state into another.
 */
export const useChatBridge = create<ChatBridgeState>((set) => ({
  request: null,
  ask: (question = '') =>
    set((state) => ({ request: { question, id: (state.request?.id ?? 0) + 1 } })),
}))
