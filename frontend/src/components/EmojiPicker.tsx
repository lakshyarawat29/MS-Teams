import { useState } from 'react'
import { Box, Typography } from '@mui/material'

const EMOJI_CATEGORIES: Record<string, string[]> = {
  Smileys: [
    '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊','😇','🥰','😍','🤩','😘',
    '😙','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑',
    '😶','😏','😒','🙄','😬','😌','😔','😪','😴','😷','🤒','🤕','🤢','🤧','🥵',
    '🥶','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐',
  ],
  Gestures: [
    '👍','👎','👌','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','👋','✋',
    '🖖','👏','🙌','🤝','🙏','💪','🤲','👐','🫶',
    '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','💕','💞','💓','💗','💖','💘','💝',
  ],
  Nature: [
    '🌸','🌺','🌹','🌻','🌼','💐','🍀','🌿','🌱','🌲','🌳','🌴','🌵','🍁','🍂',
    '🍃','🌾','🌷','☀️','🌤️','⛅','🌧️','⛈️','❄️','⛄','🌊','🌈','🌙','⭐','🌟',
    '💫','✨','⚡','🔥','🌪️','🦋','🐝','🐞','🦊','🐼','🐨','🦁','🐯','🦄','🐬',
  ],
  Food: [
    '🍎','🍊','🍋','🍇','🍓','🫐','🍒','🥑','🍕','🍔','🌮','🌯','🍜','🍣','🍱',
    '🍛','🍝','🥗','🍦','🎂','🍰','🧁','🍩','🍪','🍫','🍬','🍭','☕','🧃','🍺',
    '🍷','🥂','🍸','🧋',
  ],
  Activity: [
    '⚽','🏀','🏈','⚾','🎾','🏐','🎱','🏓','⛳','🎣','🎮','🕹️','🎲','🎯','🎭',
    '🎨','🎬','🎤','🎧','🎼','🎹','🎸','🏆','🥇','🥈','🥉','🎖️','🏅','🚀','✈️',
    '🚗','🚢','🎡','🎢','🎠','🎪',
  ],
  Objects: [
    '💡','🔧','🔨','🔑','🔒','💰','💎','📱','💻','⌨️','📸','📦','✉️','🎁','🎉',
    '🎊','🔔','📢','🔮','🪄','⚗️','🔭','🔬','📡','🩺','💉','🩹','🪞','🕯️','🖼️',
    '🧲','🪛','🔩','📏','📐','✂️','🖊️','📝','📚','🗂️',
  ],
}

const CATEGORY_ICONS: Record<string, string> = {
  Smileys: '😀',
  Gestures: '👍',
  Nature: '🌿',
  Food: '🍕',
  Activity: '⚽',
  Objects: '💡',
}

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
}

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [tab, setTab] = useState(0)
  const [search, setSearch] = useState('')

  const categories = Object.keys(EMOJI_CATEGORIES)
  const displayEmojis = search.trim()
    ? Object.values(EMOJI_CATEGORIES).flat()
    : EMOJI_CATEGORIES[categories[tab]]

  return (
    <Box
      sx={{
        width: 290,
        bgcolor: '#1E1E2E',
        borderRadius: 2,
        border: '1px solid rgba(205,214,244,0.14)',
        overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(0,0,0,0.55)',
      }}
    >
      {/* Search */}
      <Box sx={{ p: 1, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search emoji…"
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6,
            padding: '5px 10px',
            color: '#CDD6F4',
            fontFamily: 'inherit',
            fontSize: 12,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </Box>

      {/* Category tabs */}
      {!search.trim() && (
        <Box sx={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {categories.map((cat, i) => (
            <Box
              key={cat}
              onClick={() => setTab(i)}
              title={cat}
              sx={{
                flex: 1,
                textAlign: 'center',
                py: 0.75,
                cursor: 'pointer',
                fontSize: 16,
                borderBottom: tab === i ? '2px solid #7C7FD4' : '2px solid transparent',
                opacity: tab === i ? 1 : 0.4,
                '&:hover': { opacity: 0.85 },
                transition: 'opacity 0.15s',
                userSelect: 'none',
              }}
            >
              {CATEGORY_ICONS[cat]}
            </Box>
          ))}
        </Box>
      )}

      {/* Category label */}
      {!search.trim() && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            px: 1.5,
            pt: 0.75,
            pb: 0.25,
            color: 'text.secondary',
            fontSize: '0.68rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontWeight: 600,
          }}
        >
          {categories[tab]}
        </Typography>
      )}

      {/* Emoji grid */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          p: 0.5,
          maxHeight: 196,
          overflowY: 'auto',
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2 },
        }}
      >
        {displayEmojis.map((emoji, i) => (
          <Box
            // eslint-disable-next-line react/no-array-index-key
            key={`${emoji}-${i}`}
            onClick={() => onSelect(emoji)}
            sx={{
              fontSize: 19,
              cursor: 'pointer',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1,
              '&:hover': { bgcolor: 'rgba(124,127,212,0.22)' },
              transition: 'background 0.1s',
              userSelect: 'none',
            }}
          >
            {emoji}
          </Box>
        ))}
      </Box>
    </Box>
  )
}
