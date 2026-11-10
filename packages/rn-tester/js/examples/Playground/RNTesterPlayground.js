/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {RNTesterModuleExample} from '../../types/RNTesterTypes';
import type {PointerEvent} from 'react-native';

import RNTesterText from '../../components/RNTesterText';
import * as React from 'react';
import {Button, StyleSheet, View} from 'react-native';

type Contact = {
  id: number,
  primary: boolean,
  down: number,
  move: number,
  up: number,
  cancel: number,
  lastX: number,
};

function Playground(): React.Node {
  const contacts = React.useRef<Map<number, Contact>>(new Map());
  const paused = React.useRef(false);
  const [summary, setSummary] = React.useState('No contacts recorded.');

  function down(event: PointerEvent) {
    const {pointerId, isPrimary, clientX} = event.nativeEvent;
    if (contacts.current.size >= 2) {
      return;
    }
    contacts.current.set(pointerId, {
      id: pointerId,
      primary: isPrimary,
      down: 1,
      move: 0,
      up: 0,
      cancel: 0,
      lastX: clientX,
    });
    if (contacts.current.size === 2 && !paused.current) {
      paused.current = true;
      for (const contact of contacts.current.values()) {
        contact.move = 0;
      }
      console.log(
        'Pointer moves: JS pause begins; move both contacts, then hold still.',
      );
      const deadline = Date.now() + 1500;
      while (Date.now() < deadline) {
        // Native pointer moves queue while JavaScript is busy.
      }
      console.log(
        'Pointer moves: JS pause ends; lift both contacts and show counts.',
      );
    }
  }

  function record(phase: 'move' | 'up' | 'cancel', event: PointerEvent) {
    const {pointerId, clientX} = event.nativeEvent;
    const contact = contacts.current.get(pointerId);
    if (contact != null) {
      contact[phase] += 1;
      contact.lastX = clientX;
    }
  }

  return (
    <View style={styles.container}>
      <RNTesterText>
        Hold two fingers on this view. The second down pauses JS for 1.5
        seconds. Move both fingers during the pause, hold still, then lift both
        fingers.
      </RNTesterText>
      <View
        collapsable={false}
        testID="pointer-target"
        onPointerDown={down}
        onPointerMove={event => record('move', event)}
        onPointerUp={event => record('up', event)}
        onPointerCancel={event => record('cancel', event)}
        style={styles.target}
      />
      <Button
        title="Show counts"
        onPress={() => {
          const values = [...contacts.current.values()];
          console.log(`Pointer moves: ${JSON.stringify(values)}`);
          setSummary(
            values
              .map(
                contact =>
                  `id=${contact.id} primary=${contact.primary}\ndown=${contact.down} move=${contact.move} up=${contact.up} cancel=${contact.cancel} x=${contact.lastX.toFixed(1)}`,
              )
              .join('\n'),
          );
        }}
      />
      <Button
        title="Clear after lifting both fingers"
        onPress={() => {
          contacts.current.clear();
          paused.current = false;
          setSummary('No contacts recorded.');
        }}
      />
      <RNTesterText testID="pointer-results">{summary}</RNTesterText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  target: {
    height: 300,
    marginVertical: 16,
    backgroundColor: 'skyblue',
  },
});

export default {
  title: 'Playground',
  name: 'playground',
  description:
    'Pointer moves from two contacts on the same view under JS load.',
  render: (): React.Node => <Playground />,
} as RNTesterModuleExample;
