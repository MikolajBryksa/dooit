import React, {Component} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import RNRestart from 'react-native-restart';
import {logError} from '@/services/errors.service';
import i18next from '@/i18next';

export class ErrorBoundary extends Component<
  {children: React.ReactNode},
  {hasError: boolean}
> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError() {
    return {hasError: true};
  }

  componentDidCatch(error: Error) {
    logError(error, 'global_fatal_ui');
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>{i18next.t('error-boundary.title')}</Text>
          <Text style={styles.body}>{i18next.t('error-boundary.body')}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => RNRestart.restart()}>
            <Text style={styles.buttonText}>
              {i18next.t('error-boundary.button')}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  body: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#fff',
    height: 44,
    paddingHorizontal: 28,
    borderRadius: 22,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#111',
    fontSize: 15,
    fontWeight: '600',
  },
});
