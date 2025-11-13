import React from 'react';
import {Portal, Dialog, Button, Text} from 'react-native-paper';
import {logError} from '@/services/error-tracking.service';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false, error: null};
  }

  static getDerivedStateFromError(error) {
    return {hasError: true, error};
  }

  componentDidCatch(error, errorInfo) {
    const screen =
      errorInfo?.componentStack?.split('\n')[1]?.trim() || 'unknown';
    logError(error, screen);
  }

  handleRestart = () => {
    this.setState({hasError: false, error: null});
  };

  render() {
    if (this.state.hasError) {
      return (
        <Portal>
          <Dialog visible={true} dismissable={false}>
            <Dialog.Title>{this.props.t('error.title')}</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium">{this.props.t('error.message')}</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={this.handleRestart}>
                {this.props.t('error.restart')}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
