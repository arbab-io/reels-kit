import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DemoFeedScreen from './DemoFeedScreen';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <DemoFeedScreen />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
