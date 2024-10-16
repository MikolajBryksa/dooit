import React, {useState, useCallback, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {setHabits} from '../redux/actions';
import Goal from './Goal';
import {styles} from '../styles';
import 'react-native-gesture-handler';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import realm from '../storage/schemas';
import DraggableFlatList from 'react-native-draggable-flatlist';

const List = ({items, name}) => {
  const dispatch = useDispatch();
  const [data, setData] = useState(items);

  useEffect(() => {
    setData(items);
  }, [items]);

  const renderItem = useCallback(
    ({item, index, drag, isActive}) => {
      return (
        <Goal
          key={index}
          id={item.id}
          when={item.when}
          what={item.what}
          name={name}
          drag={drag}
          isActive={isActive}
        />
      );
    },
    [name],
  );

  const handleDragEnd = ({data}) => {
    const newData = data.map((item, index) => {
      return {...item, when: index + 1};
    });
    setData(newData);
    realm.write(() => {
      newData.forEach(item => {
        let habit = realm.objectForPrimaryKey('Habit', item.id);
        if (habit) {
          habit.when = item.when;
        }
      });
    });
    dispatch(setHabits(newData));
  };

  return (
    <GestureHandlerRootView style={styles.scrollView}>
      <DraggableFlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => `draggable-item-${item.id}`}
        onDragEnd={handleDragEnd}
      />
    </GestureHandlerRootView>
  );
};

export default List;
