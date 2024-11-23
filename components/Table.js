import React from 'react';
import {ScrollView} from 'react-native';
import TableItem from './TableItem';
import {styles} from '../styles';

const Table = ({items, name}) => {
  return (
    <ScrollView style={styles.scrollView}>
      {items.map((item, index) => (
        <TableItem
          key={index}
          id={item.id}
          when={item.when}
          what={item.what}
          name={name}
          timeStart={item.timeStart}
          timeEnd={item.timeEnd}
        />
      ))}
    </ScrollView>
  );
};

export default Table;
