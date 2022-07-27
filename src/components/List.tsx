import {Group, ScrollArea} from '@mantine/core';
import useThemeValue from 'lib/hooks/useThemeValue';
import {ReactNode} from 'react';

export default function List({
  items,
  children,
  height = 200
}: { items: unknown[], children(item): ReactNode, height?: number }) {
  const {value, colorValue} = useThemeValue();
  return (
    <ScrollArea scrollbarSize={4} style={{
      maxHeight: height,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {items.map((item, i) => (
        <Group position='apart' py={6} px='sm' sx={theme => ({
          background: value('white', theme.colors.dark[7]), cursor: 'default', '&:hover': {
            background: colorValue('dark', 0, 6)
          }
        })} key={i}>
          {children(item)}
        </Group>
      ))}
    </ScrollArea>
  );
}
