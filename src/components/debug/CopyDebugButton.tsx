import { useState } from 'react'
import Button from '@mui/material/Button'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'

export function CopyDebugButton({
  label,
  getText,
  size = 'small',
}: {
  label: string
  getText: () => string
  size?: 'small' | 'medium'
}) {
  const [copied, setCopied] = useState(false)

  return (
    <Button
      size={size}
      variant="text"
      startIcon={<ContentCopyOutlinedIcon sx={{ fontSize: '0.9rem !important' }} />}
      onClick={(e) => {
        e.stopPropagation()
        void navigator.clipboard.writeText(getText()).then(() => {
          setCopied(true)
          window.setTimeout(() => setCopied(false), 1500)
        })
      }}
      sx={{ minWidth: 0, fontSize: '0.65rem', py: 0.25 }}
    >
      {copied ? 'Copied' : label}
    </Button>
  )
}
