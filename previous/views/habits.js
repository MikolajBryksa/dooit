import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import Control from '../components/control';
import Focus from '../components/focus';
import List from '../components/list';
import { setHabits, setModalName } from '../redux/actions';
import { getEveryItem } from '../services';
import { styles } from '../styles';

export default function Habits() {
  const habits = useSelector((state) => state.habits);
  const modalName = useSelector((state) => state.modalName);
  const dispatch = useDispatch();
  const [mode, setMode] = useState('stop');
  const [index, setIndex] = useState(0);

  async function fetchData() {
    const data = await getEveryItem('habit');
    dispatch(setHabits(data));
  }

  useEffect(() => {
    fetchData();
  }, [modalName]);

  function handleRun() {
    setMode('run');
  }

  function handleStop() {
    setMode('stop');
    setIndex(0);
  }

  function handleAdd() {
    dispatch(setModalName('habit'));
  }

  function handleDone() {
    if (index < habits.length - 1) {
      setIndex((prevIndex) => prevIndex + 1);
    } else {
      handleStop();
    }
  }

  const renderMode = () => {
    switch (mode) {
      case 'stop':
        return (
          <View style={styles.container}>
            <List initialItems={habits} name='habit' />
            <View style={styles.controllers}>
              <Control type='run' press={handleRun} />
              <Control type='add' press={handleAdd} />
            </View>
          </View>
        );
      case 'run':
        return (
          <View style={styles.container}>
            <Focus habit={habits[index]} />
            <View style={styles.controllers}>
              <Control type='stop' press={handleStop} />
              <Control type='accept' press={handleDone} />
            </View>
          </View>
        );
    }
  };

  return habits && renderMode();
}
