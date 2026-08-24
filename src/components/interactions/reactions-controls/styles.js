import { useCallback } from 'react';
import { Text } from 'react-native';
import IconButtonComponent from '../../icon-button';
import ReactionsIcon from './reactions-icon';
import Colors from '../../../constants/colors';

const ReactionsButton = ({
  currentUserReaction, isOpen, accessibilityLabel, onPress
}) => {
  const hasReaction = !!currentUserReaction && currentUserReaction !== 'none';
  const isActive = hasReaction || isOpen;

  const renderReactionAsIcon = useCallback(({ size }) => (
    <Text style={{ fontSize: size * 0.75, lineHeight: size, textAlign: 'center' }}>
      {currentUserReaction}
    </Text>
  ), [currentUserReaction]);

  const renderReactionsIcon = useCallback(({ size, color }) => (
    <ReactionsIcon size={size} color={color} />
  ), []);

  return (
    <IconButtonComponent
      size={32}
      icon={hasReaction ? renderReactionAsIcon : renderReactionsIcon}
      iconColor={isActive ? Colors.white : Colors.lightGray300}
      containerColor={isActive ? Colors.lightBlue : Colors.lightGray200}
      accessibilityLabel={accessibilityLabel}
      animated
      onPress={onPress}
    />
  );
};

export default { ReactionsButton };
