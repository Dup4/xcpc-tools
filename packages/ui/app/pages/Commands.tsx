import React from 'react';
import { Button, Card, Divider, Group, Textarea, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';

export default function Commands() {
  const [command, setCommand] = React.useState('');

  const operation = async (op: string) => {
    try {
      const res = await (await fetch('/commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: op }),
      })).json();
      if (res.error) {
        notifications.show({ title: 'Error', message: `${res.error.message}(${res.error.params})`, color: 'red' });
        return;
      }
      notifications.show({ title: 'Success', message: 'Balloon Updated', color: 'green' });
    } catch (e) {
      console.error(e);
      notifications.show({ title: 'Error', message: 'Failed to update balloon', color: 'red' });
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Title order={3}>Send Commands to Monitoring Computer</Title>
      <Textarea
        label="Command"
        my="md"
        rows={10}
        cols={100}
        style={{ fontFamily: 'monospace' }}
        value={command}
        onChange={(ev) => setCommand(ev.target.value)}
      />
      <Group justify="center" my="md">
        <Button onClick={() => fetch('/commands', { method: 'POST', body: JSON.stringify({ command }) })}>Send</Button>
      </Group>
      <Divider my="md" />
      <Title order={3}>Quick Commands</Title>
      <Group my="md" justify="space-start">
        <Button onClick={() => operation('reboot')}>Reboot All</Button>
        <Button onClick={() => operation('set_hostname')}>Update Hostname</Button>
        <Button onClick={() => operation('show_ids')}>Show IDS</Button>
      </Group>
    </Card>
  );
}
