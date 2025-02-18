import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setCurrentItem} from '../redux/actions';
import {getMenu} from '../services/menu.service';
import {styles} from '../styles';
import {formatDateWithDay} from '../utils';

const MenuItem = ({
  id,
  when,
  meal1,
  meal2,
  meal3,
  meal4,
  meal5,
  setShowModal,
  home,
}) => {
  const settings = useSelector(state => state.settings);
  const dispatch = useDispatch();

  function handlePress() {
    const data = getMenu(id);
    dispatch(setCurrentItem(data));
    setShowModal(true);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPastDate = new Date(when) < today;
  const dynamicStyle = ({pressed}) => [
    styles.menuContainer,
    {opacity: pressed ? 0.8 : 1},
    isPastDate && !home && {opacity: pressed ? 0.2 : 0.3},
    home && {
      borderTopWidth: 0,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
    },
  ];

  return (
    <Pressable style={dynamicStyle} onPress={handlePress}>
      {!home && (
        <Text style={styles.when}>
          {formatDateWithDay(when, settings.language)}
        </Text>
      )}

      {meal1 && (
        <Text style={styles.what} numberOfLines={1} ellipsizeMode="head">
          {meal1}
        </Text>
      )}

      {meal2 && (
        <Text style={styles.what} numberOfLines={1} ellipsizeMode="head">
          {meal2}
        </Text>
      )}

      {meal3 && (
        <Text style={styles.what} numberOfLines={1} ellipsizeMode="head">
          {meal3}
        </Text>
      )}

      {meal4 && (
        <Text style={styles.what} numberOfLines={1} ellipsizeMode="head">
          {meal4}
        </Text>
      )}

      {meal5 && (
        <Text style={styles.what} numberOfLines={1} ellipsizeMode="head">
          {meal5}
        </Text>
      )}
    </Pressable>
  );
};

export default MenuItem;
