import React from 'react';
import {ScrollView} from 'react-native';
import Note from './Note';
import {styles} from '../styles';

const Table = ({items, name}) => {
  return (
    <ScrollView style={styles.scrollView}>
      {items.map((item, index) => (
        <Note
          key={index}
          id={item.id}
          when={item.when}
          what={item.what}
          name={name}
        />
      ))}
    </ScrollView>
  );
};

export default Table;
