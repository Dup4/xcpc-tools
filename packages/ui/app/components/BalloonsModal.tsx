import {
  Accordion,
  ActionIcon,
  Button, Center, ColorInput, Fieldset, Group, Modal, Text,
  ThemeIcon, Tooltip,
} from '@mantine/core';
import { useClipboard, useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconCopy, IconX } from '@tabler/icons-react';
import React, { useState } from 'react';
import { getBalloonName } from '@hydrooj/xcpc-tools/utils/color';

export function BalloonsClient({ clients }) {
  const [opened, { open, close }] = useDisclosure(false);
  const clipboard = useClipboard();

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="Clients"
        size="md"
        padding="md"
      >
        <Fieldset legend="Clients" mb="lg">
          <Accordion>
            {clients.map((item) => (
              <Accordion.Item key={item.id} value={item.name}>
                <Accordion.Control
                  icon={(<Tooltip label={item.updateAt && item.updateAt > new Date().getTime() - 1000 * 60 ? 'Online' : 'Offline'}>
                    <ThemeIcon radius="xl" size="sm" color={item.updateAt ? 'green' : 'red'}>
                      { item.updateAt ? (<IconCheck />) : (<IconX />)}
                    </ThemeIcon>
                  </Tooltip>)}
                >
                  <Tooltip label={`${item.name}(${item.id})`}>
                    <Text>{item.name}({item.id})</Text>
                  </Tooltip>
                </Accordion.Control>
                <Accordion.Panel>
                  <Group justify="center" gap="md">
                    <Text>ID: {item.id}</Text>
                    <Tooltip label="Copy ID">
                      <ActionIcon variant="transparent" color="blue" aria-label='Copy ID' ml="xs" onClick={() => {
                        clipboard.copy(item.id);
                        notifications.show({ title: 'Success', message: 'ID Copied to clipboard!', color: 'green' });
                      }}><IconCopy /></ActionIcon>
                    </Tooltip>
                  </Group>
                  { !item.updateAt ? (
                    <Center mt="md">
                      <Text c="dimmed">Have not connected yet</Text>
                    </Center>
                  ) : (
                    <>
                      <Text>IP: {item.ip}</Text>
                      <Text>Updated At: {new Date(item.updateAt).toLocaleString()}</Text>
                    </>
                  )}
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </Fieldset>
      </Modal>
      <Button color="blue" radius="md" onClick={open}>Client Info</Button>
    </>
  );
}

export function BallonColorChecker() {
  const [opened, { open, close }] = useDisclosure(false);
  const [value, setValue] = useState('');

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => { close(); }}
        title="Clients"
        size="md"
        padding="md"
      >
        <Fieldset legend="Color Checker" mb="lg">
          <ColorInput value={value} onChange={setValue} />
          <Text mt="md">Color: {getBalloonName(value)}</Text>
          <Text mt="md">颜色: {getBalloonName(value, 'zh')}</Text>
        </Fieldset>
      </Modal>
      <Button color="blue" radius="md" onClick={open}>Color Checker</Button>
    </>
  );
}
