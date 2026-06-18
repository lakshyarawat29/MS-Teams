import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import type { Message, TypingEvent } from '../types'
import { useAuthStore } from '../store/authStore'

interface ChannelEvent {
  type: string
  payload: unknown
}

interface UseWebSocketOptions {
  channelId: string | undefined
  onMessage: (message: Message) => void
  onTyping?: (event: TypingEvent) => void
  onChannelEvent?: (event: ChannelEvent) => void
  onConnect?: () => void
}

export function useWebSocket({
  channelId,
  onMessage,
  onTyping,
  onChannelEvent,
  onConnect,
}: UseWebSocketOptions) {
  const clientRef = useRef<Client | null>(null)
  const token = useAuthStore((state) => state.token)

  const stableOnMessage = useCallback(onMessage, [])
  const stableOnTyping = useCallback(onTyping ?? (() => {}), [])
  const stableOnChannelEvent = useCallback(onChannelEvent ?? (() => {}), [])
  const stableOnConnect = useCallback(onConnect ?? (() => {}), [])

  useEffect(() => {
    if (!channelId) return

    const client = new Client({
      webSocketFactory: () => new SockJS(window.location.origin + '/ws'),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      onConnect: () => {
        stableOnConnect()

        client.subscribe(`/topic/channel/${channelId}`, (frame) => {
          try {
            stableOnMessage(JSON.parse(frame.body) as Message)
          } catch { /* ignore */ }
        })

        client.subscribe(`/topic/channel/${channelId}/typing`, (frame) => {
          try {
            stableOnTyping(JSON.parse(frame.body) as TypingEvent)
          } catch { /* ignore */ }
        })

        client.subscribe(`/topic/channel/${channelId}/events`, (frame) => {
          try {
            stableOnChannelEvent(JSON.parse(frame.body) as ChannelEvent)
          } catch { /* ignore */ }
        })
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame)
      },
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
      clientRef.current = null
    }
  }, [channelId])

  const sendTyping = useCallback((event: TypingEvent) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: '/app/typing',
        body: JSON.stringify(event),
      })
    }
  }, [])

  return { sendTyping, client: clientRef }
}

