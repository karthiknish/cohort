'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

export type CodeSyntaxHighlighterProps = {
  language: string;
  code: string;
};

const codeStyle = {
  margin: 0,
  padding: '1rem',
  background: 'transparent',
  fontSize: '13px',
  lineHeight: '1.5',
};

const codeTagProps = {
  className: 'font-mono',
};

export function CodeSyntaxHighlighterImpl({ language, code }: CodeSyntaxHighlighterProps) {
  return (
    <SyntaxHighlighter
      style={oneLight}
      language={language}
      PreTag="div"
      customStyle={codeStyle}
      codeTagProps={codeTagProps}
    >
      {code}
    </SyntaxHighlighter>
  );
}
