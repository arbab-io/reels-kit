import * as React from 'react';
import { Text } from 'react-native';

export interface GlyphProps {
  size?: number;
  color?: string;
}

function Glyph({
  children,
  size = 26,
  color = '#fff',
}: GlyphProps & { children: string }): React.ReactElement {
  return <Text style={{ color, fontSize: size }}>{children}</Text>;
}

export function MutedGlyph(props: GlyphProps): React.ReactElement {
  return <Glyph {...props}>{`🔇`}</Glyph>;
}

export function UnmutedGlyph(props: GlyphProps): React.ReactElement {
  return <Glyph {...props}>{`🔊`}</Glyph>;
}
