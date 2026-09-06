/**
 * @format
 */

// Must be the first import in the app: react-native-screens and
// @gorhom/bottom-sheet both attach to the gesture handler root, and loading it
// late leaves gestures dead on Android with no error to explain why.
import 'react-native-gesture-handler';

import { AppRegistry } from 'react-native';
import App from './src/app/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
