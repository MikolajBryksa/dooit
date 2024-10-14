import React, {useEffect, useState} from 'react';
import {ScrollView} from 'react-native';

import Note from './note';
import {updateItem} from '../services';
import {styles} from '../styles';

export default function List({initialItems, name}) {
  const [items, setItems] = useState(initialItems);

  async function fetchData(items) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await updateItem(name, item.id, item.when, item.what);
    }
  }

  const onDragEnd = result => {
    if (!result.destination) return;
    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);

    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      when: index + 1,
    }));
    setItems(updatedItems);
    fetchData(updatedItems);
  };

  useEffect(() => {
    const updatedItems = initialItems.map((item, index) => ({
      ...item,
      when: index + 1,
    }));
    setItems(updatedItems);
    fetchData(updatedItems);
  }, [initialItems]);

  return (
    <ScrollView style={styles.scrollView}>
      <DragDropContext onDragEnd={result => onDragEnd(result, items, setItems)}>
        <Droppable droppableId="droppable">
          {provided => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {items.map((item, index) => (
                <Draggable
                  key={item.id}
                  draggableId={item.id.toString()}
                  index={index}>
                  {provided => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}>
                      <Note
                        key={index}
                        id={item.id}
                        when={item.when}
                        what={item.what}
                        name={name}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </ScrollView>
  );
}
