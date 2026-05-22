type MentionSegment = {
  text: string
  isMention: boolean
}

const EMPTY_MENTION_LABELS: string[] = []

function isBoundaryCharacter(value: string | undefined): boolean {
  return !value || /[\s.,!?;:()[\]{}'"/\\|-]/.test(value)
}

export function splitAgentTextWithMentions(text: string, mentionLabels: string[] = EMPTY_MENTION_LABELS): MentionSegment[] {
  if (!text) return []

  const normalizedLabels = Array.from(
    new Set(
      mentionLabels
        .flatMap((label) => {
          const normalizedLabel = label.trim()
          return normalizedLabel ? [`@${normalizedLabel}`] : []
        })
    )
  ).sort((a, b) => b.length - a.length)
  const exactLabelByLowercase = new Map(
    normalizedLabels.map((label) => [label.toLowerCase(), label]),
  )

  const segments: MentionSegment[] = []
  let buffer = ''
  let index = 0

  const flushBuffer = () => {
    if (!buffer) return
    segments.push({ text: buffer, isMention: false })
    buffer = ''
  }

  while (index < text.length) {
    const currentChar = text[index]

    if (currentChar !== '@' || !isBoundaryCharacter(text[index - 1])) {
      buffer += currentChar
      index += 1
      continue
    }

    const markupMatch = text.slice(index).match(/^@\[([^\]]+)\]/)
    if (markupMatch?.[0]) {
      flushBuffer()
      segments.push({ text: `@${markupMatch[1]}`, isMention: true })
      index += markupMatch[0].length
      continue
    }

    let exactLabel: string | undefined
    for (const [lowerLabel, label] of exactLabelByLowercase) {
      const candidate = text.slice(index, index + label.length)
      if (candidate.toLowerCase() === lowerLabel && isBoundaryCharacter(text[index + label.length])) {
        exactLabel = label
        break
      }
    }

    if (exactLabel) {
      flushBuffer()
      segments.push({ text: text.slice(index, index + exactLabel.length), isMention: true })
      index += exactLabel.length
      continue
    }

    const tokenMatch = text.slice(index).match(/^@[A-Za-z0-9._-]+/)
    if (tokenMatch?.[0]) {
      flushBuffer()
      segments.push({ text: tokenMatch[0], isMention: true })
      index += tokenMatch[0].length
      continue
    }

    buffer += currentChar
    index += 1
  }

  flushBuffer()
  return segments
}
