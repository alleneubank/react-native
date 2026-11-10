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
import type {HostComponent, PointerEvent, ViewProps} from 'react-native';

import RNTesterText from '../../components/RNTesterText';
import * as React from 'react';
import {
  Button,
  Platform,
  StyleSheet,
  View,
  requireNativeComponent,
} from 'react-native';

const NativeResetButton: ?HostComponent<ViewProps> =
  Platform.OS === 'ios'
    ? requireNativeComponent<ViewProps>('RNTPointerResetButton')
    : null;

type Phase = 'down' | 'move' | 'up' | 'cancel';
type Receipt = {
  phase: Phase,
  id: number,
  primary: boolean,
  count: number,
};

function Playground(): React.Node {
  const rows = React.useRef<Array<Receipt>>([]);
  const [summary, setSummary] = React.useState('No events recorded.');

  function record(phase: Phase, event: PointerEvent) {
    const {pointerId, isPrimary} = event.nativeEvent;
    const previous = rows.current[rows.current.length - 1];
    if (
      phase === 'move' &&
      previous?.phase === 'move' &&
      previous.id === pointerId &&
      previous.primary === isPrimary
    ) {
      previous.count += 1;
    } else if (rows.current.length < 16) {
      rows.current.push({phase, id: pointerId, primary: isPrimary, count: 1});
    }
  }

  return (
    <View style={styles.container}>
      <RNTesterText>
        iOS: hold one finger here, then press Reset pointers with another
        finger. Lift both, then start a lone contact. Its down, moves and up
        should be primary.
      </RNTesterText>
      <View
        collapsable={false}
        testID="pointer-target"
        onPointerDown={event => record('down', event)}
        onPointerMove={event => record('move', event)}
        onPointerUp={event => record('up', event)}
        onPointerCancel={event => record('cancel', event)}
        style={styles.target}
      />
      {NativeResetButton != null ? (
        <NativeResetButton
          testID="reset-pointer-handler"
          style={styles.reset}
        />
      ) : null}
      <Button
        title="Show events"
        onPress={() => {
          console.log(`Pointer reset: ${JSON.stringify(rows.current)}`);
          setSummary(
            rows.current
              .map(
                row =>
                  `${row.phase} id=${row.id} primary=${row.primary} count=${row.count}`,
              )
              .join('\n'),
          );
        }}
      />
      <Button
        title="Clear after lifting all fingers"
        onPress={() => {
          rows.current = [];
          setSummary('No events recorded.');
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
  reset: {
    height: 44,
    marginBottom: 16,
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
    'Primary touch ownership after an active iOS pointer-handler reset.',
  render: (): React.Node => <Playground />,
} as RNTesterModuleExample;
