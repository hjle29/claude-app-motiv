import { AppRegistry } from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { name: appName } = require('./app.json');
import App from './src/App';

AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
