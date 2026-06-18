import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import type { DirectMessage, Notification } from '../types'
import { useAuthStore } from '../store/authStore'

interface UseDMSocketOptions {
  conversationId: string | undefined
  onMessage?: (msg: DirectMessage) => void
}

interface UseNotificationSocketOptions {
  userId: string | undefined
  onNotification?: (n: Notification) => void
}

export function useDMWebSocket({ conversationId, onMessage }: UseDMSocketOptions) {
  const clientRef = useRef<Client | null>(null)
  const token = useAuthStore((s) => s.token)
  const stableOnMessage = useCallback(onMessage ?? (() => {}), [])

  useEffect(() => {
    if (!conversationId) return

    const client = new Client({
      webSocketFactory: () => new SockJS(window.location.origin + '/ws'),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/dm/${conversationId}`, (frame) => {
          try { stableOnMessage(JSON.parse(frame.body)) } catch { /* ignore */ }
        })
      },
    })

    client.activate()
    clientRef.current = client

    return () => { client.deactivate(); clientRef.current = null }
  }, [conversationId])

  const sendTyping = useCallback((userId: string, firstName: string) => {
    if (clientRef.current?.connected && conversationId) {
      clientRef.current.publish({
        destination: `/app/dm/${conversationId}/typing`,
        body: JSON.stringify({ userId, firstName }),
      })
    }
  }, [conversationId])

  return { sendTyping }
}

export function useNotificationSocket({ userId, onNotification }: UseNotificationSocketOptions) {
  const clientRef = useRef<Client | null>(null)
  const token = useAuthStore((s) => s.token)
  const stableOnNotification = useCallback(onNotification ?? (() => {}), [])

  useEffect(() => {
    if (!userId) return

    const client = new Client({
      webSocketFactory: () => new SockJS(window.location.origin + '/ws'),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/notifications/${userId}`, (frame) => {
          try { stableOnNotification(JSON.parse(frame.body)) } catch { /* ignore */ }
        })
      },
    })

    client.activate()
    clientRef.current = client

    return () => { client.deactivate(); clientRef.current = null }
  }, [userId])
}
