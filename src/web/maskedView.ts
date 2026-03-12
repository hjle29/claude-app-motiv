// Web mock for @react-native-masked-view/masked-view
// MaskedView is not supported on web; render children directly
import React from 'react';

type MaskedViewProps = {
  maskElement: React.ReactElement;
  children: React.ReactNode;
  style?: object;
};

const MaskedView = ({ children, style }: MaskedViewProps) =>
  React.createElement(React.Fragment, null, children);

export default MaskedView;
